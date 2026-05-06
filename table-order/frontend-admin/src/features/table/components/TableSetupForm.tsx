import { useState, FormEvent } from 'react';
import { validators } from '@/common/utils/validators';

interface TableSetupFormProps {
  initialData?: { tableNumber: number };
  onSubmit: (data: { tableNumber: number; password: string }) => Promise<void>;
  onCancel: () => void;
  title: string;
}

export const TableSetupForm = ({ initialData, onSubmit, onCancel, title }: TableSetupFormProps) => {
  const [tableNumber, setTableNumber] = useState(initialData?.tableNumber?.toString() || '');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const numError = validators.required(tableNumber);
    if (numError) newErrors.tableNumber = numError;
    else if (isNaN(Number(tableNumber)) || Number(tableNumber) <= 0) {
      newErrors.tableNumber = '유효한 테이블 번호를 입력해주세요';
    }

    const pwError = validators.minLength(4)(password);
    if (pwError) newErrors.password = pwError;

    const matchError = validators.passwordMatch(password, passwordConfirm);
    if (matchError) newErrors.passwordConfirm = matchError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({ tableNumber: Number(tableNumber), password });
    } catch {
      // 에러는 상위에서 toast로 처리
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="table-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="table-form-title">{title}</h2>
          <button onClick={onCancel} className="modal-close" aria-label="닫기">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="tableNumber">테이블 번호</label>
              <input
                id="tableNumber"
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                disabled={submitting}
                aria-describedby={errors.tableNumber ? 'tableNumber-error' : undefined}
              />
              {errors.tableNumber && (
                <span id="tableNumber-error" className="field-error" role="alert">
                  {errors.tableNumber}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">비밀번호 (태블릿 잠금용, 4자리 이상)</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                autoComplete="new-password"
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && (
                <span id="password-error" className="field-error" role="alert">
                  {errors.password}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="passwordConfirm">비밀번호 확인</label>
              <input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                disabled={submitting}
                autoComplete="new-password"
                aria-describedby={errors.passwordConfirm ? 'passwordConfirm-error' : undefined}
              />
              {errors.passwordConfirm && (
                <span id="passwordConfirm-error" className="field-error" role="alert">
                  {errors.passwordConfirm}
                </span>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              취소
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
