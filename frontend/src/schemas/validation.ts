import * as yup from 'yup';

// ドキュメントアップロード用バリデーションスキーマ
export const documentUploadSchema = yup.object({
  title: yup
    .string()
    .required('タイトルは必須です')
    .min(1, 'タイトルを入力してください')
    .max(100, 'タイトルは100文字以下で入力してください'),
  description: yup
    .string()
    .max(500, '説明は500文字以下で入力してください'),
  file: yup
    .mixed<File>()
    .required('PDFファイルを選択してください')
    .test('fileType', 'PDFファイルのみアップロード可能です', (value) => {
      if (!value) return false;
      return value.type === 'application/pdf';
    })
    .test('fileSize', 'ファイルサイズは10MB以下にしてください', (value) => {
      if (!value) return false;
      return value.size <= 10 * 1024 * 1024; // 10MB
    }),
});

// 音声アップロード用バリデーションスキーマ
export const audioUploadSchema = yup.object({
  title: yup
    .string()
    .required('タイトルは必須です')
    .min(1, 'タイトルを入力してください')
    .max(100, 'タイトルは100文字以下で入力してください'),
  description: yup
    .string()
    .max(500, '説明は500文字以下で入力してください'),
  file: yup
    .mixed<File>()
    .required('音声ファイルを選択してください')
    .test('fileType', 'MP3ファイルのみアップロード可能です', (value) => {
      if (!value) return false;
      return value.type === 'audio/mpeg' || value.type === 'audio/mp3';
    })
    .test('fileSize', 'ファイルサイズは50MB以下にしてください', (value) => {
      if (!value) return false;
      return value.size <= 50 * 1024 * 1024; // 50MB
    }),
});

// コメント用バリデーションスキーマ
export const commentSchema = yup.object({
  content: yup
    .string()
    .required('コメントを入力してください')
    .min(1, 'コメントを入力してください')
    .max(1000, 'コメントは1000文字以下で入力してください'),
});

// ログイン用バリデーションスキーマ
export const loginSchema = yup.object({
  email: yup
    .string()
    .required('メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),
  password: yup
    .string()
    .required('パスワードは必須です')
    .min(6, 'パスワードは6文字以上で入力してください'),
});

// ユーザー登録用バリデーションスキーマ
export const registerSchema = yup.object({
  name: yup
    .string()
    .required('名前は必須です')
    .min(1, '名前を入力してください')
    .max(50, '名前は50文字以下で入力してください'),
  email: yup
    .string()
    .required('メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),
  password: yup
    .string()
    .required('パスワードは必須です')
    .min(6, 'パスワードは6文字以上で入力してください')
    .max(100, 'パスワードは100文字以下で入力してください'),
  confirmPassword: yup
    .string()
    .required('パスワード確認は必須です')
    .oneOf([yup.ref('password')], 'パスワードが一致しません'),
});

// 型定義
export type DocumentUploadFormData = yup.InferType<typeof documentUploadSchema>;
export type AudioUploadFormData = yup.InferType<typeof audioUploadSchema>;
export type CommentFormData = yup.InferType<typeof commentSchema>;
export type LoginFormData = yup.InferType<typeof loginSchema>;
export type RegisterFormData = yup.InferType<typeof registerSchema>;