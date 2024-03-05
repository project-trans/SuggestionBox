import type { Preset } from 'unocss'

function preset(): Preset {
  return {
    name: 'preset-suggestion-box',
    rules: [
      [
        /sb-auto-height/,
        ([match]) => `
        .${match}::after {
          content: attr(data-value) ' ';
          visibility: hidden;
          white-space: pre-wrap;
          grid-area: 2 / 1;
        }
        .${match} textarea {
          grid-area: 2 / 1;
        }
      `,
      ],
    ],
  }
}

export default preset
