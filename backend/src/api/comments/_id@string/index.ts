import type { Comment } from '../../@types';

export type Methods = {
  put: {
    reqBody: {
      content: string;
    };
    resBody: Comment;
  };
  delete: {
    resBody: { message: string };
  };
};

export default Methods;