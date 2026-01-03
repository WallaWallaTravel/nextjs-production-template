# Test Status Command

Analyze test coverage and test health.

## Tasks

1. **Run Test Suite**
   ```bash
   npm run test
   ```
   Report all test results.

2. **Coverage Analysis**
   ```bash
   npm run test:coverage
   ```
   If coverage script exists, report coverage metrics.

3. **Test Distribution**

   Analyze test file locations:
   - Count tests per directory
   - Identify untested files/components
   - Check test-to-source ratio

4. **Test Quality Review**

   Review test patterns:
   - Are edge cases covered?
   - Are error paths tested?
   - Are there integration tests?
   - Are there end-to-end tests?

5. **Identify Testing Gaps**

   List files/modules that should have tests but don't:
   - API routes without tests
   - Services without tests
   - Components without tests
   - Utility functions without tests

6. **Report Summary**

   | Metric | Value |
   |--------|-------|
   | Total Tests | X |
   | Passing | X |
   | Failing | X |
   | Skipped | X |
   | Coverage | X% |

   **Coverage by Area:**

   | Area | Coverage | Status |
   |------|----------|--------|
   | API Routes | X% | 🟢/🟡/🔴 |
   | Services | X% | 🟢/🟡/🔴 |
   | Components | X% | 🟢/🟡/🔴 |
   | Utils | X% | 🟢/🟡/🔴 |

   **Recommended Next Tests:**
   List the highest-priority files/functions that need test coverage.
