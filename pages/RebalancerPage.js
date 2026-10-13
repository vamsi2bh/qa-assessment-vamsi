// Page Object for app/index.html - all locators and UI actions live here, tests never touch selectors
const path = require('path');
const { pathToFileURL } = require('url');

const SYMBOLS = ['IBM', 'MSFT', 'ORCL', 'AAPL', 'HD'];

class RebalancerPage {
	constructor(page) {
		this.page = page;
		this.totalAssets = page.getByTestId('total-assets');
		this.calculateButton = page.getByTestId('calculate');
		this.errors = page.getByTestId('errors').locator('li');
	}

	async goto() {
		await this.page.goto(pathToFileURL(path.join(__dirname, '..', 'app', 'index.html')).href);
	}

	async setTotalAssets(value) {
		await this.totalAssets.fill(String(value));
	}

	// fields: any of { target, current, price } - only the ones given are changed
	async setHolding(symbol, fields) {
		for (const [field, value] of Object.entries(fields)) {
			await this.page.getByTestId(`${field}-${symbol}`).fill(String(value));
		}
	}

	async calculate() {
		await this.calculateButton.click();
	}

	async getVariance(symbol) {
		return (await this.page.getByTestId(`variance-${symbol}`).textContent()).trim();
	}

	async getAction(symbol) {
		return (await this.page.getByTestId(`action-${symbol}`).textContent()).trim();
	}

	async getShares(symbol) {
		return (await this.page.getByTestId(`shares-${symbol}`).textContent()).trim();
	}

	// { IBM: { variance, action, shares }, ... }
	async getResults() {
		const results = {};
		for (const s of SYMBOLS) {
			results[s] = {
				variance: await this.getVariance(s),
				action: await this.getAction(s),
				shares: await this.getShares(s),
			};
		}
		return results;
	}

	async getErrors() {
		return this.errors.allTextContents();
	}
}

module.exports = { RebalancerPage, SYMBOLS };
