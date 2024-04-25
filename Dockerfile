ARG BASEIMAGE
FROM $BASEIMAGE as prod

WORKDIR /app

# prepare system
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# to optimize docker layer caching, copy the minimum set of files needed to fetch dependencies
RUN wget -qO- https://get.pnpm.io/v6.16.js | node - add --global pnpm
COPY pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch --prod

# copy app source
COPY . ./
# install prod dependencies fetched in earlier step
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --offline --prod --frozen-lockfile --ignore-scripts

# run app
USER nodejs

# set default ports, overide with `docker run -e PORT=80 -p 80:80`
ENV PORT=7777
EXPOSE 7777

HEALTHCHECK CMD node --experimental-fetch --no-warnings bin/healthcheck.mjs || exit 1

ENV APP_TITLE="Hello Dockerfile!"

# start app
CMD npm start
