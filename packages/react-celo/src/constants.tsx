import { isMobile } from 'react-device-detect';

import {
  Celo,
  CeloDance,
  CeloTerminal,
  ChromeExtensionStore,
  Ethereum,
  Ledger,
  MetaMask,
  PrivateKey,
  SteakWallet,
  Valora,
  WalletConnect,
} from './components/icons';
import {
  ChainId,
  Maybe,
  Network,
  Provider,
  WalletConnectProvider,
} from './types';
import { isEthereumFromMetamask, isEthereumPresent } from './utils/ethereum';

export enum localStorageKeys {
  lastUsedAddress = 'react-celo/last-used-address',
  lastUsedNetwork = 'react-celo/last-used-network',
  lastUsedWalletType = 'react-celo/last-used-wallet',
  lastUsedWalletId = 'react-celo/last-used-wallet-id',
  lastUsedWalletArguments = 'react-celo/last-used-wallet-arguments',
  lastUsedFeeCurrency = 'react-celo/last-used-fee-currency',
}

export enum SupportedProviders {
  CeloExtensionWallet = 'Celo Extension Wallet',
  CeloTerminal = 'Celo Terminal',
  CeloWallet = 'Celo Wallet',
  CeloDance = 'CeloDance',
  Injected = 'Injected',
  Ledger = 'Ledger',
  MetaMask = 'MetaMask',
  PrivateKey = 'Private key',
  Valora = 'Valora',
  WalletConnect = 'WalletConnect',
  Steakwallet = 'Steakwallet',
}
export enum WalletTypes {
  Valora = 'Valora',
  MetaMask = 'MetaMask',
  WalletConnect = 'WalletConnect',
  CeloDance = 'CeloDance',
  CeloWallet = 'CeloWallet',
  CeloTerminal = 'CeloTerminal',
  CeloExtensionWallet = 'CeloExtensionWallet',
  Ledger = 'Ledger',
  Injected = 'Injected',
  PrivateKey = 'PrivateKey',
  Unauthenticated = 'Unauthenticated',
}

export enum Priorities {
  Default = 0,
  Popular = 1,
  Recent = 2,
}

export enum Platform {
  Mobile = 'Mobile',
  Desktop = 'Desktop',
  Web = 'Web',
}

export const WalletIds = {
  Valora: 'd01c7758d741b363e637a817a09bcf579feae4db9f5bb16f599fdd1f66e2f974',
  CeloWallet:
    '36d854b702817e228d5c853c528d7bdb46f4bb041d255f67b82eb47111e5676b',
  CeloDance: 'TODO',
  CeloTerminal:
    '8f8506b7f191a8ab95a8295fc8ca147aa152b1358bee4283d6ad2468d97e0ca4',
  Steakwallet:
    'afbd95522f4041c71dd4f1a065f971fd32372865b416f95a0b1db759ae33f2a7',
};

export const PROVIDERS: {
  [K in SupportedProviders]: Provider | WalletConnectProvider;
} = {
  [SupportedProviders.Valora]: {
    name: SupportedProviders.Valora,
    type: WalletTypes.WalletConnect,
    description:
      'Connect to Valora, a mobile payments app that works worldwide',
    icon: Valora,
    canConnect: () => true,
    showInList: () => true,
    listPriority: () => Priorities.Popular,
    installURL: 'https://valoraapp.com/',
    walletConnectId: WalletIds.Valora,
    supportedPlatforms: [Platform.Mobile],
    getLink: (uri: string, platform = Platform.Mobile) => {
      switch (platform) {
        case Platform.Mobile:
          return `celo://wallet/wc?uri=${uri}`;
        default:
          return false;
      }
    },
  },
  [SupportedProviders.WalletConnect]: {
    name: SupportedProviders.WalletConnect,
    type: WalletTypes.WalletConnect,
    description: 'Scan a QR code to connect your wallet',
    icon: WalletConnect,
    canConnect: () => true,
    showInList: () => true,
    listPriority: () => Priorities.Popular,
    supportedPlatforms: [Platform.Mobile],
  },
  [SupportedProviders.Ledger]: {
    name: SupportedProviders.Ledger,
    type: WalletTypes.Ledger,
    description: 'Sync with your Ledger hardware wallet',
    icon: Ledger,
    canConnect: () => true,
    showInList: () => !isMobile,
    listPriority: () => Priorities.Popular,
  },
  [SupportedProviders.CeloWallet]: {
    name: SupportedProviders.CeloWallet,
    type: WalletTypes.WalletConnect,
    description: 'Connect to Celo Wallet for web or desktop',
    icon: Celo,
    canConnect: () => true,
    showInList: () => true,
    listPriority: () => (!isMobile ? 0 : 1),
    walletConnectId: WalletIds.CeloWallet,
    installURL: 'https://celowallet.app/',
    supportedPlatforms: [Platform.Desktop, Platform.Web],
    getLink: (uri: string, platform = Platform.Mobile) => {
      switch (platform) {
        case Platform.Desktop:
          return `celowallet://wc?uri=${encodeURIComponent(uri)}`;
        case Platform.Web:
          return `https://celowallet.app/wc?uri=${encodeURIComponent(uri)}`;
        default:
          return false;
      }
    },
  },
  [SupportedProviders.CeloTerminal]: {
    name: SupportedProviders.CeloTerminal,
    type: WalletTypes.WalletConnect,
    description: 'Connect to the Celo Terminal desktop app',
    icon: CeloTerminal,
    canConnect: () => true,
    showInList: () => !isMobile,
    listPriority: () => Priorities.Default,
    installURL: 'https://celoterminal.com/',
    walletConnectId: WalletIds.CeloTerminal,
    supportedPlatforms: [],
  },
  [SupportedProviders.MetaMask]: {
    name: SupportedProviders.MetaMask,
    type: WalletTypes.MetaMask,
    description: isMobile
      ? isEthereumFromMetamask()
        ? 'Connect with MetaMask Mobile App'
        : 'Open MetaMask Mobile App'
      : 'Use the Metamask browser extension. Celo support is limited.',
    icon: MetaMask,
    canConnect: () => isMobile || isEthereumFromMetamask(),
    showInList: () => true,
    listPriority: () => Priorities.Popular,
    installURL: isMobile
      ? 'https://metamask.app.link/dapp/' +
        window.location.href.replace(/^https?:\/\//, '')
      : 'https://metamask.app.link/',
  },
  [SupportedProviders.CeloExtensionWallet]: {
    name: SupportedProviders.CeloExtensionWallet,
    type: WalletTypes.CeloExtensionWallet,
    description: 'Use a wallet from the the Celo chrome extension',
    icon: ChromeExtensionStore,
    canConnect: () => !!window.celo,
    showInList: () => !isMobile,
    listPriority: () => Priorities.Default,
    installURL:
      'https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh/related',
  },
  [SupportedProviders.Injected]: {
    name: SupportedProviders.Injected,
    type: WalletTypes.Injected,
    description: 'Connect any Ethereum wallet to Celo',
    icon: Ethereum,
    canConnect: () => isEthereumPresent(),
    showInList: () => isEthereumFromMetamask(),
    listPriority: () => Priorities.Default,
  },
  [SupportedProviders.PrivateKey]: {
    name: SupportedProviders.PrivateKey,
    type: WalletTypes.PrivateKey,
    description:
      'Enter a plaintext private key to load your account (testing only)',
    icon: PrivateKey,
    canConnect: () => true,
    showInList: () => process.env.NODE_ENV !== 'production',
    listPriority: () => Priorities.Default,
  },
  [SupportedProviders.CeloDance]: {
    name: SupportedProviders.CeloDance,
    type: WalletTypes.WalletConnect,
    description: 'Send, vote, and earn rewards within one wallet',
    icon: CeloDance,
    canConnect: () => true,
    showInList: () => true,
    listPriority: () => Priorities.Default,
    installURL: 'https://celo.dance/',
    walletConnectId: WalletIds.CeloDance,
    supportedPlatforms: [Platform.Mobile],
    getLink: (uri: string, platform = Platform.Mobile) => {
      switch (platform) {
        case Platform.Mobile:
          return `celo://wallet/wc?uri=${uri}`;
        default:
          return false;
      }
    },
  },
  [SupportedProviders.Steakwallet]: {
    name: SupportedProviders.Steakwallet,
    description: 'Scan a QR code to connect your wallet',
    type: WalletTypes.WalletConnect,
    icon: SteakWallet,
    canConnect: () => true,
    showInList: () => true,
    listPriority: () => Priorities.Popular,
    installURL: 'https://steakwallet.fi/',
    walletConnectId: WalletIds.Steakwallet,
    supportedPlatforms: [Platform.Mobile],
    getLink: (uri: string, platform = Platform.Mobile) => {
      switch (platform) {
        case Platform.Mobile:
          return `steakwallet://wallet/wc?uri=${uri}`;
        default:
          return false;
      }
    },
  },
};

export const NetworkNames = {
  Alfajores: 'Alfajores' as const,
  Baklava: 'Baklava' as const,
  Mainnet: 'Mainnet' as const,
  Localhost: 'Localhost' as const,
};

export const Alfajores: Network = {
  name: NetworkNames.Alfajores,
  rpcUrl: 'https://alfajores-forno.celo-testnet.org',
  graphQl: 'https://alfajores-blockscout.celo-testnet.org/graphiql',
  explorer: 'https://alfajores-blockscout.celo-testnet.org',
  chainId: ChainId.Alfajores,
} as const;

export const Baklava: Network = {
  name: NetworkNames.Baklava,
  rpcUrl: 'https://baklava-forno.celo-testnet.org',
  graphQl: 'https://baklava-blockscout.celo-testnet.org/graphiql',
  explorer: 'https://baklava-blockscout.celo-testnet.org',
  chainId: ChainId.Baklava,
} as const;

export const Mainnet: Network = {
  name: NetworkNames.Mainnet,
  rpcUrl: 'https://forno.celo.org',
  graphQl: 'https://explorer.celo.org/graphiql',
  explorer: 'https://explorer.celo.org',
  chainId: ChainId.Mainnet,
} as const;

export const Localhost: Network = {
  name: NetworkNames.Localhost,
  rpcUrl: 'http://localhost:8545',
  graphQl: '',
  explorer: '',
  chainId: 1337,
} as const;

/**
 * These wallets cannot have their networks
 * updated via react-celo
 */
export const STATIC_NETWORK_WALLETS = [WalletTypes['CeloExtensionWallet']];

/**
 * Gets the provider associated with a wallet type.
 * @param wallet
 * @returns
 */
export const getProviderForWallet = (
  wallet: WalletTypes
): Maybe<SupportedProviders> =>
  wallet === WalletTypes.Unauthenticated ? null : SupportedProviders[wallet];

/**
 * Default networks to connect to.
 */
export const DEFAULT_NETWORKS = [
  Mainnet,
  Alfajores,
  Baklava,
  ...(process.env.NODE_ENV !== 'production' ? [Localhost] : []),
];

/**
 * Chain ID of a default network.
 */
export type DefaultChainId = ChainId.Mainnet | ChainId.Alfajores;
