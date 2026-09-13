#!/bin/bash

# ============================================================
# deploy.sh — pushes this project to its own GitHub repository
# ============================================================
#
# WHAT THIS SCRIPT DOES, STEP BY STEP:
#
# 1. Turns this folder into a git repository (if it isn't one yet)
#    "git init" creates a hidden .git/ folder that tracks every
#    change you make to files in here. This is LOCAL ONLY at this
#    point — nothing has left your Mac yet.
#
# 2. Stages and commits all the files
#    "git add ." tells git "track all these files"
#    "git commit" saves a snapshot of them with a message,
#    like a labeled save point you could return to later.
#    Still local-only — this is just history on your laptop.
#
# 3. Creates a NEW repository on GitHub (using the "gh" CLI tool
#    you already authenticated earlier) and pushes your commit to it
#    "gh repo create" talks to GitHub's servers and creates an
#    empty repository there under your account.
#    "git push" is the step that actually uploads your commit
#    from your Mac to that GitHub repository. This is the FIRST
#    point where your code leaves your laptop.
#
# After this script finishes, your code exists in two places:
#   - Your Mac (the working copy you edit)
#   - GitHub (the "official" backup/source of truth)
#
# It does NOT deploy the live website. That's a separate step you
# do once, manually, in the Netlify dashboard: "New site from Git"
# → pick this repository. After that one-time setup, every future
# "git push" automatically triggers Netlify to rebuild and update
# the live site — no extra scripts needed for that part.
#
# ============================================================
# SAFE TO RE-RUN?
# ============================================================
# Yes. If a git repo already exists here, "git init" does nothing
# harmful (it just notices one exists). If there's nothing new to
# commit, the commit step will simply report "nothing to commit"
# and the script continues. It will NOT create a duplicate GitHub
# repo if one already exists with this name — it will just push
# any new changes to it instead.
#
# ============================================================

set -e  # stop the script immediately if any command fails

REPO_NAME="derivative-proofs"

echo "Step 1: Setting up local git tracking..."
if [ ! -d .git ]; then
  git init
  git branch -M main
  echo "  → Created a new local git repository."
else
  echo "  → Local git repository already exists, skipping init."
fi

echo ""
echo "Step 2: Saving a snapshot of all current files..."
git add .
if git diff --cached --quiet; then
  echo "  → No changes to commit (everything already saved)."
else
  git commit -m "Update site content"
  echo "  → Changes committed."
fi

echo ""
echo "Step 3: Checking GitHub..."

# Check whether a remote called "origin" is already configured
if git remote get-url origin >/dev/null 2>&1; then
  echo "  → This folder is already connected to a GitHub repo."
  echo "  → Pushing latest changes..."
  git push -u origin main
else
  echo "  → No GitHub repo connected yet. Creating one now..."
  # Requires: gh auth login (already done earlier in this project)
  # --public   : matches your earlier choice that this site is public
  # --source=. : use the current folder as the repo contents
  # --push     : push immediately after creating it
  gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
  echo "  → New GitHub repository created and pushed: $REPO_NAME"
fi

echo ""
echo "Done. Your code is now backed up on GitHub."
echo ""
echo "NEXT STEP (one-time, done manually in a browser, not by this script):"
echo "  1. Go to netlify.com"
echo "  2. Click 'New site from Git'"
echo "  3. Select the '$REPO_NAME' repository"
echo "  4. Click Deploy"
echo ""
echo "After that one-time setup, just re-run this script any time"
echo "you edit files, and Netlify will automatically rebuild the live site."
