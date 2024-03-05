# Suggestion box

Suggestion box for Project Trans's website.

## Usage

```bash
# Or npm, yarn, bun, etc.
pnpm add @project-trans/suggestion-box
pnpm add @iconify-json/octicon -D # Suggestion Box uses octicon.
```

In your Vue component:

```vue
<template>
  <SuggestionBox
    target-url="https://example.com"
    contact-content-placeholder="联系方式占位符"
    text-content-placeholder="文本内容占位符"
    attach-image-button-text="附加图片按钮文案"
    send-button-text="发送按钮文案"
    sending-button-text="发送中按钮文案"
    sent-success-button-text="发送成功按钮文案"
    sent-failed-button-text="发送失败按钮文案"
  />
</template>

<script>
import SuggestionBox from '@project-trans/suggestion-box';
import '@project-trans/suggestion-box/dist/style.css';
</script>
```

In `uno.config.ts`:

```ts
import { defineConfig, presetUno, presetIcons } from 'unocss';
import presetSBox from '@project-trans/suggestion-box/dist/preset';

export default defineConfig({
  // ...
  content: {
    pipeline: {
      include: [
        // Default match pattern of UnoCSS
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        // Match suggestion-box
        /.*pjts-suggestion-box.*\.js/,
      ],
    },
  },
  presets: [
    // SuggestionBox uses presetUno
    presetUno(),
    // SuggestionBox uses presetIcons
    presetIcons(),
    // SuggestionBox's own rules
    presetSBox(),
  ],
});
```

## Development

```bash
corepack enable
```

### Install dependencies

```bash
pnpm install
```

### Start UI development server

```bash
pnpm dev
```

### Start Cloudflare Pages Functions development server

```bash
pnpm -F server dev
```
