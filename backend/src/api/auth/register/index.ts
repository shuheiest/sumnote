import type { AuthResponse, RegisterRequest } from '../../@types';

export type Methods = {
  post: {
    reqBody: RegisterRequest;
    resBody: AuthResponse;
  };
};

export default Methods;