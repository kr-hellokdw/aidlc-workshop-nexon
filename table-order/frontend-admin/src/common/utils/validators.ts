export const validators = {
  required: (value: string): string | null =>
    value.trim() ? null : '필수 입력 항목입니다',

  minLength:
    (min: number) =>
    (value: string): string | null =>
      value.length >= min ? null : `최소 ${min}자 이상 입력해주세요`,

  maxPrice: (value: number): string | null =>
    value <= 1_000_000 ? null : '가격은 1,000,000원 이하여야 합니다',

  positiveNumber: (value: number): string | null =>
    value > 0 ? null : '0보다 큰 값을 입력해주세요',

  imageFile: (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type))
      return '지원하지 않는 파일 형식입니다 (jpg/png/webp)';
    if (file.size > 5 * 1024 * 1024) return '파일 크기는 5MB 이하여야 합니다';
    return null;
  },

  passwordMatch: (password: string, confirm: string): string | null =>
    password === confirm ? null : '비밀번호가 일치하지 않습니다',
};
