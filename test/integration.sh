#!/bin/sh

echo "Checking out https://github.com/vercel/turbo (sparse checkout for \"examples/basic\")..."
git clone -n --depth=1 --filter=tree:0 https://github.com/vercel/turbo.git
cd /turbo
git sparse-checkout set --no-cone "examples/basic"
git checkout

echo "pnpm install..."
cd /turbo/examples/basic
pnpm install --frozen-lockfile

echo "enablig turbo remote cache..."
mkdir .turbo
echo "{\"token\":\"token_abcd\",\"apiurl\":\"http://garden-snail:3000\",\"teamid\":\"team_testing\"}" > .turbo/config.json

echo "first build..."
pnpm build

echo "removing local cache files..."
rm -r ./apps/docs/.next ./apps/web/.next ./apps/docs/.turbo ./apps/web/.turbo ./node_modules/.cache

echo "second build..."
build_output=$(pnpm build)

echo "$build_output"

if (echo "$build_output" | grep -q "cache hit, replaying logs") && (echo "$build_output" | grep -q "FULL TURBO")
then
  echo "SUCCESS"
  exit 0
else
  echo "FAILURE"
  exit 1
fi

