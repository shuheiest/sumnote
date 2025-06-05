import type { Comment, CreateCommentRequest } from '../@types';

export type Methods = {
  get: {
    query?: {
      documentId?: string;
      audioId?: string;
      authorId?: string;
    };
    resBody: Comment[];
  };
  post: {
    reqBody: CreateCommentRequest;
    resBody: Comment;
  };
};

export default Methods;