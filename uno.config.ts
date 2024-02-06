/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig, presetIcons, presetUno } from 'unocss';
import unoPreset from './src/preset';

export default defineConfig({ presets: [presetUno(), presetIcons(), unoPreset()] });
