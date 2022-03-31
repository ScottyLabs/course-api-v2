FROM node:14-alpine
RUN apk update && apk add curl wget
RUN (curl -Ls https://cli.doppler.com/install.sh || wget -qO- https://cli.doppler.com/install.sh) | sh
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .
RUN npm run build
ENTRYPOINT ["doppler", "run", "--"]
EXPOSE 3000
CMD ["node", "dist/app.js"]
