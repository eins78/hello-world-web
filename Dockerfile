ARG BASEIMAGE
FROM $BASEIMAGE as prod

WORKDIR /app

# prepare system
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# to optimize caching, copy the minimum set of files needed to install dependencies
COPY package.json package-lock.json ./
RUN npm ci --production --ignore-scripts \
    && rm -rf /root/.npm

# copy app source
COPY . ./

# run app
USER nodejs

# set default ports, overide with `docker run -e PORT=80 -p 80:80`
ENV PORT=7777
EXPOSE 7777

HEALTHCHECK CMD node --experimental-fetch --no-warnings bin/healthcheck.mjs || exit 1

ENV APP_TITLE="Hello Dockerfile!"

# start app
CMD npm start