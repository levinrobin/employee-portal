FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY public ./public

COPY src ./src

ARG REACT_APP_API_URL=http://localhost:3001/api

ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/build ./build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s \

  CMD wget -qO- http://localhost:3000 || exit 1

CMD ["serve", "-s", "build", "-l", "3000"]
 