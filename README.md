# Suggestion box

Suggestion box for Project Trans's website.

## Usage

```bash
# Or npm, yarn, bun, etc.
pnpm add pjts-suggestion-box
pnpm add @iconify-json/mdi -D # Suggestion Box uses MDI.
```

In your Vue component:

```vue
<template>
  <SuggestionBox target-url="https://example.com" send-text="发送" placeholder="114514" />
</template>

<script>
import SuggestionBox from 'pjts-suggestion-box';
</script>
```

In `uno.config.ts`:

```ts
import presetSBox from 'pjts-suggestion-box/dist/preset';
import { defineConfig, presetUno, presetIcons } from 'unocss';

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
pnpm i
pnpm dev
```
