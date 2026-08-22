# wishlist-app

欲しいものを登録して購入状況を管理する Next.js のWebアプリです。本番環境ではSupabase Authを利用し、ログインしたユーザーごとにデータと画像を分離します。

## 技術スタック

- Next.js App Router
- TypeScript
- Tailwind CSS
- Radix UI
- Supabase Auth / Database / Storage

## セットアップ

依存パッケージをインストールします。

```bash
npm install
```

本番ビルドまたはVercelでSupabaseへ接続する場合は、`.env.local` またはVercelのEnvironment Variablesに以下を設定します。値そのものはリポジトリへ登録しないでください。

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

`SUPABASE_SECRET_KEY` はこのアプリの通常動作には使用しません。Service Role Keyを設定する場合でも、`NEXT_PUBLIC_` を付けず、クライアントコードへ渡さないでください。

## 開発サーバーの起動

```bash
npm run dev
```

起動後は http://localhost:3000 を開きます。

### ローカルモック

`npm run dev` で動く開発環境は、Supabase Auth / Database / Storageへ接続しません。ログイン情報、欲しいもの、圧縮後の画像はブラウザの `localStorage` にだけ保存されるため、本番データは更新されません。

- `@` を含むメールアドレスと8文字以上のパスワードで疑似ログインできます。
- ローカルでは「ログイン」と「新規登録」はどちらも疑似セッションを作成します。確認メールは送信されません。
- 欲しいものは疑似ログインしたメールアドレスごとに分離されます。
- リロード後も同じブラウザでは疑似セッションとデータが維持されます。
- ブラウザのサイトデータを削除すると、ローカルの疑似データも削除されます。

`npm run build` で作成する本番ビルドとVercelデプロイでは、既存のSupabase Auth / Database / Storageを使用します。

## 本番環境の新規登録とログイン

1. `/login` で「新規登録」を選び、メールアドレスと8文字以上のパスワードを入力します。
2. Supabase Authでメール確認を有効にしている場合は、届いた確認メール内のリンクを開きます。
3. 登録済みのメールアドレスとパスワードでログインします。
4. 画面右上の「ログアウト」からセッションを終了できます。

メール確認リンクを使う場合は、Supabase Dashboardの **Authentication > URL Configuration** で以下をRedirect URLに登録してください。

```text
http://localhost:3000/auth/callback
https://<Vercelの本番ドメイン>/auth/callback
```

## Supabase側の設定

`supabase/migrations/20260820000000_add_auth_to_wishlist.sql` は、次を設定します。

- `todos.user_id` をAuthユーザーに紐付ける外部キーとして追加
- `todos` のRLS有効化と、本人のSELECT / INSERT / UPDATE / DELETEだけを許可するポリシー
- `wishlist-images` bucketを非公開化
- 新しい画像を `wishlist-images/{user_id}/...` に限定するStorageポリシー
- 自分の画像だけを読み取り・削除できるStorageポリシー

Supabase CLIを使う場合は、プロジェクトをリンクしてから適用します。

```bash
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
```

DashboardのSQL Editorを使う場合は、マイグレーションファイルの内容を実行してください。Storage bucketが存在しない場合は、先に既存の画像用マイグレーション `20260817001000_add_image_url_to_todos.sql` を適用してください。

## 既存データの移行

このマイグレーションは、既存行を削除しません。既存行の `user_id` は `null` のまま残り、RLSにより誰の一覧にも表示されなくなります。

開発者アカウントへ既存データを紐付ける場合は、Supabase Dashboardで対象ユーザーのUUIDを確認し、次のSQLのプレースホルダーを置き換えて実行してください。

```sql
update public.todos
set user_id = '<MY_USER_ID>'
where user_id is null;
```

すべての既存行を割り当てた後に、`user_id` を必須にしたい場合は次を実行できます。

```sql
alter table public.todos
alter column user_id set not null;
```

以前にユーザーIDなしのパスでアップロードした画像は、本人の行に紐付いていれば移行後も読取・削除できます。`image_path` がない古い画像は再アップロードしてください。

## よく使うコマンド

```bash
npm run lint
npx tsc --noEmit
npm run build
```

`npm run build` は、この環境でも安定して確認できるように Webpack を使う設定にしています。
