# Security Check Command

Perform a security audit of the codebase.

## Tasks

1. **Dependency Vulnerabilities**
   ```bash
   npm audit
   ```
   Report any security vulnerabilities in dependencies.

2. **Secrets Detection**

   Search for potential secrets in the codebase:
   - API keys
   - Passwords
   - Private keys
   - Connection strings

   Check that `.env` files are in `.gitignore`.

3. **Authentication & Authorization Review**

   Verify:
   - All API routes check authentication where needed
   - Role-based access control is properly implemented
   - Session tokens are handled securely

4. **Input Validation**

   Check that:
   - All API endpoints validate input with Zod schemas
   - User input is sanitized before database queries
   - File uploads are properly validated

5. **Security Headers**

   Verify appropriate security headers are configured:
   - Content-Security-Policy
   - X-Content-Type-Options
   - X-Frame-Options
   - Strict-Transport-Security

6. **OWASP Top 10 Checks**

   Review for common vulnerabilities:
   - [ ] SQL Injection (use parameterized queries)
   - [ ] XSS (escape user content)
   - [ ] CSRF (validate origin)
   - [ ] Broken Authentication
   - [ ] Sensitive Data Exposure
   - [ ] Security Misconfiguration

7. **Report Summary**

   | Area | Risk Level | Issues |
   |------|------------|--------|
   | Dependencies | 🟢/🟡/🔴 | X vulns |
   | Secrets | 🟢/🔴 | None found / Found |
   | Auth/Authz | 🟢/🟡/🔴 | Details |
   | Input Validation | 🟢/🟡/🔴 | Details |
   | Headers | 🟢/🟡/🔴 | Details |

   Provide remediation steps for any issues found.
