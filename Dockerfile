FROM node:22-bullseye

RUN corepack enable && corepack prepare pnpm@11.18.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

ENV CI=true
RUN apt-get update && apt-get install -y --no-install-recommends libssl1.1 ca-certificates && rm -rf /var/lib/apt/lists/*
RUN pnpm install

COPY . .

RUN pnpm prisma generate

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start:prod"]