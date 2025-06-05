import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../@types';

export type Methods = {
  get: {
    resBody: User;
  };
};

export default Methods;