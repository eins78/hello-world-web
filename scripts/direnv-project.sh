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

__set_tool_versions_from_envfile() {
  local TOOL_VERSIONS_ENV_FILE="TOOL_VERSIONS.env"
  if [[ -f "$TOOL_VERSIONS_ENV_FILE" ]]; then
    if [[ -f ".nvmrc" ]]; then
      log_error "WARN: both .nvmrc and TOOL_VERSIONS.env files are present, .nvmrc will be ignored!"
    fi
    watch_file "$TOOL_VERSIONS_ENV_FILE"
    dotenv "$TOOL_VERSIONS_ENV_FILE"
  fi
}

__use_node_from_env_vars_default_nvm() {
  if [[ -z "${NODE_VERSION:-}" ]]; then
    log_error "project error: no \$NODE_VERSION set!"
    return 1
  fi

  # use NODE_VERSIONS if set, otherwise auto-detect `nvm` node versions directory
  if [[ -n "${NODE_VERSIONS:-}" ]]; then
    export NODE_VERSIONS="$NODE_VERSIONS"
  elif [[ -n "$NVM_DIR" ]]; then
      export NODE_VERSION_PREFIX="v"
    export NODE_VERSIONS="${NVM_DIR}/versions/node"
  fi

  # use the built-in function to load node, but detect error to log an additional hint
  if ! use node "$NODE_VERSION"; then
    log_status "HINT: run $ nvm install ${NODE_VERSION} && direnv reload"
    return 1
  fi
}

layout_project() {
  __set_tool_versions_from_envfile
  __use_node_from_env_vars_default_nvm

  # IMPORTANT: load the (optional ) local .env files last, to make sure it cant interfer the other config
  # (the .env file is only supposed to contain env vars for the application, not for tools and platforms)
  dotenv_if_exists .env
}