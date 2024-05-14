FROM node:18-alpine AS base

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN npm install turbo -g
COPY . .
RUN turbo prune worker --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

WORKDIR /app/packages/db
RUN npx prisma migrate dev
WORKDIR /app
RUN npm install
RUN cp /app/node_modules/@prisma/engines/libquery_engine-linux-musl-openssl-3.0.x.so.node /app/node_modules/@prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node

RUN npx turbo build --filter=worker...

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs
USER expressjs

COPY --from=installer /app .
# RUN cp /app/node_modules/@prisma/engines/query_engine-windows.dll.node /app/node_modules/@prisma/client/query_engine-windows.dll.node

CMD node apps/worker/dist/index.js