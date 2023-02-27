#!/usr/bin/env bash

# tested/supported envs:
# - [x] macOS, bash, nvm installed
# - [ ] macOS, oh-my-zsh, nvm auto-hook
# - [ ] Windows…
# - [ ] Ubuntu…

# NOTE: partly based on https://github.com/steve-ross/direnv-helpers/blob/d20563f76501ea404e1a097963f734e877304984/helpers.sh

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
  # use NODE_VERSIONS_DIR if set, otherwise auto-detect `nvm` node versions directory
  if [[ -n "${NODE_VERSIONS_DIR:-}" ]]; then
    export NODE_VERSIONS="$NODE_VERSIONS_DIR"
  else
    # TODO: bail and log error when no nvm present
    export NODE_VERSION_PREFIX="v"
    export NODE_VERSIONS="${NVM_DIR}/versions/node"
  fi

  # shellcheck disable=SC2153
  use node "$NODE_VERSION"
}

layout_project() {
  __set_tool_versions_from_envfile
  __use_node_from_env_vars_default_nvm

  # load the (optional ) local .env files *last*, to make sure it cant interfer the other config
  # (the .env file is only supposed to contain env vars for the application, not for tools and platforms)
  dotenv_if_exists .env
}