export const generateSlug = (text: string): string => {
  return text
    .trim()
    .replace(/\s+/g, '-') // فاصله‌ها → -
    .replace(/[؟?,!؛؛،]/g, '') // حذف علائم نگارشی
    .toLowerCase();
};

export const OtpCookieOptions = () => {
  return {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 2),
  };
};

export const randomId = () => Math.random().toString(36).substring(2);
