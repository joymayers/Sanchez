# GitHub Repository Setup

This guide will help you push the HR/Workforce Management System project to the GitHub repository `joymayers/Sanchez`.

## Prerequisites

### 1. Install Git

**Windows:**
1. Download Git from https://git-scm.com/download/win
2. Run the installer (`Git-2.x.x-64-bit.exe`)
3. Use all default options (recommended)
4. Restart your terminal/PowerShell after installation
5. Verify installation: Open PowerShell and run `git --version`

### 2. Configure Git (First Time Only)

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. Create GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Select these scopes:
   - ✅ repo (Full control of private repositories)
   - ✅ workflow (Update GitHub Action workflows)
4. Copy the token and save it somewhere safe (you'll need it for authentication)

---

## Step-by-Step: Push Project to GitHub

### Step 1: Navigate to Project Directory
```powershell
cd "c:\Users\compa\OneDrive\School\jomi\hr2"
```

### Step 2: Initialize Git Repository
```powershell
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Step 3: Add All Files
```powershell
git add .
```

### Step 4: Create Initial Commit
```powershell
git commit -m "Initial commit: HR/Workforce Management System - Full stack React, Node.js/Express, PostgreSQL"
```

### Step 5: Rename Branch to Main (GitHub Default)
```powershell
git branch -M main
```

### Step 6: Add Remote Repository
Replace with your exact repository URL:
```powershell
git remote add origin https://github.com/joymayers/Sanchez.git
```

### Step 7: Push to GitHub

**Using Personal Access Token (Recommended):**
```powershell
git push -u origin main
```

When prompted for password:
- **Username:** `joymayers` (your GitHub username)
- **Password:** Paste your personal access token (not your GitHub password)

**Alternative: Using SSH (if you have SSH keys configured)**
```powershell
git remote set-url origin git@github.com:joymayers/Sanchez.git
git push -u origin main
```

---

## What Gets Pushed

✅ **Included Files:**
- `/frontend` - React application
- `/backend` - Node.js/Express API
- `/docs` - Documentation files
- `README.md` - Project overview
- `.gitignore` - Files to exclude from version control

❌ **Excluded Files** (via .gitignore):
- `node_modules/` - Dependencies (will be installed via `npm install`)
- `.env` files - Environment variables (keep local for security)
- `dist/` - Build output (regenerated on build)
- `.vscode/`, `.idea/` - IDE files

---

## Verify Push Success

After pushing, verify on GitHub:
1. Go to https://github.com/joymayers/Sanchez
2. You should see all your code files
3. Check the commit history to see your initial commit

---

## Troubleshooting

### "git: The term 'git' is not recognized"
**Solution:** Git is not installed or not in PATH. Reinstall Git and restart PowerShell.

### "fatal: not a git repository"
**Solution:** Make sure you're in the project directory (`c:\Users\compa\OneDrive\School\jomi\hr2`)

### "fatal: Authentication failed"
**Solution:** 
- Verify your GitHub username is correct
- Make sure you're using a personal access token (not your password)
- Tokens may expire; create a new one if needed

### "fatal: The remote origin already exists"
**Solution:** The remote is already set. Check with `git remote -v` and remove if needed:
```powershell
git remote remove origin
git remote add origin https://github.com/joymayers/Sanchez.git
```

### "error: pathspec 'main' did not match any files"
**Solution:** Branch hasn't been created yet. Create and commit first:
```powershell
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

---

## Future Commits

After the initial setup, push future changes with:
```powershell
git add .
git commit -m "Your commit message"
git push
```

---

## Repository Information

- **Repository URL:** https://github.com/joymayers/Sanchez
- **Owner:** joymayers
- **Project:** HR/Workforce Management System
- **Main Branch:** main

---

**Last Updated:** April 17, 2026
