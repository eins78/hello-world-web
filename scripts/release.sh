#!/bin/bash

code --wait VERSION.env

# shellcheck disable=SC1091
source VERSION.env
VERSION="${VERSION}-${PRE_RELEASE}"

npm info | tail -3

read -p "Are you sure you want to release '$VERSION'? (y/n)" -n 1 -r REPLY
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  exit 1
fi

# NOTE: if using this in CI, remove the -S and -s flags from the git commands (they are for signing)
npm version --no-git-tag-version --allow-same-version "$VERSION"
git add VERSION.env
git commit -S -m "release: $VERSION"
git tag -s -f -a "v$VERSION" -m "release: $VERSION"
pnpm publish --no-git-checks --access public
