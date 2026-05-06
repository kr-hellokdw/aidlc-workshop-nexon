import { useEffect, useRef, useCallback, Dispatch } from 'react';
import { config } from '@/common/config';
import { DashboardAction } from '../types';

const MAX_RECONNECTS = 5;
const RECONNECT_DELAY = 3000;

export const useSSE = (dispatch: Dispatch<DashboardAction>) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const baseUrl = config.sseUrl || config.apiUrl;
    const url = `${baseUrl}/api/admin/sse/subscribe?token=${encodeURIComponent(token)}`;

    const es = new EventSource(url);

    es.addEventListener('NEW_ORDER', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      dispatch({ type: 'NEW_ORDER', payload: data });
    });

    es.addEventListener('ORDER_STATUS_CHANGED', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      dispatch({ type: 'ORDER_STATUS_CHANGED', payload: data });
    });

    es.addEventListener('ORDER_DELETED', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      dispatch({ type: 'ORDER_DELETED', payload: data });
    });

    es.addEventListener('SESSION_COMPLETED', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      dispatch({ type: 'SESSION_COMPLETED', payload: data });
    });

    es.addEventListener('HEARTBEAT', () => {
      // 연결 유지 확인 - UI 변경 없음
    });

    es.onopen = () => {
      reconnectCountRef.current = 0;
      dispatch({ type: 'SSE_CONNECTED' });
    };

    es.onerror = () => {
      es.close();
      dispatch({ type: 'SSE_DISCONNECTED' });

      if (reconnectCountRef.current < MAX_RECONNECTS) {
        reconnectCountRef.current++;
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY);
      }
    };

    eventSourceRef.current = es;
  }, [dispatch]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    reconnect: () => {
      disconnect();
      reconnectCountRef.current = 0;
      connect();
    },
  };
};
