import type { Document } from '../../@types';

export type Methods = {
  get: {
    resBody: Document;
  };
  put: {
    reqBody: {
      title?: string;
      description?: string;
    };
    resBody: Document;
  };
  delete: {
    resBody: { message: string };
  };
};

export default Methods;