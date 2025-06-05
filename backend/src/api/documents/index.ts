import type { Document, UploadResponse } from '../@types';

export type Methods = {
  get: {
    resBody: Document[];
  };
  post: {
    reqFormat: FormData;
    reqBody: {
      file: File;
      title: string;
      description?: string;
    };
    resBody: UploadResponse;
  };
};

export default Methods;