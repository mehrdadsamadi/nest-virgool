export enum BadRequestMessage {
  InvalidLoginData = 'اطلاعات ارسال شده برای ورود صحیح نمیباشد.',
  InvalidRegisterData = 'اطلاعات ارسال شده برای ثبت نام صحیح نمیباشد.',
  SomethingWentWrong = 'خطایی رخ داده است ، دوباره تلاش کنید.',
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
export enum NotFoundMessage {
  NotFound = 'موردی یافت نشد.',
  Category = 'دسته بندی یافت نشد.',
}
export enum ValidationMessage {
  InvalidImageFormat = 'فرمت تصویر بارگذاری شده باید از نوع jpg , png باشد.',
  InvalidEmailFormat = 'ایمیل وارد شده صحیح نمیباشد.',
  InvalidPhoneFormat = 'شماره موبایل وارد شده صحیح نمیباشد.',
}
export enum PublicMessage {
  Created = 'با موفقیت ایجاد شد.',
  Updated = 'با موفقیت ویرایش شد.',
  Deleted = 'با موفقیت حذف شد.',
  SentOpt = 'کد تایید ارسال شد.',
}
export enum ConflictMessage {
  Category = 'عنوان دسته بندی قبلا ثبت شده است.',
  Email = 'این ایمیل توسط شخص دیگری استفاده شده است.',
}
