// Stellar Network Configuration

export const STELLAR_CONFIG = {
  // Network configuration
  network: 'testnet', // Change to 'mainnet' for production

  // RPC URLs
  rpcUrls: {
    testnet: 'https://soroban-testnet.stellar.org',
    futurenet: 'https://rpc-futurenet.stellar.org',
    mainnet: 'https://soroban-mainnet.stellar.org'
  },

  // Horizon URLs (for account operations)
  horizonUrls: {
    testnet: 'https://horizon-testnet.stellar.org',
    futurenet: 'https://horizon-futurenet.stellar.org',
    mainnet: 'https://horizon.stellar.org'
  },

  // Network passphrases
  networkPassphrases: {
    testnet: 'Test SDF Network ; September 2015',
    futurenet: 'Test SDF Future Network ; October 2022',
    mainnet: 'Public Global Stellar Network ; September 2015'
  },

  // Contract ID - UPDATE THIS AFTER DEPLOYMENT
  contractId: 'CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',

  // Explorer URLs
  explorerUrls: {
    testnet: 'https://stellar.expert/explorer/testnet',
    futurenet: 'https://stellar.expert/explorer/futurenet',
    mainnet: 'https://stellar.expert/explorer/public'
  }
};

// Get current network config
export function getCurrentNetwork() {
  return {
    rpcUrl: STELLAR_CONFIG.rpcUrls[STELLAR_CONFIG.network],
    horizonUrl: STELLAR_CONFIG.horizonUrls[STELLAR_CONFIG.network],
    networkPassphrase: STELLAR_CONFIG.networkPassphrases[STELLAR_CONFIG.network],
    explorerUrl: STELLAR_CONFIG.explorerUrls[STELLAR_CONFIG.network]
  };
}

// Get contract explorer URL
export function getContractExplorerUrl() {
  const network = STELLAR_CONFIG.network;
  return `${STELLAR_CONFIG.explorerUrls[network]}/contract/${STELLAR_CONFIG.contractId}`;
}
