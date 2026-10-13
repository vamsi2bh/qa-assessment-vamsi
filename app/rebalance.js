// ─────────────────────────────────────────────────────────────
// REBALANCING LOGIC (the application under test)
//   target variance = current% - target%   (-ve => buy, +ve => sell)
//   $ to trade      = total assets * |variance| / 100
//   shares          = $ to trade / unit price   (fractional, shown to 2 decimals)
// ─────────────────────────────────────────────────────────────
(function (root) {
	const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

	// Returns a number, or NaN when the text is blank / not numeric
	function toNumber(text) {
		const t = String(text ?? '').trim();
		return t === '' ? NaN : Number(t);
	}

	// holdings: [{ symbol, target, current, price }] - values are raw text from the form
	function validate(totalAssets, holdings) {
		const errors = [];

		const total = toNumber(totalAssets);
		if (!(total > 0)) errors.push('Total assets must be a number greater than 0');

		let targetSum = 0;
		let currentSum = 0;
		let percentsOk = true;

		for (const h of holdings) {
			const target = toNumber(h.target);
			const current = toNumber(h.current);
			const price = toNumber(h.price);

			if (!(target >= 0 && target <= 100)) {
				errors.push(`${h.symbol}: target % must be a number between 0 and 100`);
				percentsOk = false;
			}
			if (!(current >= 0 && current <= 100)) {
				errors.push(`${h.symbol}: current % must be a number between 0 and 100`);
				percentsOk = false;
			}
			if (!(price > 0)) errors.push(`${h.symbol}: unit price must be a number greater than 0`);

			targetSum += target;
			currentSum += current;
		}

		// Sum checks only make sense once every individual % is valid
		if (percentsOk) {
			if (round2(targetSum) !== 100) errors.push(`Target % must add up to 100 (currently ${round2(targetSum)})`);
			if (round2(currentSum) !== 100) errors.push(`Current % must add up to 100 (currently ${round2(currentSum)})`);
		}
		return errors;
	}

	function rebalance(totalAssets, holdings) {
		const total = toNumber(totalAssets);
		return holdings.map((h) => {
			const variance = round2(toNumber(h.current) - toNumber(h.target));
			const dollars = (total * Math.abs(variance)) / 100;
			const shares = round2(dollars / toNumber(h.price));
			const action = variance < 0 ? 'BUY' : variance > 0 ? 'SELL' : 'NONE';
			return { symbol: h.symbol, variance, action, shares: action === 'NONE' ? 0 : shares };
		});
	}

	const api = { validate, rebalance };
	if (typeof module !== 'undefined' && module.exports) module.exports = api;
	else root.Rebalance = api;
})(typeof window !== 'undefined' ? window : globalThis);
