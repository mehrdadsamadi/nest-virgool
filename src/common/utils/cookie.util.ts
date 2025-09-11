export function OtpCookieOptions() {
  return {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 2),
  };
}
