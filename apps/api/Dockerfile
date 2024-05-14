FROM node:18-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app
RUN npm install turbo -g
COPY . .
RUN turbo prune api --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install

COPY --from=builder /app/out/full/ .
COPY turbo.json ./turbo.json

WORKDIR /app/packages/db
RUN npx prisma migrate dev
WORKDIR /app
RUN npm install
RUN cp /app/node_modules/@prisma/engines/libquery_engine-linux-musl-openssl-3.0.x.so.node /app/node_modules/@prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node

RUN npx turbo build --filter=api...

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs
USER expressjs

COPY --from=installer /app .
# RUN cp /app/node_modules/@prisma/engines/query_engine-windows.dll.node /app/node_modules/@prisma/client/query_engine-windows.dll.node

CMD node apps/api/dist/index.js