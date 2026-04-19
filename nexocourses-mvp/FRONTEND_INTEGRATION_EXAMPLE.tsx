// src/hooks/useCourseGeneration.ts
// Hook customizado para integrar com API NexoCourses

import { useState } from 'react';

interface BriefingPayload {
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  durationHours: number;
  sourceUrl?: string;
  targetAudience?: string;
  style?: string;
  language?: string;
}

interface GenerationStatus {
  courseId: string;
  title: string;
  status: 'processing' | 'ready' | 'failed';
  progress: number;
  modulesCount: number;
  lessonsCount: number;
  readyLessons: number;
  lessons?: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export function useCourseGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);

  const startGeneration = async (
    briefing: BriefingPayload
  ): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/briefings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(briefing),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = (await response.json()) as { courseId: string };
      setCourseId(data.courseId);

      return data.courseId;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async (
    id: string
  ): Promise<GenerationStatus> => {
    try {
      const response = await fetch(`${API_BASE}/briefings/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = (await response.json()) as GenerationStatus;
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    }
  };

  return {
    loading,
    error,
    courseId,
    startGeneration,
    checkStatus,
  };
}

// ============================================
// src/components/BriefingForm.tsx
// Formulário para criar novo curso

import { useState } from 'react';
import { useCourseGeneration } from '../hooks/useCourseGeneration';

export function BriefingForm() {
  const { loading, error, courseId, startGeneration } =
    useCourseGeneration();

  const [formData, setFormData] = useState({
    topic: '',
    level: 'beginner' as const,
    durationHours: 2,
    sourceUrl: '',
    targetAudience: '',
    style: 'friendly' as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const cId = await startGeneration(formData);
      // Redirecionar para página de progresso
      window.location.href = `/course/${cId}`;
    } catch (err) {
      console.error('Failed to start generation:', err);
    }
  };

  if (courseId) {
    return (
      <div className="alert alert-success">
        <p>Curso criado! ID: {courseId}</p>
        <a href={`/course/${courseId}`}>Ver progresso</a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="form-briefing">
      <h2>Criar Novo Curso</h2>

      <div className="form-group">
        <label htmlFor="topic">Tema do Curso</label>
        <input
          id="topic"
          type="text"
          placeholder="Ex: React Hooks, Python para Iniciantes"
          value={formData.topic}
          onChange={(e) =>
            setFormData({ ...formData, topic: e.target.value })
          }
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="level">Nível</label>
        <select
          id="level"
          value={formData.level}
          onChange={(e) =>
            setFormData({
              ...formData,
              level: e.target.value as 'beginner' | 'intermediate' | 'advanced',
            })
          }
        >
          <option value="beginner">Iniciante</option>
          <option value="intermediate">Intermediário</option>
          <option value="advanced">Avançado</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="duration">Duração (horas)</label>
        <select
          id="duration"
          value={formData.durationHours}
          onChange={(e) =>
            setFormData({
              ...formData,
              durationHours: parseInt(e.target.value),
            })
          }
        >
          <option value="2">2 horas</option>
          <option value="5">5 horas</option>
          <option value="10">10 horas</option>
          <option value="20">20 horas</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="sourceUrl">URL de Referência (opcional)</label>
        <input
          id="sourceUrl"
          type="url"
          placeholder="https://exemplo.com"
          value={formData.sourceUrl}
          onChange={(e) =>
            setFormData({
              ...formData,
              sourceUrl: e.target.value,
            })
          }
        />
      </div>

      <div className="form-group">
        <label htmlFor="audience">Público-alvo (opcional)</label>
        <input
          id="audience"
          type="text"
          placeholder="Ex: Desenvolvedores, Estudantes"
          value={formData.targetAudience}
          onChange={(e) =>
            setFormData({
              ...formData,
              targetAudience: e.target.value,
            })
          }
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Gerando...' : 'Criar Curso'}
      </button>
    </form>
  );
}

// ============================================
// src/components/CourseProgress.tsx
// Página de progresso da geração

import { useEffect, useState } from 'react';
import { useCourseGeneration } from '../hooks/useCourseGeneration';

interface Props {
  courseId: string;
}

export function CourseProgress({ courseId }: Props) {
  const { checkStatus } = useCourseGeneration();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await checkStatus(courseId);
        setStatus(data);

        // Stop polling if complete
        if (data.status === 'ready') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Failed to check status:', err);
      } finally {
        setLoading(false);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [courseId, checkStatus]);

  if (loading) {
    return <div className="spinner">Carregando...</div>;
  }

  if (!status) {
    return <div className="error">Curso não encontrado</div>;
  }

  return (
    <div className="course-progress">
      <h2>{status.title}</h2>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${status.progress}%` }}
        ></div>
      </div>

      <p className="progress-text">
        {status.progress}% concluído ({status.readyLessons}/{status.lessonsCount} aulas prontas)
      </p>

      <div className="lessons-list">
        <h3>Aulas</h3>
        {status.lessons?.map((lesson: any) => (
          <div key={lesson.id} className="lesson-item">
            <span className="lesson-title">{lesson.title}</span>
            <span className={`badge ${lesson.status}`}>
              {lesson.status}
            </span>
          </div>
        ))}
      </div>

      {status.status === 'ready' && (
        <div className="alert alert-success">
          <h3>✅ Curso Pronto!</h3>
          <p>Seu curso foi gerado com sucesso.</p>
          <a href={`/courses/${courseId}`} className="btn-primary">
            Ver Curso
          </a>
        </div>
      )}

      {status.status === 'failed' && (
        <div className="alert alert-error">
          <h3>❌ Erro na Geração</h3>
          <p>Houve um erro ao gerar o curso. Tente novamente.</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// Exemplo de integração em App.tsx

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import { BriefingForm } from './components/BriefingForm';
import { CourseProgress } from './components/CourseProgress';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BriefingForm />} />
        <Route
          path="/course/:courseId"
          element={
            <CourseProgress courseId={new URLSearchParams(window.location.search).get('id') || ''} />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
