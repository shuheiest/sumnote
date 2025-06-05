import type { Audio } from '../../@types';

export type Methods = {
  get: {
    resBody: Audio;
  };
  put: {
    reqBody: {
      title?: string;
      description?: string;
    };
    resBody: Audio;
  };
  delete: {
    resBody: { message: string };
  };
};

export default Methods;