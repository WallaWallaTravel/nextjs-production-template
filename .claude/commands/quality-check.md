# Quality Check Command

Run comprehensive code quality analysis on the project.

## Tasks

1. **TypeScript Compilation**
   ```bash
   npm run type-check
   ```
   Report any type errors with file locations.

2. **ESLint Analysis**
   ```bash
   npm run lint
   ```
   Report any linting errors or warnings.

3. **Test Execution**
   ```bash
   npm run test
   ```
   Report test results and any failures.

4. **Build Verification**
   ```bash
   npm run build
   ```
   Verify the production build succeeds.

5. **Code Quality Metrics**

   Analyze the codebase for:
   - Files over 300 lines (may need splitting)
   - Functions over 50 lines (may need refactoring)
   - Deeply nested code (>4 levels)
   - TODO/FIXME comments
   - Console.log statements (should use logger)

6. **Report Summary**

   Provide a quality report:

   | Metric | Status | Details |
   |--------|--------|---------|
   | TypeScript | ✅/❌ | X errors |
   | ESLint | ✅/❌ | X warnings |
   | Tests | ✅/❌ | X passed, Y failed |
   | Build | ✅/❌ | Success/Failure |
   | Large Files | ⚠️/✅ | X files >300 lines |
   | TODOs | ⚠️/✅ | X TODO comments |

   Prioritize any issues that need immediate attention.
