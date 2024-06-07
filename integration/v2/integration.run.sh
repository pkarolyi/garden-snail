#!/bin/sh

set -e

turbo_version="$1"

if [ -z "$turbo_version" ]
then
  echo "Usage: $0 <turbo_version>"
  exit 2
fi

echo "Testing with turbo version: $turbo_version"

echo "Installing turbo@$turbo_version ..."
pnpm add "turbo@$turbo_version" --global


echo "Running first build ..."
pnpm exec turbo build

echo "Removing local cache files ..."
rm -r ./.turbo/cache ./.next

echo "Running second build ..."
build_output=$(pnpm exec turbo build)

echo "$build_output"

if (echo "$build_output" | grep -q "Remote caching enabled") \
&& (echo "$build_output" | grep -q "cache hit, replaying logs") \
&& (echo "$build_output" | grep -q "FULL TURBO")
then
  echo "SUCCESS"
  exit 0
else
  echo "FAILURE"
  exit 1
fi

