#!/bin/zsh
set -euo pipefail

cd /Users/goodday/Documents/meme/launch

if curl -fsS --max-time 2 http://127.0.0.1:5173/ 2>/dev/null | /usr/bin/grep -q 'True Wealth · BNB Chain launch'; then
  open -a 'Brave Browser' 'http://127.0.0.1:5173/'
  echo "本机页面已经在运行，已在 Brave 打开。"
  exit 0
fi

if [[ ! -d node_modules ]]; then
  echo "首次启动：正在安装固定版本依赖……"
  npm ci
fi

if [[ ! -f artifacts/contracts/TrueWealth.sol/TrueWealth.json ]]; then
  echo "首次启动：正在编译合约……"
  npm run compile
fi

echo "正在启动本机页面。请保持这个终端窗口打开。"
npm run launch-ui -- --strictPort &
server_pid=$!
trap 'kill $server_pid 2>/dev/null || true' EXIT INT TERM

ready=0
for attempt in {1..30}; do
  if curl -fsS --max-time 1 http://127.0.0.1:5173/ >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 1
done

if [[ "$ready" != "1" ]]; then
  echo "本机页面没有启动，请查看上面的报错。"
  exit 1
fi

open -a 'Brave Browser' 'http://127.0.0.1:5173/'
echo "页面已在 Brave 打开：http://127.0.0.1:5173/"
echo "关闭此终端窗口将停止本机页面；不会影响已经完成的链上交易。"
wait $server_pid
