# AI Website LP

「AIで動くWebサイトが作れるようになる」ことを伝える、縦長・ダークテーマのランディングページです。

## 技術スタック

- React 18 + TypeScript
- Vite
- Tailwind CSS v4(`@tailwindcss/vite`)
- Framer Motion(スクロール連動アニメーション)
- lucide-react(アイコン)

## セットアップ

```bash
npm install
npm run dev
```

`npm run dev` 実行後、`http://localhost:5173/` で表示されます。

## 構成

1. **Hero** — 大見出し + ガラス風の固定ナビ + CTA。背景はゆっくり拡大するダークグラデーション(プレースホルダー)
2. **ShowcaseMarquee** — 作例画像が横に無限スクロールする帯
3. **GlowScrollText** — スクロールに連動して1文字ずつ光っていく一言
4. **StackCards** — スクロールでカードが重なりながら縮んでいく作例紹介
5. **Steps** — 白背景の3ステップ説明
6. **FinalCTA** — 最後の呼びかけ

## 画像の差し替え

画像はすべて `public/` に置いたダークグラデーションのSVGで仮置きしています。実画像に差し替える場合は `src/content/images.ts` のパスを変更してください。

```ts
// src/content/images.ts
export const HERO_IMAGE = '/hero-placeholder.svg' // → '/hero.png' に変更 + public/hero.png を配置
export const SHOWCASE_IMAGES = [
  '/showcase-1.svg', // → '/showcase-1.jpg' など
  // ...
]
```

`HERO_IMAGE` は `Hero.tsx` 内で `scale: 1 → 1.15` のゆっくりとしたズームアニメーションが既にかかっているため、画像を差し替えるだけで背景が動き出します。
