FROM node:16.20.1-alpine3.18

WORKDIR /usr/src/app

COPY --chown=nobody:nogroup . .

RUN mkdir -p /nonexistent && chown nobody:nogroup /nonexistent

RUN npm ci

USER nobody

EXPOSE 3000

ENTRYPOINT [ "npm", "start"]
