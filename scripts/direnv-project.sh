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

  # put ./node_modules/.bin in PATH
  layout node
}

use_java() {
  local version=${1:-}
  local java_version_prefix=${JAVA_VERSION_PREFIX:-}
  local search_version
  local java_prefix

  if [[ -z ${JAVA_VERSIONS:-} || ! -d $JAVA_VERSIONS ]]; then
    log_error "You must specify a \$JAVA_VERSIONS environment variable and the directory specified must exist!"
    return 1
  fi

  if [[ -z $version ]]; then
    log_error "I do not know which Java version to load because one has not been specified!"
    return 1
  fi

  # Search for the highest version matching $version in the folder
  search_version="$(semver_search "$JAVA_VERSIONS" "${java_version_prefix}" "${version}")"
  java_prefix="${JAVA_VERSIONS}/${java_version_prefix}${search_version}"

  if [[ ! -d "$java_prefix" ]]; then
    log_error "Unable to find Java version ($version) in ($JAVA_VERSIONS)!"
    return 1
  fi

  if [[ ! -x "$java_prefix/bin/java" ]]; then
    log_error "Unable to load Java binary (java) for version ($version) in ($JAVA_VERSIONS)!"
    return 1
  fi

  load_prefix "$java_prefix"
  export JAVA_HOME="$java_prefix"

  log_status "Successfully loaded Java $(java --version), from JAVA_HOME='$java_prefix'"
}

__use_java_from_env_vars_default_sdkman() {
  if [[ -z "${JAVA_VERSION:-}" ]]; then
    log_error "project error: no \$JAVA_VERSION set!"
    return 1
  fi

  # use JAVA_VERSIONS if set, otherwise auto-detect `sdkman.io` java versions directory
  if [[ -n "${JAVA_VERSIONS:-}" ]]; then
    export JAVA_VERSIONS="$JAVA_VERSIONS"
  elif [[ -n "$SDKMAN_CANDIDATES_DIR" ]]; then
    export JAVA_VERSION_PREFIX=""
    export JAVA_VERSIONS="${SDKMAN_CANDIDATES_DIR}/java"
  fi

  # use the built-in function to load java, but detect error to log an additional hint
  if ! use java "$JAVA_VERSION"; then
    log_status "HINT: run $ sdk install java ${JAVA_VERSION} && direnv reload"
    return 1
  fi
}

layout_project() {
  __set_tool_versions_from_envfile
  __use_node_from_env_vars_default_nvm
  __use_java_from_env_vars_default_sdkman

  # IMPORTANT: load the (optional) local .env files last, to make sure it cant interfer with the other config
  # (the .env file is only supposed to contain env vars for the application, not for tools and platforms).
  dotenv_if_exists .env
}