import type { Audio, UploadResponse } from '../@types';

export type Methods = {
  get: {
    resBody: Audio[];
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