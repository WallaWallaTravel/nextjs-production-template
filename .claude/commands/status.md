# Status Check Command

Check the overall health and status of the project.

## Tasks

1. **Check Git Status**
   - Current branch
   - Uncommitted changes
   - Unpushed commits

2. **Verify Build Health**
   - Run `npm run type-check` to check TypeScript
   - Run `npm run lint` to check code quality
   - Run `npm run build` to verify production build

3. **Check Dependencies**
   - Look for outdated packages with `npm outdated`
   - Check for security vulnerabilities with `npm audit`

4. **Report Summary**

   Provide a status summary:

   | Check | Status |
   |-------|--------|
   | TypeScript | ✅/❌ |
   | ESLint | ✅/❌ |
   | Build | ✅/❌ |
   | Git | clean/dirty |

   If any checks fail, provide details on what needs to be fixed.
