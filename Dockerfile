FROM node:16.20.1-alpine3.18
WORKDIR /usr/src/app
COPY --chown=nobody:nogroup . .
RUN mkdir -p /nonexistent && chown nobody:nogroup /nonexistent
# Use /tmp for npm cache
RUN npm ci --cache /tmp/.npm
USER nobody
EXPOSE 3000
# Set npm cache to /tmp at runtime
ENV npm_config_cache=/tmp/.npm
ENTRYPOINT [ "npm", "start"]
