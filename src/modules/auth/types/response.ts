export type AuthResponse = {
  code: string;
  token: string;
};

export type GoogleUser = {
  firstName?: string;
  lastName?: string;
  email: string;
  profileImage: string;
  accessToken: string;
};
