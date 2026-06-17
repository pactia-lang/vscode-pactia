#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="$(node -p "require('$ROOT/package.json').version")"
VSIX="$ROOT/pactia-$VERSION.vsix"
KEEP_DIR="pactia-lang.pactia-$VERSION"

cleanup_stale_installs() {
  local base="$1"
  [[ -d "$base" ]] || return 0

  for entry in "$base"/pactia-lang.pactia-*; do
    [[ -e "$entry" ]] || continue
    [[ "$(basename "$entry")" == "$KEEP_DIR" ]] && continue
    rm -rf "$entry"
    echo "Removed stale install $entry"
  done
}

cleanup_stale_vsix() {
  for file in "$ROOT"/pactia-*.vsix; do
    [[ -f "$file" ]] || continue
    [[ "$file" == "$VSIX" ]] && continue
    rm -f "$file"
    echo "Removed stale VSIX $file"
  done

  for file in "$ROOT"/sapl-*.vsix; do
    [[ -f "$file" ]] || continue
    rm -f "$file"
    echo "Removed legacy VSIX $file"
  done
}

package_vsix() {
  echo "Packaging $VSIX ..."
  (cd "$ROOT" && npx --yes @vscode/vsce package --no-dependencies -o "$VSIX")
}

install_vsix() {
  local cli="$1"
  if command -v "$cli" >/dev/null 2>&1; then
    echo "Installing via $cli ..."
    "$cli" --install-extension "$VSIX" --force
  else
    echo "Skip $cli (not found)"
  fi
}

install_cursor=false
install_vscode=false

case "${1:-}" in
  --cursor) install_cursor=true ;;
  --vscode) install_vscode=true ;;
  *)
    [[ -d "${HOME}/.cursor" ]] && install_cursor=true
    [[ -d "${HOME}/.vscode" ]] && install_vscode=true
    ;;
esac

package_vsix
cleanup_stale_vsix

if $install_cursor; then
  cleanup_stale_installs "${HOME}/.cursor/extensions"
  install_vsix cursor
fi

if $install_vscode; then
  cleanup_stale_installs "${HOME}/.vscode/extensions"
  install_vsix code
fi

echo ""
echo "Installed pactia-lang.pactia@$VERSION"
echo "Reload Cursor/VS Code: Developer: Reload Window"
echo "Open a .pactia file and confirm language mode is Pactia (bottom-right)."
