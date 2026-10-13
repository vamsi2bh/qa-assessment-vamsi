import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import globals from 'globals';

export default defineConfig([
	eslint.configs.recommended,
	{
		files: ['**/*.js'],
		languageOptions: {
			globals: {
				...globals.node,
			},
			sourceType: 'commonjs',
		},
	},
	{
		// app under test runs in the browser
		files: ['app/**/*.js'],
		languageOptions: {
			globals: {
				...globals.browser,
				Rebalance: 'readonly',
			},
		},
	},
]);
