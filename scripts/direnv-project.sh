#!/usr/bin/env bash

# tested/supported envs:
# - [x] macOS, bash, nvm installed
# - [ ] macOS, oh-my-zsh, nvm auto-hook
# - [ ] Windows…
# - [ ] Ubuntu…
#
# # how to use
#
# install direnv, nvm
# open project, and allow the direnv file (needs only to be done once).
#     direnv allow .
# if something went wrong, run
#     direnv reload
# if that did not fix it, see debug info to see whats up
#     direnv direnv status
# how to update the helper scripts for your project
# * clone the script repo, e.g. git clone …
# * replace the "fetch srcipt" line with ". ~/path/to/your/sripts/repo"
# * ensure that everything is working
#     direnv allow # allow your changes, and reload the env
#
# inspired by https://github.com/steve-ross/direnv-helpers/blob/d20563f76501ea404e1a097963f734e877304984/helpers.sh
strict_env

__use_nvm() {
  watch_file .nvmrc
  watch_file .node-version
  export NODE_VERSION_PREFIX="v"
  export NODE_VERSIONS="${NVM_DIR}/versions/node"
  # use the built-in function to load node, but detect error to log an additional hint
  if ! use node; then
    log_status "HINT: run $ nvm install \$NODEJS_VERSION && direnv reload"
    exit 1
  fi
}

layout_project() {
  __use_nvm

  # IMPORTANT: load the (optional ) local .env files last, to make sure it cant interfer the other config
  # (the .env file is only supposed to contain env vars for the application, not for tools and platforms)
  dotenv_if_exists .env
}
