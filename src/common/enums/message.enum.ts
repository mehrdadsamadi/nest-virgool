export enum BadRequestMessage {
  InvalidLoginData = 'اطلاعات ارسال شده برای ورود صحیح نمیباشد.',
  InvalidRegisterData = 'اطلاعات ارسال شده برای ثبت نام صحیح نمیباشد.',
}
export enum AuthMessage {
  NotFoundAccount = 'حساب کاربری یافت نشد.',
  AlreadyExistAccount = 'حساب کاربری با این مشخصات قبلا ثبت شده است.',
  ExpiredCode = 'کد تایید منقضی شده است، مجددا تلاش کنید.',
  TryAgain = 'مجددا تلاش کنید.',
  LoginAgain = 'مجددا وارد حساب کاربری خود شوید.',
  IncorrectOtpCode = 'کد وارد شده صحیح نمیباشد.',
  RequiredLogin = 'وارد حساب کاربری خود شوید.',
}
export enum NotFoundMessage {}
export enum ValidationMessage {}
