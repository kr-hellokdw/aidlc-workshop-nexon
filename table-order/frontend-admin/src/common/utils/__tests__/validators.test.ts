import { describe, it, expect } from 'vitest';
import { validators } from '../validators';

describe('validators', () => {
  describe('required', () => {
    it('빈 문자열이면 에러 메시지를 반환한다', () => {
      expect(validators.required('')).toBe('필수 입력 항목입니다');
    });

    it('공백만 있으면 에러 메시지를 반환한다', () => {
      expect(validators.required('   ')).toBe('필수 입력 항목입니다');
    });

    it('값이 있으면 null을 반환한다', () => {
      expect(validators.required('hello')).toBeNull();
    });
  });

  describe('minLength', () => {
    it('최소 길이 미만이면 에러 메시지를 반환한다', () => {
      expect(validators.minLength(4)('abc')).toBe('최소 4자 이상 입력해주세요');
    });

    it('최소 길이 이상이면 null을 반환한다', () => {
      expect(validators.minLength(4)('abcd')).toBeNull();
    });
  });

  describe('maxPrice', () => {
    it('1,000,000 초과이면 에러 메시지를 반환한다', () => {
      expect(validators.maxPrice(1_000_001)).toBe('가격은 1,000,000원 이하여야 합니다');
    });

    it('1,000,000 이하이면 null을 반환한다', () => {
      expect(validators.maxPrice(1_000_000)).toBeNull();
    });
  });

  describe('positiveNumber', () => {
    it('0이면 에러 메시지를 반환한다', () => {
      expect(validators.positiveNumber(0)).toBe('0보다 큰 값을 입력해주세요');
    });

    it('음수이면 에러 메시지를 반환한다', () => {
      expect(validators.positiveNumber(-1)).toBe('0보다 큰 값을 입력해주세요');
    });

    it('양수이면 null을 반환한다', () => {
      expect(validators.positiveNumber(1)).toBeNull();
    });
  });

  describe('imageFile', () => {
    it('허용되지 않는 파일 형식이면 에러 메시지를 반환한다', () => {
      const file = new File([''], 'test.gif', { type: 'image/gif' });
      expect(validators.imageFile(file)).toBe('지원하지 않는 파일 형식입니다 (jpg/png/webp)');
    });

    it('5MB 초과이면 에러 메시지를 반환한다', () => {
      const file = new File([new ArrayBuffer(6 * 1024 * 1024)], 'test.jpg', {
        type: 'image/jpeg',
      });
      expect(validators.imageFile(file)).toBe('파일 크기는 5MB 이하여야 합니다');
    });

    it('유효한 이미지 파일이면 null을 반환한다', () => {
      const file = new File(['data'], 'test.png', { type: 'image/png' });
      expect(validators.imageFile(file)).toBeNull();
    });
  });

  describe('passwordMatch', () => {
    it('비밀번호가 일치하지 않으면 에러 메시지를 반환한다', () => {
      expect(validators.passwordMatch('1234', '5678')).toBe('비밀번호가 일치하지 않습니다');
    });

    it('비밀번호가 일치하면 null을 반환한다', () => {
      expect(validators.passwordMatch('1234', '1234')).toBeNull();
    });
  });
});
