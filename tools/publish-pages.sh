#!/bin/sh
# Publish the built exams and the pre-rendered audio to the gh-pages branch.
#
#   ./tools/publish-pages.sh
#
# GitHub Pages for this repo serves the `gh-pages` branch, with the exam HTML
# files at its root and the clips under audio/<exam>/.
set -eu

ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

TMPBASE="${TMPDIR:-/tmp/opencode}"
mkdir -p "$TMPBASE"
WORK=$(mktemp -d "$TMPBASE/pte-pages.XXXXXX")
cleanup() { git -C "$ROOT" worktree remove --force "$WORK" >/dev/null 2>&1 || true; }
trap cleanup EXIT INT TERM

NODE=$(command -v node || echo /home/opencode/.local/bin/node)
"$NODE" build.js

git fetch --quiet origin gh-pages
git worktree add --detach "$WORK" FETCH_HEAD >/dev/null
cp exams/pte-mock-exam-*.html "$WORK"/
rm -rf "$WORK/audio"
cp -R audio "$WORK/audio"

# The landing page is hand-published; keep it in sync with exams/.
if [ -f "$ROOT/site/index.html" ]; then
  cp "$ROOT/site/index.html" "$WORK/index.html"
fi

cd "$WORK"
git add -A
if git diff --cached --quiet; then
  echo "pages: nothing to publish"
  exit 0
fi
git commit -q -m "chore(pages): publish exams and neural audio"
git push origin HEAD:gh-pages
echo "pages: published $(git rev-parse --short HEAD)"
