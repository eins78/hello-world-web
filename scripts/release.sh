#!/bin/bash

set -exu

code --wait package.json

npm info | tail -3

NEW_VERSION="$(node -p 'require("./package.json").version')"

read -p "Are you sure you want to release '$NEW_VERSION'? (y/n)" -n 1 -r REPLY
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  exit 1
fi

# NOTE: if using this in CI, remove the --sign-git-tag flag from the git commands (they are for signing)
npm version --allow-same-version --sign-git-tag "$NEW_VERSION"
pnpm publish --access public
