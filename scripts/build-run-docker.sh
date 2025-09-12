#!/bin/bash

set -exu -o pipefail

cd "$(dirname "$0")/.."

export IMG=hello-world-web
export PORT=8080
export "APP_TITLE=Hello ${USER}@$(hostname -s)"!

time docker buildx build --load -t $IMG .
docker run --rm -it -e APP_TITLE -e PORT -p $PORT:$PORT $IMG
