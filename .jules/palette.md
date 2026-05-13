## 2024-05-13 - Password Manager Integration in Authentication Forms
**Learning:** React inputs relying solely on placeholders or lacking semantic autofill attributes break password manager integration, particularly on mobile devices where auto-capitalization creates friction for email entry.
**Action:** Always include `autoComplete="email"`, `autoCapitalize="none"`, `autoCorrect="off"`, and `spellCheck={false}` for email inputs, and dynamically toggle `autoComplete` between `"new-password"` and `"current-password"` for password fields depending on the sign-up/sign-in context.
