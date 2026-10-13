// Wires the form to Rebalance.validate / Rebalance.rebalance
const symbols = ['IBM', 'MSFT', 'ORCL', 'AAPL', 'HD'];

function readHoldings() {
	return symbols.map((symbol) => ({
		symbol,
		target: document.querySelector(`[data-testid="target-${symbol}"]`).value,
		current: document.querySelector(`[data-testid="current-${symbol}"]`).value,
		price: document.querySelector(`[data-testid="price-${symbol}"]`).value,
	}));
}

function clearOutput() {
	for (const s of symbols) {
		document.querySelector(`[data-testid="variance-${s}"]`).textContent = '';
		document.querySelector(`[data-testid="action-${s}"]`).textContent = '';
		document.querySelector(`[data-testid="shares-${s}"]`).textContent = '';
	}
}

document.querySelector('[data-testid="calculate"]').addEventListener('click', () => {
	const total = document.querySelector('[data-testid="total-assets"]').value;
	const holdings = readHoldings();
	const list = document.querySelector('[data-testid="errors"]');
	list.innerHTML = '';
	clearOutput();

	const errors = Rebalance.validate(total, holdings);
	if (errors.length) {
		for (const e of errors) {
			const li = document.createElement('li');
			li.textContent = e;
			list.appendChild(li);
		}
		return;
	}

	for (const r of Rebalance.rebalance(total, holdings)) {
		document.querySelector(`[data-testid="variance-${r.symbol}"]`).textContent = r.variance;
		document.querySelector(`[data-testid="action-${r.symbol}"]`).textContent = r.action;
		document.querySelector(`[data-testid="shares-${r.symbol}"]`).textContent = r.shares.toFixed(2);
	}
});
