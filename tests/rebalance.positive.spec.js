// Positive scenarios - valid input, shares to buy / sell must be correct (TC numbers match the manual test cases)
const { test, expect } = require('@playwright/test');
const { RebalancerPage, SYMBOLS } = require('../pages/RebalancerPage');
const { ASSESSMENT_TOTAL, ASSESSMENT } = require('../test-data/scenarios');

const NO_TRADE = { variance: '0', action: 'NONE', shares: '0.00' };

let rebalancer;

test.beforeEach(async ({ page }) => {
	rebalancer = new RebalancerPage(page);
	await rebalancer.goto();
	// Start every test from the assessment data
	await rebalancer.setTotalAssets(ASSESSMENT_TOTAL);
	for (const [symbol, fields] of Object.entries(ASSESSMENT)) await rebalancer.setHolding(symbol, fields);
});

test('TC1 - assessment data: buy 66.67 IBM, sell 45.45 ORCL, nothing for the rest', async () => {
	await rebalancer.calculate();
	expect(await rebalancer.getResults()).toEqual({
		IBM: { variance: '-10', action: 'BUY', shares: '66.67' },
		MSFT: NO_TRADE,
		ORCL: { variance: '10', action: 'SELL', shares: '45.45' },
		AAPL: NO_TRADE,
		HD: NO_TRADE,
	});
	expect(await rebalancer.getErrors()).toEqual([]);
});

test('TC2 - value bought equals value sold (cash neutral)', async () => {
	await rebalancer.calculate();
	const bought = Number(await rebalancer.getShares('IBM')) * ASSESSMENT.IBM.price;
	const sold = Number(await rebalancer.getShares('ORCL')) * ASSESSMENT.ORCL.price;
	// shares are rounded to 2 decimals, so each side can be off by up to 0.005 x unit price
	const tolerance = 0.005 * (ASSESSMENT.IBM.price + ASSESSMENT.ORCL.price);
	expect(Math.abs(bought - sold)).toBeLessThanOrEqual(tolerance);
});

test('TC3 - portfolio already at target: no trades', async () => {
	for (const s of SYMBOLS) await rebalancer.setHolding(s, { current: 20 });
	await rebalancer.calculate();
	const results = await rebalancer.getResults();
	for (const s of SYMBOLS) expect(results[s]).toEqual(NO_TRADE);
});

test('TC4 - total assets 200,000: shares double', async () => {
	await rebalancer.setTotalAssets(200000);
	await rebalancer.calculate();
	expect(await rebalancer.getShares('IBM')).toBe('133.33');
	expect(await rebalancer.getShares('ORCL')).toBe('90.91');
});

test('TC5 - IBM unit price 100: buy 100.00 shares, ORCL unchanged', async () => {
	await rebalancer.setHolding('IBM', { price: 100 });
	await rebalancer.calculate();
	expect(await rebalancer.getShares('IBM')).toBe('100.00');
	expect(await rebalancer.getShares('ORCL')).toBe('45.45');
});

test('TC6 - two buys and a sell in the same run', async () => {
	await rebalancer.setHolding('IBM', { target: 30, current: 20 });
	await rebalancer.setHolding('MSFT', { target: 30, current: 30 });
	await rebalancer.setHolding('ORCL', { target: 20, current: 10 });
	await rebalancer.setHolding('AAPL', { target: 10, current: 30 });
	await rebalancer.setHolding('HD', { target: 10, current: 10 });
	await rebalancer.calculate();
	expect(await rebalancer.getResults()).toEqual({
		IBM: { variance: '-10', action: 'BUY', shares: '66.67' },
		MSFT: NO_TRADE,
		ORCL: { variance: '-10', action: 'BUY', shares: '45.45' },
		AAPL: { variance: '20', action: 'SELL', shares: '44.44' },
		HD: NO_TRADE,
	});
});
