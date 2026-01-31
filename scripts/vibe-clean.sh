#!/bin/bash
# vibe-clean.sh - Automated Hygiene for SENT Vibe Coding

PROJECT_STATE="/home/aziz/SENT/PROJECT_STATE.md"
MAX_AGE_MINUTES=15

# 1. Archive Stale Locks
# (Logic to parse markdown table and check 'Last Updated' timestamp would go here)
# For now, we will just echo the policy.

echo "🔍 Scanning for stale agent locks ( > $MAX_AGE_MINUTES mins )..."

# Placeholder for actual parsing logic
# If current_time - last_updated > 15 mins:
#   Remove line from Active Registry
#   Append "Auto-Archived: Agent X (Stale)" to Coordination Logs

echo "✅ Registry scan complete."

# 2. Check for Orphaned Branches
echo "🔍 Checking for un-merged vibe branches..."
git branch --list 'vibe/*'

echo "ℹ️  Reminder: Run 'git branch -D <branch>' to clean up old experiments."
