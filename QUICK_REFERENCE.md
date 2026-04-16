# Quick Reference - Push to GitHub

## 🚀 TL;DR Commands

After installing Git, run these commands in PowerShell:

```powershell
cd "c:\Users\compa\OneDrive\School\jomi\hr2"

git init
git config user.name "Your Name"
git config user.email "your@email.com"

git add .
git commit -m "Initial commit: HR Workforce Management System"

git branch -M main
git remote add origin https://github.com/joymayers/Sanchez.git

git push -u origin main
```

**When prompted for password:** Use your GitHub personal access token (not your password)

---

## ⚠️ Prerequisites

1. **Install Git** - https://git-scm.com/download/win
2. **Create GitHub Token** - https://github.com/settings/tokens
   - Scopes: `repo`, `workflow`
   - Save the token securely

---

## 📋 What's Ready

| Component | Status | Location |
|-----------|--------|----------|
| Backend API | ✅ Complete | `/backend` |
| Frontend UI | ✅ Complete | `/frontend` |
| Database Schema | ✅ Complete | `/backend/database` |
| Documentation | ✅ Complete | `/docs` |
| .gitignore | ✅ Created | Root directory |
| README | ✅ Updated | Root directory |

---

## 🔗 Repository Info

- **URL:** https://github.com/joymayers/Sanchez
- **Owner:** joymayers
- **Branch:** main

---

## ✅ After Push

1. Visit https://github.com/joymayers/Sanchez
2. Verify all files are present
3. Check commit history shows your initial commit
4. Clone the repo to another location to verify: `git clone https://github.com/joymayers/Sanchez.git`

---

**Note:** Full instructions in `GITHUB_SETUP.md`
