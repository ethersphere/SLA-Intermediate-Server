FROM node:16.15.0-buster-slim

WORKDIR /usr/src/app

COPY --chown=nobody:nogroup . .

RUN mkdir -p /nonexistent && chown nobody:nogroup /nonexistent

RUN npm ci

USER nobody

EXPOSE 3000

ENTRYPOINT [ "npm", "start"]
