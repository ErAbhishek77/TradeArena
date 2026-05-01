# TradeVault Arena Multi-Admin Smart Contract Deployment Script
# Deploys to Vara Network (Testnet or Mainnet)
# Usage: .\deploy_to_vara.ps1 -Network "testnet" -InitialBtcPrice 1000000000000000

param (
    [string]$Network = "testnet",
    [string]$InitialBtcPrice = "1000000000000000"
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Color codes
$ColorReset = "`e[0m"
$ColorRed = "`e[31m"
$ColorGreen = "`e[32m"
$ColorYellow = "`e[33m"
$ColorBlue = "`e[34m"

# Configuration
$VARA_RPC_TESTNET = "wss://testnet.vara.network"
$VARA_RPC_MAINNET = "wss://mainnet.vara.network"
$PROJECT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$WASM_TARGET = "target\wasm32-unknown-unknown\release\tradevault_arena.wasm"

# Select RPC endpoint
if ($Network -eq "mainnet") {
    $VARA_RPC = $VARA_RPC_MAINNET
    Write-Host "${ColorYellow}⚠️  WARNING: Deploying to MAINNET${ColorReset}"
    Start-Sleep -Seconds 2
} else {
    $VARA_RPC = $VARA_RPC_TESTNET
    $Network = "testnet"
    Write-Host "${ColorBlue}ℹ️  Deploying to TESTNET${ColorReset}"
}

Write-Host "${ColorBlue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${ColorReset}"
Write-Host "${ColorBlue}TradeVault Arena Multi-Admin Deployment Script${ColorReset}"
Write-Host "${ColorBlue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${ColorReset}"
Write-Host ""

# Helper functions
function Print-Status {
    param([string]$Message)
    Write-Host "${ColorBlue}[*]${ColorReset} $Message"
}

function Print-Success {
    param([string]$Message)
    Write-Host "${ColorGreen}[✓]${ColorReset} $Message"
}

function Print-Error {
    param([string]$Message)
    Write-Host "${ColorRed}[✗]${ColorReset} $Message"
    exit 1
}

function Print-Info {
    param([string]$Message)
    Write-Host "${ColorYellow}[i]${ColorReset} $Message"
}

# Check prerequisites
Print-Status "Checking prerequisites..."

# Check Cargo
try {
    cargo --version | Out-Null
    Print-Success "Cargo found"
} catch {
    Print-Error "Cargo not found. Please install Rust: https://rustup.rs/"
}

# Check Vara CLI
try {
    vara --version | Out-Null
    Print-Success "Vara CLI available"
} catch {
    Print-Info "Vara CLI not found. Installing..."
    npm install -g @vara-js/cli
}

# Add wasm32 target
Print-Status "Ensuring wasm32-unknown-unknown target..."
rustup target add wasm32-unknown-unknown | Out-Null
Print-Success "wasm32 target ready"

# Navigate to project root
Push-Location $PROJECT_ROOT
Print-Success "Working directory: $PROJECT_ROOT"

# Build smart contract
Print-Status "Building smart contract for $Network..."
Write-Host "  Target: wasm32-unknown-unknown"
Write-Host "  Mode: release"
Write-Host ""

$buildOutput = cargo build --release --target wasm32-unknown-unknown 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host $buildOutput | Select-Object -Last 20
    Print-Error "Build failed. Check output above."
}

Write-Host $buildOutput | Select-Object -Last 5
Print-Success "Build complete"

# Verify WASM binary exists
if (-not (Test-Path $WASM_TARGET)) {
    Print-Error "WASM binary not found at $WASM_TARGET"
}

$wasmSize = (Get-Item $WASM_TARGET).Length / 1MB
Print-Success "WASM binary ready (Size: $([Math]::Round($wasmSize, 2)) MB)"

# Display deployment info
Write-Host ""
Write-Host "${ColorBlue}━━━━━━━━━━━━ Deployment Configuration ━━━━━━━━━━━━${ColorReset}"
Write-Host "Network:            $Network"
Write-Host "RPC Endpoint:       $VARA_RPC"
Write-Host "Initial BTC Price:  $InitialBtcPrice"
Write-Host "WASM Binary:        $WASM_TARGET"
Write-Host "Binary Size:        $([Math]::Round($wasmSize, 2)) MB"
Write-Host "${ColorBlue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${ColorReset}"

# Confirm deployment
Write-Host ""
$confirm = Read-Host "Proceed with deployment? (yes/no)"
if ($confirm -ne "yes") {
    Print-Error "Deployment cancelled"
}

# Deploy via Vara CLI
Print-Status "Deploying contract to $Network..."
Write-Host "  This may take 30-60 seconds..."
Write-Host ""

$deployOutput = @()
$deployOutput = vara deploy `
    --wasm $WASM_TARGET `
    --network $Network `
    --initial-balance $InitialBtcPrice 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host ($deployOutput -join "`n")
    Print-Error "Deployment failed. Check output above."
}

Write-Host ($deployOutput -join "`n")
Print-Success "Deployment submitted"

# Extract contract ID from output
$deploymentInfoFile = "docs\DEPLOYMENT_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
$null = New-Item -ItemType Directory -Force -Path "docs" -ErrorAction SilentlyContinue

# Save deployment log
$deployOutput | Out-File -FilePath "$deploymentInfoFile.log" -Encoding UTF8

# Create deployment info file
$deploymentInfo = @"
# Deployment Information

Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Network: $Network
Initial BTC Price: $InitialBtcPrice
WASM Binary Size: $([Math]::Round($wasmSize, 2)) MB
Deployer Admin: (Your wallet address)

## Check Deployment Status

Visit the explorer:
- Testnet: https://testnet.vara.network/explorer
- Mainnet: https://vara.network/explorer

Search for your transaction hash from the output above.

## Next Steps

1. Extract your Contract ID from the output above or explorer

2. Update frontend config with contract ID:
   - Edit: frontend\src\config.ts
   - Set: CONTRACTS.ARENA.NEW_ID = "<YOUR_CONTRACT_ID>"

3. Add additional admins (if needed):
   vara call <CONTRACT_ID> `
     --method "addAdmin" `
     --args "[""<NEW_ADMIN_ADDRESS>""]" `
     --network $Network

4. Verify deployment:
   vara contract info <CONTRACT_ID> --network $Network

## Useful Commands

# Get all admins
vara contract read <CONTRACT_ID> --method "admins" --network $Network

# Get current BTC price
vara contract read <CONTRACT_ID> --method "currentMockPrice" --network $Network

# Get all tournaments
vara contract read <CONTRACT_ID> --method "tournaments" --network $Network

## Resources

- Vara Network: https://vara.network
- Vara Explorer: https://$Network.vara.network/explorer
- Documentation: docs\MULTI_ADMIN_UPGRADE_GUIDE.md
- Technical Details: docs\SMART_CONTRACT_MULTI_ADMIN_TECHNICAL.md

## Deployment Log

See: $deploymentInfoFile.log

"@

$deploymentInfo | Out-File -FilePath $deploymentInfoFile -Encoding UTF8
Print-Success "Deployment info saved to $deploymentInfoFile"

Write-Host ""
Write-Host "${ColorBlue}Next steps:${ColorReset}"
Write-Host "1. Locate your Contract ID from the deployment output above"
Write-Host "2. Update frontend configuration with contract ID"
Write-Host "3. Add additional admins if needed using add_admin()"
Write-Host "4. Test in frontend before production use"
Write-Host ""
Write-Host "Deployment summary saved: $deploymentInfoFile"
Write-Host "Deployment log saved: $deploymentInfoFile.log"

Print-Success "Deployment script completed"

Pop-Location
