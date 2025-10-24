ARG BASEIMAGE
FROM ${BASEIMAGE:-"node:22.21.0-alpine"} AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm i -g corepack && pnpm -v
WORKDIR /build

# to optimize docker layer caching, copy the minimum set of files needed to fetch dependencies
COPY .npmrc pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm fetch --filter='!@hello-world-web/*tests'

# copy workspace
COPY . .

# install dependencies with offline mode for better caching
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --offline --frozen-lockfile --filter='!@hello-world-web/*tests'

# Build with production optimizations (enables minification in Rollup)
RUN NODE_ENV=production pnpm run build

# # create production deployment
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm deploy --filter=./packages/app --prod /app

ARG BASEIMAGE
FROM ${BASEIMAGE:-"node:22.21.0-alpine"} AS prod

RUN npm i -g corepack && pnpm -v
WORKDIR /app

# prepare system
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=builder /app /app

RUN chown -R nodejs:nodejs /app

# run app
USER nodejs

# ensure pnpm is installed in image
RUN pnpm --version

# set default ports, overide with `docker run -e PORT=80 -p 80:80`
ENV PORT=7777
EXPOSE 7777

HEALTHCHECK CMD pnpm run -s healthcheck

ENV APP_TITLE="Hello Dockerfile!"

# start app
CMD ["pnpm", "start"]
