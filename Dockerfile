FROM node:9.8-alpine
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install -g forever
RUN npm install

# Bundle app source
COPY . /usr/src/app

EXPOSE 3001-3010
CMD [ "npm", "start" ]