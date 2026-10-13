# Technical Assessment QA_0882 - Account ABC Rebalancer

Manual and automated (Playwright, Page Object Model) tests for the rebalancing problem in the assessment document.

## Logic

```
target variance = current % - target %        (-ve => buy, +ve => sell)
$ to trade      = total assets x |variance| / 100
shares          = $ to trade / unit price
```

With the assessment data (total assets $100,000):

| Security | Variance | Output           |
| -------- | -------- | ---------------- |
| IBM      | -10      | Buy 66.67 shares |
| MSFT     | 0        | No action        |
| ORCL     | 10       | Sell 45.45 shares |
| AAPL     | 0        | No action        |
| HD       | 0        | No action        |

## Project structure

| Path                    | Purpose                                                        |
| ----------------------- | -------------------------------------------------------------- |
| `app/`                  | Small rebalancer app under test (`index.html`, `app.js`, `rebalance.js`) |
| `pages/RebalancerPage.js` | Page object - all locators and UI actions                    |
| `test-data/scenarios.js`  | Account ABC data from the assessment                         |
| `tests/`                | `rebalance.positive.spec.js` (TC1-6), `rebalance.negative.spec.js` (TC7-21) |
| `docs/`                 | Answered assessment document and manual test cases             |

Test case numbers (TC1-TC21) are the same in the manual test cases document and the automated tests.

## Run

```
npm install
npm test            # all tests
npm run test:positive
npm run test:negative
npm run report      # open HTML report
npm run lint        # ESLint
```

The tests open `app/index.html` directly in the browser (no server needed). `playwright.config.js` uses the Microsoft Edge installed on Windows (`channel: 'msedge'`), so no browser download is needed. To use Playwright's Chromium instead, remove that line and run `npx playwright install chromium`.

## Assumptions

1. No application was supplied, so a minimal rebalancer page (`app/`) was built as the application under test. Its input validation rules and error messages are defined there.
2. Fractional shares are allowed and shown to 2 decimals (needed to reach exactly zero variance).
3. Target % and current % must each add up to 100, as they do in the assessment data.
4. Dollars to trade = total assets x |variance| / 100, and shares = dollars to trade / unit price. Current % is taken as a share of the total assets entered. No fees, taxes, cash balance or minimum lot size.
5. Variance and shares are rounded to 2 decimals. The cash-neutral check (TC2) allows a difference of up to 0.005 x (IBM price + ORCL price) because of this rounding.
6. Target variance = current % - target %, so a negative variance means buy (the assessment's sign convention). A variance of 0 shows Action NONE and 0.00 shares.
7. Valid ranges: total assets and unit price must be greater than 0; target % and current % must be between 0 and 100 (inclusive).
8. Total assets is a typed input (not calculated from the holdings), and the five securities (IBM, MSFT, ORCL, AAPL, HD) are fixed.
9. "100% is vested" is taken to mean the whole $100,000 can be traded; it does not change any number.
