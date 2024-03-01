/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig, presetIcons, presetUno, presetAttributify } from 'unocss';
import unoPreset from './src/preset';

export default defineConfig({
    presets: [
        presetUno({
            dark: 'class',
        }),
        presetAttributify(),
        presetIcons({
            prefix: 'i-',
            warn: true,
        }),
    ]
});
