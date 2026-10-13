// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
	testDir: './tests',
	timeout: 30_000,
	workers: 1,
	reporter: [['html', { outputFolder: 'playwright-report' }], ['line']],
	use: {
		headless: true,
		channel: 'msedge', // uses the Edge already installed on Windows - no browser download needed
	},
});
