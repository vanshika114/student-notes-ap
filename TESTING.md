# Testing Guidelines & Documentation

Welcome to the testing guide for this repository. As our project scales, ensuring reliability across all 100+ applications is critical. Please follow these guidelines when contributing.

## 1. Manual Testing Checklist
Before submitting a Pull Request, verify the following manually:
- [ ] Application loads without console errors.
- [ ] User inputs are sanitized and boundary limits are respected.
- [ ] UI is fully responsive across Mobile (320px), Tablet (768px), and Desktop (1024px+).
- [ ] Network failures and API limits are handled gracefully (no silent failures).
- [ ] State persistence (e.g., localStorage) works correctly on page reload.

## 2. Unit Test Requirements
Currently, we are transitioning to a structured testing environment. Future contributions to core utilities (like `store.js` or data parsers) must include unit tests.
* **Framework:** Jest (recommended for JS utilities).
* **Coverage:** Aim for 80%+ coverage on new utility functions.
* **Focus:** Test edge cases, null inputs, and expected data transformations.

## 3. Integration Test Examples
For full applications (e.g., Expense Tracker, DotsAndBoxes), integration tests ensure components interact correctly.
* **Example Scenario:** 1. Initialize the global `AppStore`.
  2. Simulate a user submitting a transaction form.
  3. Verify the transaction appears in the DOM and is committed to `localStorage`.

## 4. Automated Testing Setup Guide (Coming Soon)
We are in the process of setting up GitHub Actions for CI/CD. Once active, the pipeline will:
1. Run a linter (ESLint) on all modified JavaScript files.
2. Execute the Jest test suite automatically on PR creation.
3. Block merging if tests fail.

*For now, please adhere strictly to the Manual Testing Checklist.*