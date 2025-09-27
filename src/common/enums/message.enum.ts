export enum BadRequestMessage {
  InvalidLoginData = 'اطلاعات ارسال شده برای ورود صحیح نمیباشد.',
  InvalidRegisterData = 'اطلاعات ارسال شده برای ثبت نام صحیح نمیباشد.',
  SomethingWentWrong = 'خطایی رخ داده است ، دوباره تلاش کنید.',
  AlreadyAcceptedComment = 'این کامنت قبلا تایید شده است',
  AlreadyRejectedComment = 'این کامنت قبلا رد شده است',
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
  InvalidUsernameLength = 'نام کاربری باید بین ۳ تا ۱۰۰ کاراکتر باشد.',
}
export enum PublicMessage {
  Created = 'با موفقیت ایجاد شد.',
  Updated = 'با موفقیت ویرایش شد.',
  Deleted = 'با موفقیت حذف شد.',
  SentOpt = 'کد تایید ارسال شد.',
  Like = 'با موفقیت لایک شد',
  Dislike = 'لایک شما برداشته شد',
  Bookmark = 'با موفقیت ذخیره شد',
  UnBookmark = 'از لیست ذخیره ها برداشته شد',
  CreatedComment = 'نظر شما با موفقیت ثبت شد',
}
export enum ConflictMessage {
  Category = 'عنوان دسته بندی قبلا ثبت شده است.',
  Email = 'این ایمیل توسط شخص دیگری استفاده شده است.',
  Phone = 'این شماره موبایل توسط شخص دیگری استفاده شده است.',
  Username = 'این نام کاربری توسط شخص دیگری استفاده شده است.',
}
