#!/bin/bash
# Publishes the Ladies series pages (rotation, short game, putting) to rrgolfperformance.com
# Run from your Mac terminal:  bash ~/my-golf-website/publish-ladies.sh
set -e
cd "$(dirname "$0")"

# Clear stale git locks left from the build (harmless, just empty files)
rm -f .git/HEAD.lock .git/index.lock

# Stage the Ladies series + the email merge + the function-cap fix
# (leaves unrelated WIP like the Adults.png deletion untouched)
git add ladies/ .vercelignore api/build-game-plan-pdf.js adult/coach.html api/_lib/storage.js api/admin-auth.js api/generate-pdfs.py api/get-asset.js adult/my-plan.html

# Commit anything not already committed
git commit -m "Ladies pages live; merge email-game-plan into build-game-plan-pdf (stay at 12 fns)" || echo "Nothing new to commit — continuing."

# Push to GitHub -> Vercel auto-deploys to rrgolfperformance.com
git push

echo ""
echo "Done. Live in ~1 minute at:"
echo "  https://rrgolfperformance.com/ladies/the-rotation"
echo "  https://rrgolfperformance.com/ladies/the-short-game"
echo "  https://rrgolfperformance.com/ladies/the-putting"
echo "  https://rrgolfperformance.com/ladies  (archive)"
