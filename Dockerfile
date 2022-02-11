FROM node

WORKDIR /user/app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 9888

CMD ["npm","run","dev"]
