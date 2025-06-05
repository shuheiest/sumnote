# SumNote - 音声＆ドキュメント共有ポータル

Gemini等で生成した要約（PDF）と音声（MP3）を、プロジェクトメンバーで共有・閲覧・コメントできるWebサービスです。

## 技術スタック

- **バックエンド**: TypeScript + Express + Prisma + PostgreSQL
- **フロントエンド**: TypeScript + React + Material-UI
- **アーキテクチャ**: ドメイン駆動設計（DDD）

## 前提条件

- Node.js (v18以上)
- npm または yarn
- Docker & Docker Compose

## セットアップ手順

### 1. リポジトリのクローンと依存関係のインストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd sumnote

# バックエンドの依存関係をインストール
cd backend
npm install

# フロントエンドの依存関係をインストール
cd ../frontend
npm install
```

### 2. データベースのセットアップ

```bash
# PostgreSQLデータベースを作成
createdb sumnote_db

# バックエンドディレクトリに移動
cd ../backend

# 環境変数ファイルを作成
cp .env.example .env

# .envファイルを編集してデータベース接続情報を設定
# DATABASE_URL="postgresql://username:password@localhost:5432/sumnote_db"
# JWT_SECRET="your-super-secret-jwt-key"
# PORT=3001
# NODE_ENV="development"
# UPLOAD_DIR="uploads"
```

### 3. Prismaの初期化とマイグレーション

```bash
# Prismaクライアントを生成
npm run prisma:generate

# データベースマイグレーションを実行
npm run prisma:migrate

# 初期データを投入（オプション）
npm run prisma:seed
```

### 4. アップロードディレクトリの作成

```bash
# プロジェクトルートに戻る
cd ..

# アップロード用ディレクトリを作成
mkdir -p uploads/documents
mkdir -p uploads/audio
```

## 起動方法

### Docker環境での起動（推奨）

```bash
# コンテナをバックグラウンドで起動
docker-compose up -d

# ログを確認
docker-compose logs -f

# コンテナを停止
docker-compose down

# データベースも含めて完全に削除
docker-compose down -v
```

- フロントエンド: `http://localhost:3000`
- バックエンド: `http://localhost:3001`
- PostgreSQL: `localhost:5432`

### 開発環境での起動（ローカル環境）

#### 同時起動（推奨）

```bash
# ルートディレクトリで依存関係をインストール
npm install

# バックエンドとフロントエンドを同時起動
npm run dev
```

#### 個別起動

バックエンドサーバーの起動：
```bash
cd backend
npm run dev
```

フロントエンドサーバーの起動：
```bash
cd frontend
npm start
```

- バックエンドサーバー: `http://localhost:3001`
- フロントエンドサーバー: `http://localhost:3000`

### 本番環境での起動

#### バックエンド

```bash
cd backend
npm run build
npm start
```

#### フロントエンド

```bash
cd frontend
npm run build
# ビルドされたファイルをWebサーバー（nginx等）で配信
```

## テストの実行

### バックエンドテスト

```bash
cd backend

# 単体テスト実行
npm test

# テストカバレッジ確認
npm run test:coverage

# テストのwatch モード
npm run test:watch
```

## データベース管理

### Prisma Studio（GUI）の起動

```bash
cd backend
npm run prisma:studio
```

`http://localhost:5555` でPrisma Studioが起動し、データベースの内容をGUIで確認・編集できます。

### マイグレーション関連

```bash
# 新しいマイグレーションを作成
npm run prisma:migrate

# Prismaクライアントを再生成
npm run prisma:generate
```

## 環境変数

### バックエンド (.env)

| 変数名 | 説明 | 例 |
|--------|------|-----|
| DATABASE_URL | PostgreSQL接続URL | postgresql://user:pass@localhost:5432/sumnote_db |
| JWT_SECRET | JWT署名用の秘密鍵 | your-super-secret-jwt-key |
| PORT | サーバーポート番号 | 3001 |
| NODE_ENV | 実行環境 | development / production |
| UPLOAD_DIR | ファイルアップロード先ディレクトリ | uploads |

## API仕様

### 認証

- POST `/api/auth/login` - ログイン
- POST `/api/auth/register` - ユーザー登録
- GET `/api/auth/me` - 現在のユーザー情報取得

### ドキュメント

- GET `/api/documents` - ドキュメント一覧取得
- POST `/api/documents` - ドキュメントアップロード
- GET `/api/documents/:id` - 特定ドキュメント取得
- PUT `/api/documents/:id` - ドキュメント更新
- DELETE `/api/documents/:id` - ドキュメント削除

### 音声

- GET `/api/audios` - 音声ファイル一覧取得
- POST `/api/audios` - 音声ファイルアップロード
- GET `/api/audios/:id` - 特定音声ファイル取得
- PUT `/api/audios/:id` - 音声ファイル更新
- DELETE `/api/audios/:id` - 音声ファイル削除

### コメント

- GET `/api/comments` - コメント一覧取得
- POST `/api/comments` - コメント作成
- PUT `/api/comments/:id` - コメント更新
- DELETE `/api/comments/:id` - コメント削除

## ディレクトリ構造

```
sumnote/
├── backend/                 # バックエンドアプリケーション
│   ├── src/
│   │   ├── domain/         # ドメイン層
│   │   ├── infrastructure/ # インフラストラクチャ層
│   │   ├── application/    # アプリケーション層
│   │   └── presentation/   # プレゼンテーション層
│   ├── tests/              # テストファイル
│   └── prisma/             # Prismaスキーマとマイグレーション
├── frontend/               # フロントエンドアプリケーション
│   └── src/
│       ├── components/     # Reactコンポーネント
│       ├── pages/          # ページコンポーネント
│       ├── hooks/          # カスタムフック
│       ├── services/       # API呼び出し関数
│       └── types/          # TypeScript型定義
└── uploads/                # アップロードファイル保存先
    ├── documents/
    └── audio/
```

## 開発時の注意事項

1. **コード品質**: ESLintとTypeScriptの型チェックを必ず通すこと
2. **テストカバレッジ**: バックエンドは95%以上のテストカバレッジを維持すること
3. **セキュリティ**: 認証が必要なAPIには適切な認証チェックを実装すること
4. **ファイルサイズ**: アップロードファイルのサイズ制限を適切に設定すること

## トラブルシューティング

### Docker関連

#### コンテナが起動しない場合
```bash
# ログを確認
docker-compose logs

# イメージを再ビルド
docker-compose build --no-cache

# 古いコンテナとイメージを削除
docker-compose down
docker system prune -a
```

#### データベース関連のエラー
```bash
# データベースコンテナを再作成
docker-compose down
docker volume rm sumnote_postgres_data
docker-compose up -d
```

### ローカル環境

#### データベース接続エラー

1. PostgreSQLサービスが起動しているか確認
2. .envファイルのDATABASE_URLが正しいか確認
3. データベースが存在するか確認

#### ポート番号の競合

- バックエンド（3001）、フロントエンド（3000）のポートが使用中の場合、.envファイルで変更可能

#### ファイルアップロードエラー

- uploadsディレクトリの権限を確認
- ファイルサイズ制限を確認
- 対応ファイル形式を確認（PDF、MP3）