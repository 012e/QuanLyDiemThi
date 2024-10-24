FROM node:lts-iron AS build

WORKDIR /app

RUN npm install -g @angular/cli

COPY package*.json angular.json ./
RUN npm install --save-dev

COPY . .

RUN ["ng", "build", "--configuration", "production"]

FROM nginx:1.17.1-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
