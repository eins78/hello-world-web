#!/usr/bin/env bash

# NOTE: based on https://github.com/steve-ross/direnv-helpers/blob/d20563f76501ea404e1a097963f734e877304984/helpers.sh

__prompt_install_nvm(){
  _log prompt "Couldn't find nvm (node version manager)..."
  read -p "Should I install it? " -n 1 -r
  echo    # (optional) move to a new line
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    _log info "Installing NVM"
    curl -o- https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
    __source_nvm # make sure nvm is sourced
  else
    _log error "Install nvm first and make sure it is in your path and try again"
    _log warn "To install NVM visit https://github.com/creationix/nvm#installation"
    exit
  fi
}

__source_nvm(){
  local NVM_PATH
  NVM_PATH=$(find_up .nvm/nvm.sh)
  # shellcheck disable=SC1090
  [ -s "$NVM_PATH" ] && \. "$NVM_PATH"  # This loads nvm
}

__load_or_install_nvm(){
  local NVM_PATH
  NVM_PATH=$(find_up .nvm/nvm.sh)
  if [ -z "$NVM_PATH" ]; then
    # didn't find it
    __prompt_install_nvm
  else
    # source NVM
    __source_nvm
  fi
}

__direnv_nvm_use_node(){
  local NVM_PATH
  NVM_PATH=$(find_up .nvm/nvm.sh)
    NVM_PATH="${NVM_PATH/\/nvm.sh/}"

    local NODE_VERSION="$NODE_VERSION"

    # if the version id is an alias cat the file for the version
    if [ -f "${NVM_PATH}/alias/${NODE_VERSION}" ]; then
      NODE_VERSION=$(< "${NVM_PATH}/alias/${NODE_VERSION}")
    fi

    # remove 'v' prefix for direnv
    NODE_VERSION="${NODE_VERSION/v/}"
    export NODE_VERSIONS="${NVM_PATH}/versions/node"
    export NODE_VERSION_PREFIX="v"


    if [ "$nvmrc_node_version" = "N/A" ]; then
      _log warn "Installing missing node version"
      local install_output
      install_output=$(nvm install "$version" --latest-npm)
     _log "$install_output"
   fi
    use node "$NODE_VERSION"
}

__nvm_use_or_install_version(){
  local version="$NODE_VERSION"

  local nvmrc_node_version
  nvmrc_node_version=$(nvm version "$version")
  if [ "$nvmrc_node_version" = "N/A" ]; then
    _log warn "Installing missing node version"
    local install_output
    install_output=$(nvm install "$version" --latest-npm)
    _log "$install_output"
  fi
}

_log() {
  local msg=$*
  local color_normal
  local color_success

  color_normal=$(tput sgr0;)
  color_error=$(tput setaf 1;)
  color_success=$(tput bold; tput setaf 2;)
  color_warn=$(tput setaf 3;)
  color_info=$(tput setaf 6;)
  color_prompt=$(tput bold;)

  # default color
  current_color="${color_normal}"

  if [[ -n $2 ]]; then
    local message_type=$1
    # remove message type from the string (plus a space)
    msg=${msg/$message_type /}
    if [ "$message_type" = "warn" ]; then
      current_color="${color_warn}"
    fi
    if [ "$message_type" = "info" ]; then
      current_color="${color_info}"
    fi
    if [ "$message_type" = "success" ]; then
      current_color="${color_success}"
    fi
    if [ "$message_type" = "error" ]; then
      current_color="${color_error}"
    fi
    if [ "$message_type" = "prompt" ]; then
      current_color="${color_info}"
      color_normal="${color_prompt}"
    fi
  fi

  if [[ -n $DIRENV_LOG_FORMAT ]]; then
    # shellcheck disable=SC2059
    printf "${current_color}${DIRENV_LOG_FORMAT}${color_normal}\n" "$msg" >&2
  fi
}

function comparedate() {
  local MAXAGE
  MAXAGE=$(bc <<< '24*60*60') # seconds in 24 hours
  # file age in seconds = current_time - file_modification_time.
  if [ "$(uname -s)" == "Darwin" ]; then
    local FILEAGE=$(($(date +%s) - $(stat -f '%m' "$1")))
  else
    local FILEAGE=$(($(date +%s) - $(stat -c '%Y' "$1")))
  fi
  test $FILEAGE -gt "$MAXAGE" && {
      echo "Time to check for an update..."
  }
}

requires_nvm(){
  _log warn "(.nvmrc detected) 'requires_nvm' no longer needed in .envrc and you may remove it"
}

__use_yarn(){
  local NOT_INSTALLED
  NOT_INSTALLED=$(which yarn)
  if [ -z "$NOT_INSTALLED" ]; then
    _log prompt "Couldn't find yarn..."
    read -p "Should I install it via homebrew? " -n 1 -r
    echo    # (optional) move to a new line
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      _log info "Installing yarn via homebrew..."
      brew install yarn
    else
      _log error "You'll need to install yarn before you can run the project"
      _log warn "Visit https://classic.yarnpkg.com/en/docs/install to learn how"
      exit
    fi
  else
    if [ ! -d ./node_modules ]; then
      _log warn "Installing packages"
      # no node modules... install via yarn
      yarn
    fi
    _log success "Good to go, 'yarn start' for local development"
  fi
}

__requires_npm_or_yarn(){
  if [[ -f "yarn.lock" && -f "package-lock.json" ]]; then
    # project misconfigured... has both package-lock.json and yarn.lock
    _log error "ERROR! This project has both a package-lock.json (npm install) and a yarn.lock (yarn)"
    _log warn "Exiting... you should remove one or the other and settle on one package manager"
  else
    if [ -f "yarn.lock" ]; then
      __use_yarn
    else
      if [ ! -d ./node_modules ]; then
        # no node modules... run npm install
        _log warn "Installing packages"
        npm install
      fi
    fi
  fi
}


layout_nvm(){
  __load_or_install_nvm
  __nvm_use_or_install_version
  __direnv_nvm_use_node
  __requires_npm_or_yarn
}

layout_project(){

  if [[ -n "$NODE_VERSION" ]]; then
    layout_nvm
  fi

  # FIXME: use node for JSON
  # if we have a package json do some node project detection
  if [[ -f "package.json" ]]; then
    # set some env vars that might be useful
    # package version
    # shellcheck disable=SC2002
    NPM_PACKAGE_VERSION=$(cat package.json \
      | grep version \
      | head -1 \
      | awk -F: '{ print $2 }' \
      | sed 's/[ ",\t\r\n]//g'  )
    export NPM_PACKAGE_VERSION
    # package name
    # shellcheck disable=SC2002
    NPM_PACKAGE_NAME=$(cat package.json \
      | grep name \
      | head -1 \
      | awk -F: '{ print $2 }' \
      | sed 's/[ ",\t\r\n]//g'  )
    export NPM_PACKAGE_NAME
  fi
}

main() {
  layout_project
}

main