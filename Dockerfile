FROM node:20.19.0-alpine3.20 AS base

RUN npm install -g --ignore-scripts pnpm@9.5.0

# ---

FROM base AS builder

RUN apk --no-cache add g++ make py3-pip

WORKDIR /garden-snail

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ---

FROM base AS runner

# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#non-root-user
RUN deluser --remove-home node && addgroup -S node -g 1000 && adduser -S -G node -u 1000 node

# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#handling-kernel-signals
RUN apk --no-cache add tini

WORKDIR /garden-snail

RUN chown -R node:node .
COPY --chown=node:node package.json pnpm-lock.yaml ./

# with NODE_ENV=production pnpm will not install devDependencies 
ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile

COPY --from=builder --chown=node:node /garden-snail/dist ./dist

USER node

EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "node", "dist/main"]
