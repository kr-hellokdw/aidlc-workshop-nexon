import { useState } from 'react';
import { useTableManagement } from '../hooks/useTableManagement';
import { TableSetupForm } from './TableSetupForm';
import { OrderHistoryModal } from './OrderHistoryModal';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';
import { TableInfo } from '../types';

export const TableManagementPage = () => {
  const { tables, loading, createTable, updateTable, deleteTable, completeSession } =
    useTableManagement();

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<TableInfo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TableInfo | null>(null);
  const [completeTarget, setCompleteTarget] = useState<TableInfo | null>(null);
  const [historyTarget, setHistoryTarget] = useState<TableInfo | null>(null);

  const handleCreate = async (data: { tableNumber: number; password: string }) => {
    await createTable(data);
    setShowForm(false);
  };

  const handleUpdate = async (data: { tableNumber: number; password: string }) => {
    if (editTarget) {
      await updateTable(editTarget.tableId, data);
      setEditTarget(null);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteTable(deleteTarget.tableId);
      setDeleteTarget(null);
    }
  };

  const handleComplete = async () => {
    if (completeTarget) {
      await completeSession(completeTarget.tableId);
      setCompleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="page-loading" role="status" aria-label="로딩 중">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="table-management-page">
      <header className="page-header">
        <h1>테이블 관리</h1>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          + 테이블 추가
        </button>
      </header>

      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>테이블</th>
            <th>상태</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {tables.map((table, index) => (
            <tr key={table.tableId}>
              <td>{index + 1}</td>
              <td>{table.tableNumber}번 테이블</td>
              <td>
                <span className={`status-badge ${table.sessionStatus === 'ACTIVE' ? 'badge-active' : 'badge-empty'}`}>
                  {table.sessionStatus === 'ACTIVE' ? '이용중' : '빈자리'}
                </span>
              </td>
              <td className="action-cell">
                {table.sessionStatus === 'ACTIVE' ? (
                  <>
                    <button
                      onClick={() => setCompleteTarget(table)}
                      className="btn btn-sm btn-secondary"
                    >
                      완료
                    </button>
                    <button
                      onClick={() => setHistoryTarget(table)}
                      className="btn btn-sm btn-secondary"
                    >
                      내역
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditTarget(table)}
                      className="btn btn-sm btn-secondary"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => setDeleteTarget(table)}
                      className="btn btn-sm btn-danger"
                    >
                      삭제
                    </button>
                    <button
                      onClick={() => setHistoryTarget(table)}
                      className="btn btn-sm btn-secondary"
                    >
                      내역
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {(showForm || editTarget) && (
        <TableSetupForm
          initialData={editTarget ? { tableNumber: editTarget.tableNumber } : undefined}
          onSubmit={editTarget ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditTarget(null);
          }}
          title={editTarget ? '테이블 수정' : '테이블 추가'}
        />
      )}

      {historyTarget && (
        <OrderHistoryModal
          table={historyTarget}
          onClose={() => setHistoryTarget(null)}
        />
      )}

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="테이블 삭제"
        message={`${deleteTarget?.tableNumber}번 테이블을 삭제하시겠습니까?`}
        confirmLabel="삭제"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={completeTarget !== null}
        title="이용 완료 처리"
        message={`${completeTarget?.tableNumber}번 테이블의 세션을 종료합니다. 현재 주문 내역이 과거 이력으로 이동됩니다.`}
        confirmLabel="확인"
        onConfirm={handleComplete}
        onCancel={() => setCompleteTarget(null)}
      />
    </div>
  );
};
