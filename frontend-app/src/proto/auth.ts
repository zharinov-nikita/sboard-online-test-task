export const protobufPackage = "auth";

/** ResendConfirmEmailToken */
export interface ResendConfirmEmailTokenRequest {
  confirmEmail: string;
}

export interface ResendConfirmEmailTokenResponse {
  message: string;
}

/** Registration */
export interface RegistrationRequest {
  email: string;
  password: string;
}

export interface RegistrationResponse {
  id: string;
  email: string;
  isConfirmEmail: boolean;
  confirmEmailToken: string;
  refreshToken: string;
}

/** Authorization */
export interface AuthorizationRequest {
  email: string;
  password: string;
}

export interface AuthorizationResponse {
  user: User | undefined;
  accessToken: string;
}

/** RefreshToken */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/** ValidateAccessToken */
export interface ValidateAccessTokenRequest {
  accessToken: string;
}

export interface ValidateAccessTokenResponse {
  isValid: boolean;
  userId?: string | undefined;
}

/** ResetPassword */
export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface GetUserRequest {
  id: string;
}

export interface UpdateUserRequest {
  id: string;
  email: string;
  password: string;
}

/** ConfirmEmail */
export interface ConfirmEmailRequest {
  confirmEmail: string;
  confirmEmailToken: string;
}

/** User */
export interface User {
  id: string;
  email: string;
  isConfirmEmail: boolean;
  confirmEmailToken: string;
  refreshToken: string;
}

export const AUTH_PACKAGE_NAME = "auth";
