# alpine in docker world means small/compact image as possible
FROM node:alpine
WORKDIR /usr/app
COPY ./package.json ./
# npm -> node package manager for installing dependencies of node.js 
RUN npm install
COPY ./ ./
CMD ["npm", "start"]
