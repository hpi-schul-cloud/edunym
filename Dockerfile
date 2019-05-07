FROM node:8.15

WORKDIR /home/node/app

# Copy current directory to container
COPY ./package.json .

RUN npm install -g yarn

# Run npm install 
RUN yarn install

COPY . .

EXPOSE 5000
EXPOSE 5001

CMD yarn start
