# Content Service - R1 Code Quality

## 🎯 Setup
```bash
git checkout -b r1/lint/content
# Install SonarLint (IDE)
# Run analysis on src/
```

## 🔧 Fix Issues
```
🔴 CRITICAL (0 allowed)
- Security, Null pointer, Resource leak

🟠 MAJOR (< 5)
- Unused imports/variables
- Missing javadoc
- Complex methods

🟡 MINOR (nice to have)
- Naming, Style
```

## ✅ Checklist
```
[ ] Fix 🔴 issues
[ ] Fix 🟠 issues
[ ] Run tests pass
[ ] Commit (atomic)
[ ] Push → r1/lint/content
```

## 📝 Commit Format
```
r1/lint(content): fix SonarLint issues

- Remove unused imports
- Add missing javadoc
- Fix null pointer checks

Fixes: #[issue]
```

