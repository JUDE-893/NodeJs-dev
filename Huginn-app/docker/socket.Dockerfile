# docker/api.Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY . .

RUN npm install --legacy-peer-deps
RUN npm install -g nodemon --legacy-peer-deps

CMD ["npm", "run", "stream"]
