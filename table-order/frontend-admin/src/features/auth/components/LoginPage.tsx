import { useState, FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginRequest } from '../types';

export const LoginPage = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginRequest>({
    storeId: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 이미 인증된 경우 대시보드로 리다이렉트
  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.storeId || !formData.username || !formData.password) {
      setError('모든 필드를 입력해주세요');
      return;
    }

    setSubmitting(true);
    try {
      await login(formData);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
        setError(axiosErr.response?.data?.error?.message || '로그인에 실패했습니다');
      } else {
        setError('네트워크 연결을 확인해주세요');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">🍽 테이블오더 관리자</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="storeId">매장 ID</label>
            <input
              id="storeId"
              type="text"
              value={formData.storeId}
              onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
              disabled={submitting}
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">사용자명</label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={submitting}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={submitting}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-message" role="alert">
              ⚠ {error}
            </div>
          )}

          <button type="submit" className="login-button" disabled={submitting}>
            {submitting ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
};
