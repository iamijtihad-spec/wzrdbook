#!/bin/bash
set -e


# 0. Setup Path
export PATH="/Users/wzrdbook/.local/share/solana/install/active_release/bin:$PATH"

echo "🚀 Starting Devnet Deployment..."

# 1. Config
echo "⚙️ Configuring for Devnet..."
solana config set --url devnet

# 2. Fund
echo "💰 Airdropping SOL..."
# Try to airdrop a few times to ensure enough funds
solana airdrop 2 || true
sleep 2
solana airdrop 2 || true
sleep 2
solana balance

# 3. Build
echo "🏗️ Building programs..."
anchor build

# 4. Deploy
echo "🚀 Deploying programs..."
# Deploy explicit programs to ensure we map to the correct keys
anchor deploy --provider.cluster devnet

echo "✅ Deployment Complete!"
echo "Please report back to the agent."
