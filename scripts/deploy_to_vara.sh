#!/bin/bash

# TradeVault Arena Multi-Admin Smart Contract Deployment Script
# Deploys to Vara Network (Testnet or Mainnet)
# Usage: ./deploy.sh [testnet|mainnet] [initial-btc-price]

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
NETWORK="${1:-testnet}"
INITIAL_BTC_PRICE="${2:-1000000000000000}"

# Configuration
VARA_RPC_TESTNET="wss://testnet.vara.network"
VARA_RPC_MAINNET="wss://mainnet.vara.network"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WASM_TARGET="target/wasm32-unknown-unknown/release/tradevault_arena.wasm"

# Select RPC endpoint
if [ "$NETWORK" = "mainnet" ]; then
    VARA_RPC=$VARA_RPC_MAINNET
    echo -e "${YELLOW}⚠️  WARNING: Deploying to MAINNET${NC}"
    sleep 2
else
    VARA_RPC=$VARA_RPC_TESTNET
    NETWORK="testnet"
    echo -e "${BLUE}ℹ️  Deploying to TESTNET${NC}"
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}TradeVault Arena Multi-Admin Deployment Script${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Function to print status
print_status() {
    echo -e "${BLUE}[*]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
    exit 1
}

print_info() {
    echo -e "${YELLOW}[i]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command -v cargo &> /dev/null; then
    print_error "Cargo not found. Please install Rust: https://rustup.rs/"
fi
print_success "Cargo found"

if ! command -v vara &> /dev/null; then
    print_info "Vara CLI not found. Installing..."
    npm install -g @vara-js/cli
fi
print_success "Vara CLI available"

# Ensure wasm32 target
print_status "Ensuring wasm32-unknown-unknown target..."
rustup target add wasm32-unknown-unknown 2>/dev/null || true
print_success "wasm32 target ready"

# Navigate to project root
cd "$PROJECT_ROOT"
print_success "Working directory: $PROJECT_ROOT"

# Build smart contract
print_status "Building smart contract for $NETWORK..."
echo "  Target: wasm32-unknown-unknown"
echo "  Mode: release"

if ! cargo build --release --target wasm32-unknown-unknown 2>&1 | tail -20; then
    print_error "Build failed. Check output above."
fi

if [ ! -f "$WASM_TARGET" ]; then
    print_error "WASM binary not found at $WASM_TARGET"
fi

WASM_SIZE=$(du -h "$WASM_TARGET" | cut -f1)
print_success "Build complete (Size: $WASM_SIZE)"

# Verify WASM binary
print_status "Verifying WASM binary..."
if file "$WASM_TARGET" | grep -q "WebAssembly"; then
    print_success "WASM binary valid"
else
    print_error "Invalid WASM binary"
fi

# Display deployment info
echo ""
echo -e "${BLUE}━━━━━━━━━━━━ Deployment Configuration ━━━━━━━━━━━━${NC}"
echo "Network:            $NETWORK"
echo "RPC Endpoint:       $VARA_RPC"
echo "Initial BTC Price:  $INITIAL_BTC_PRICE"
echo "WASM Binary:        $WASM_TARGET"
echo "Binary Size:        $WASM_SIZE"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Confirm deployment
echo ""
read -p "Proceed with deployment? (yes/no): " -r
echo ""
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    print_error "Deployment cancelled"
fi

# Deploy via Vara CLI
print_status "Deploying contract to $NETWORK..."
echo "  This may take 30-60 seconds..."
echo ""

DEPLOY_OUTPUT=$(mktemp)

if vara deploy \
    --wasm "$WASM_TARGET" \
    --network "$NETWORK" \
    --initial-balance "$INITIAL_BTC_PRICE" \
    2>&1 | tee "$DEPLOY_OUTPUT"; then
    
    print_success "Deployment submitted"
else
    print_error "Deployment failed. Check output above."
fi

# Extract contract ID from output
CONTRACT_ID=$(grep -oP "Contract ID: \K[^,\s]+" "$DEPLOY_OUTPUT" || echo "")

if [ -n "$CONTRACT_ID" ]; then
    print_success "Contract deployed successfully!"
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━ Deployment Summary ━━━━━━━━━━━${NC}"
    echo "Contract ID:  $CONTRACT_ID"
    echo "Network:      $NETWORK"
    echo "Admin:        (Deployer wallet)"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Save deployment info
    DEPLOY_INFO_FILE="docs/DEPLOYMENT_$(date +%Y%m%d_%H%M%S).txt"
    mkdir -p docs
    cat > "$DEPLOY_INFO_FILE" << EOF
# Deployment Information

Date: $(date)
Network: $NETWORK
Contract ID: $CONTRACT_ID
Initial BTC Price: $INITIAL_BTC_PRICE
WASM Binary Size: $WASM_SIZE
Deployer Admin: (Your wallet address)

## Next Steps

1. Update frontend config with contract ID:
   - Edit: frontend/src/config.ts
   - Set: CONTRACTS.ARENA.NEW_ID = "$CONTRACT_ID"

2. Add additional admins (if needed):
   vara call $CONTRACT_ID \\
     --method "addAdmin" \\
     --args "[\"<NEW_ADMIN_ADDRESS>\"]" \\
     --network $NETWORK

3. Verify deployment:
   vara contract info $CONTRACT_ID --network $NETWORK

## Useful Commands

Get all admins:
  vara contract read $CONTRACT_ID --method "admins" --network $NETWORK

Get current BTC price:
  vara contract read $CONTRACT_ID --method "currentMockPrice" --network $NETWORK

Get all tournaments:
  vara contract read $CONTRACT_ID --method "tournaments" --network $NETWORK

## Resources

- Vara Explorer: https://$NETWORK.vara.network/explorer
- Contract Address: $CONTRACT_ID
- Documentation: docs/MULTI_ADMIN_UPGRADE_GUIDE.md

EOF
    
    print_success "Deployment info saved to $DEPLOY_INFO_FILE"
    
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Update frontend configuration with contract ID"
    echo "2. Add additional admins if needed using add_admin()"
    echo "3. Test in frontend before production use"
    echo ""
    echo "Deployment info saved: $DEPLOY_INFO_FILE"
    
else
    print_error "Could not extract contract ID from deployment. Check console output above."
fi

rm -f "$DEPLOY_OUTPUT"

print_success "Deployment script completed"
