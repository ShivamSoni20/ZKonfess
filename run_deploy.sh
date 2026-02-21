#!/bin/bash
mv ./stellar ~/.cargo/bin/stellar-cli 2>/dev/null
chmod +x ~/.cargo/bin/stellar-cli
ln -sf ~/.cargo/bin/stellar-cli ~/.cargo/bin/stellar
export PATH="$PATH:$HOME/.cargo/bin:$HOME/.bun/bin"
cd "/mnt/d/Gihtub Main/Steller"
bun run deploy mock-game-hub zk-confession-box

