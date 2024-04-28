FROM node:20.12-alpine3.18

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install -g --ignore-scripts pnpm@9.0.2

COPY ./turbo-test-project ./turbo-test-project

WORKDIR /turbo-test-project
RUN pnpm install --frozen-lockfile

COPY ./integration.run.sh .

ENTRYPOINT ["sh", "integration.run.sh"]
