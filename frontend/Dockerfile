FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY . .

ARG INTERNAL_API_BASE_URL=http://backend:7000
ENV INTERNAL_API_BASE_URL=${INTERNAL_API_BASE_URL}

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
