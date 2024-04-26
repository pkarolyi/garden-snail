FROM node:20.12-alpine3.18 AS base

RUN npm install -g --ignore-scripts pnpm@9.0.2

# ---

FROM base AS builder

RUN apk --no-cache add g++ make py3-pip

WORKDIR /garden-snail

COPY package.json pnpm-lock.yaml ./
COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm build

# ---

FROM base AS runner

WORKDIR /garden-snail

COPY package.json pnpm-lock.yaml ./

# with NODE_ENV=production pnpm will not install devDependencies 
ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile

COPY --from=builder --chown=node:node /garden-snail/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]


