import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDateTime, formatTime } from '../formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('금액을 원화 형식으로 포맷한다', () => {
      expect(formatCurrency(9000)).toBe('₩9,000');
    });

    it('큰 금액도 올바르게 포맷한다', () => {
      expect(formatCurrency(1000000)).toBe('₩1,000,000');
    });

    it('0원을 포맷한다', () => {
      expect(formatCurrency(0)).toBe('₩0');
    });
  });

  describe('formatDateTime', () => {
    it('ISO 문자열을 한국 날짜/시간 형식으로 포맷한다', () => {
      const result = formatDateTime('2026-05-06T12:30:00');
      expect(result).toContain('2026');
      expect(result).toContain('05');
      expect(result).toContain('06');
      expect(result).toContain('12');
      expect(result).toContain('30');
    });
  });

  describe('formatTime', () => {
    it('ISO 문자열에서 시간만 추출하여 포맷한다', () => {
      const result = formatTime('2026-05-06T14:30:00');
      expect(result).toContain('14');
      expect(result).toContain('30');
    });
  });
});
