# KONPA - 大学生向け合コンマッチングアプリ

大学生がグループで合コンをセッティングするマッチングアプリです。

## 機能

- ユーザー登録（メール認証）
- グループ作成と友人招待
- マッチング条件入力（日時・エリア・予算）
- 自動マッチング（異性グループのマッチング）
- Stripe による決済
- リアルタイム通知

## プロジェクト構成

```
konpa/
├── frontend/           # React フロントエンド
│   ├── public/
│   ├── src/
│   │   ├── components/  # React コンポーネント
│   │   ├── services/    # Firebase、Stripe サービス
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── .env.example
├── functions/          # Firebase Cloud Functions
│   ├── matching.js     # 自動マッチング
│   ├── payment.js      # 決済完了処理
│   └── package.json
└── README.md
```

## セットアップ

### 前提条件
- Node.js 16+
- npm または yarn
- Firebase CLI
- Git

### インストール

1. リポジトリをクローン
```bash
git clone https://github.com/[ユーザー名]/konpa.git
cd konpa
```

2. フロントエンド依存関係をインストール
```bash
cd frontend
npm install
```

3. バックエンド依存関係をインストール
```bash
cd ../functions
npm install
```

### 環境変数の設定

`frontend/.env` を作成し、Firebase と Stripe の API キーを設定：

```
REACT_APP_FIREBASE_API_KEY=xxxxx
REACT_APP_FIREBASE_AUTH_DOMAIN=konpa-app.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=konpa-app
REACT_APP_FIREBASE_STORAGE_BUCKET=konpa-app.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=xxxxx
REACT_APP_FIREBASE_APP_ID=xxxxx
REACT_APP_STRIPE_KEY=pk_test_xxxxx
```

### ローカル開発

フロントエンドを起動：
```bash
cd frontend
npm start
```

ブラウザで `http://localhost:3000` を開く

### デプロイ

#### Firebase Hosting にデプロイ
```bash
cd frontend
npm run build

firebase login
firebase init hosting
firebase deploy --only hosting
```

#### Cloud Functions をデプロイ
```bash
cd functions
firebase deploy --only functions
```

## アーキテクチャ

- **フロントエンド**: React + Firebase SDK
- **バックエンド**: Firebase Firestore + Cloud Functions
- **決済**: Stripe API
- **認証**: Firebase Authentication

## セキュリティルール

Firestore のセキュリティルールは以下の通り設定：

- ユーザーは自分のデータのみ読み書き可能
- グループメンバーのみグループ情報を読み書き可能
- 店舗データは全員読み取り可能（書き込み不可）

## トラブルシューティング

### npm install エラー
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Firebase ログイン失敗
```bash
firebase logout
firebase login
```

### Cloud Functions デプロイエラー
```bash
firebase deploy --only functions --debug
```

## ライセンス

MIT

## 作者

KONPA Team
