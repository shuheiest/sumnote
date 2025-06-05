import type { AuthResponse, LoginRequest } from '../../@types';

export type Methods = {
  post: {
    reqBody: LoginRequest;
    resBody: AuthResponse;
  };
};

export default Methods;