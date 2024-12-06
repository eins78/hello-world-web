ARG BASEIMAGE
FROM ${BASEIMAGE:-"node:22.12.0-alpine"} as prod
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

WORKDIR /app

# prepare system
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# to optimize docker layer caching, copy the minimum set of files needed to fetch dependencies
COPY .npmrc pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch --prod

# copy app source
COPY package.json pnpm-workspace.yaml ./
COPY ./packages/app/ ./packages/app/
COPY ./packages/lit-ssr-demo/ ./packages/lit-ssr-demo/

# install prod dependencies fetched in earlier step
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm --dir ./packages/app install --offline --prod --frozen-lockfile --ignore-scripts

# run app
USER nodejs

# ensure pnpm is installed in image
RUN pnpm --version

# set default ports, overide with `docker run -e PORT=80 -p 80:80`
ENV PORT=7777
EXPOSE 7777

HEALTHCHECK CMD node --experimental-fetch --no-warnings bin/healthcheck.mjs || exit 1

ENV APP_TITLE="Hello Dockerfile!"

# start app
CMD pnpm start
