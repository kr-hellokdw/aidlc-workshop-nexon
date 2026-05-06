import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import styles from './TableSetupPage.module.css';

export function TableSetupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [storeId, setStoreId] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!storeId || !tableNumber || !password) {
      setError('모든 필드를 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      await login(Number(storeId), Number(tableNumber), password);
      navigate('/menu', { replace: true });
    } catch {
      setError('로그인에 실패했습니다. 정보를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>🍽️ 테이블 설정</h1>
        <p className={styles.subtitle}>태블릿 초기 설정을 진행합니다</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>매장 ID</label>
            <input
              type="number"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className={styles.input}
              placeholder="매장 식별번호"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>테이블 번호</label>
            <input
              type="number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className={styles.input}
              placeholder="테이블 번호"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="기기 잠금 비밀번호"
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? '설정 중...' : '설정 완료'}
          </button>
        </form>
      </div>
    </div>
  );
}
