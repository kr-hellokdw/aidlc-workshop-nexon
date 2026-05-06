import { useEffect, useRef, useCallback, Dispatch } from 'react';
import { config } from '@/common/config';
import { DashboardAction } from '../types';

const MAX_RECONNECTS = 5;
const RECONNECT_DELAY = 3000;

export const useSSE = (dispatch: Dispatch<DashboardAction>) => {
  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const baseUrl = config.sseUrl || config.apiUrl || '';
    const url = `${baseUrl}/api/admin/sse/subscribe`;

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
        },
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`SSE connection failed: ${response.status}`);
      }

      reconnectCountRef.current = 0;
      dispatch({ type: 'SSE_CONNECTED' });

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let currentEvent = '';
        let currentData = '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEvent = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            currentData = line.slice(5).trim();
          } else if (line === '' && currentEvent && currentData) {
            handleEvent(currentEvent, currentData, dispatch);
            currentEvent = '';
            currentData = '';
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;

      dispatch({ type: 'SSE_DISCONNECTED' });

      if (reconnectCountRef.current < MAX_RECONNECTS) {
        reconnectCountRef.current++;
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY);
      }
    }
  }, [dispatch]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
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

function handleEvent(event: string, data: string, dispatch: Dispatch<DashboardAction>) {
  try {
    const parsed = JSON.parse(data);
    switch (event) {
      case 'NEW_ORDER':
        dispatch({ type: 'NEW_ORDER', payload: parsed });
        break;
      case 'ORDER_STATUS_CHANGED':
        dispatch({ type: 'ORDER_STATUS_CHANGED', payload: parsed });
        break;
      case 'ORDER_DELETED':
        dispatch({ type: 'ORDER_DELETED', payload: parsed });
        break;
      case 'SESSION_COMPLETED':
        dispatch({ type: 'SESSION_COMPLETED', payload: parsed });
        break;
      case 'HEARTBEAT':
        // 연결 유지 확인
        break;
    }
  } catch {
    // JSON 파싱 실패 무시 (heartbeat 등)
  }
}
