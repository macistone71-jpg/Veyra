#!/bin/zsh
cd "$(dirname "$0")"
if [ ! -d node_modules ]; then npm install; fi
npm run dev -- --open
