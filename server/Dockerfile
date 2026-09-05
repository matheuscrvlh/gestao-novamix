FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    libxml2 \
    libstdc++6 \
    libpam0g \
    libgssapi-krb5-2 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npx", "tsx", "src/server.ts"]