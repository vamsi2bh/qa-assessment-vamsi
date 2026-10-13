// Negative scenarios - invalid input must show an error and produce no buy / sell output (TC numbers match the manual test cases)
const { test, expect } = require('@playwright/test');
const { RebalancerPage, SYMBOLS } = require('../pages/RebalancerPage');
const { ASSESSMENT_TOTAL, ASSESSMENT } = require('../test-data/scenarios');

let rebalancer;

test.beforeEach(async ({ page }) => {
	rebalancer = new RebalancerPage(page);
	await rebalancer.goto();
	await rebalancer.setTotalAssets(ASSESSMENT_TOTAL);
	for (const [symbol, fields] of Object.entries(ASSESSMENT)) await rebalancer.setHolding(symbol, fields);
});

// Calculates and checks: exactly these errors are shown, and no variance / action / shares are displayed
async function expectRejected(messages) {
	await rebalancer.calculate();
	expect(await rebalancer.getErrors()).toEqual(messages);
	const results = await rebalancer.getResults();
	for (const s of SYMBOLS) expect(results[s]).toEqual({ variance: '', action: '', shares: '' });
}

const TOTAL_MSG = 'Total assets must be a number greater than 0';

test('TC7 - total assets blank', async () => {
	await rebalancer.setTotalAssets('');
	await expectRejected([TOTAL_MSG]);
});

test('TC8 - total assets zero', async () => {
	await rebalancer.setTotalAssets(0);
	await expectRejected([TOTAL_MSG]);
});

test('TC9 - total assets negative', async () => {
	await rebalancer.setTotalAssets(-100000);
	await expectRejected([TOTAL_MSG]);
});

test('TC10 - total assets not a number', async () => {
	await rebalancer.setTotalAssets('abc');
	await expectRejected([TOTAL_MSG]);
});

test('TC11 - target % blank', async () => {
	await rebalancer.setHolding('IBM', { target: '' });
	await expectRejected(['IBM: target % must be a number between 0 and 100']);
});

test('TC12 - target % negative', async () => {
	await rebalancer.setHolding('IBM', { target: -20 });
	await expectRejected(['IBM: target % must be a number between 0 and 100']);
});

test('TC13 - target % above 100', async () => {
	await rebalancer.setHolding('IBM', { target: 120 });
	await expectRejected(['IBM: target % must be a number between 0 and 100']);
});

test('TC14 - target % do not add up to 100', async () => {
	await rebalancer.setHolding('IBM', { target: 25 });
	await expectRejected(['Target % must add up to 100 (currently 105)']);
});

test('TC15 - current % blank', async () => {
	await rebalancer.setHolding('ORCL', { current: '' });
	await expectRejected(['ORCL: current % must be a number between 0 and 100']);
});

test('TC16 - current % do not add up to 100', async () => {
	await rebalancer.setHolding('ORCL', { current: 25 });
	await expectRejected(['Current % must add up to 100 (currently 95)']);
});

test('TC17 - unit price blank', async () => {
	await rebalancer.setHolding('IBM', { price: '' });
	await expectRejected(['IBM: unit price must be a number greater than 0']);
});

test('TC18 - unit price zero', async () => {
	await rebalancer.setHolding('IBM', { price: 0 });
	await expectRejected(['IBM: unit price must be a number greater than 0']);
});

test('TC19 - unit price negative', async () => {
	await rebalancer.setHolding('IBM', { price: -150 });
	await expectRejected(['IBM: unit price must be a number greater than 0']);
});

test('TC20 - unit price negative (HD)', async () => {
	await rebalancer.setHolding('HD', { price: -70 });
	await expectRejected(['HD: unit price must be a number greater than 0']);
});

test('TC21 - target % negative (AAPL)', async () => {
	await rebalancer.setHolding('AAPL', { target: -20 });
	await expectRejected(['AAPL: target % must be a number between 0 and 100']);
});
