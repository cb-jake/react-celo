import { CeloTokenContract } from '@celo/contractkit/lib/base';
import {
  MiniContractKit,
  newKit,
  newKitFromWeb3,
} from '@celo/contractkit/lib/mini-kit';

import { localStorageKeys, WalletTypes } from '../constants';
import { Connector, Maybe, Network } from '../types';
import { getEthereum, getInjectedEthereum } from '../utils/ethereum';
import {
  clearPreviousConfig,
  setTypedStorageKey,
} from '../utils/local-storage';
import { switchToCeloNetwork } from '../utils/metamask';
import { persist, Web3Type } from './common';

export default class InjectedConnector implements Connector {
  public initialised = false;
  public type = WalletTypes.Injected;
  public kit: MiniContractKit;
  public account: Maybe<string> = null;
  private onNetworkChangeCallback?: (chainId: number) => void;
  private onAddressChangeCallback?: (address: Maybe<string>) => void;
  private network: Network;

  constructor(
    network: Network,
    public feeCurrency: CeloTokenContract,
    defaultType: WalletTypes = WalletTypes.Injected
  ) {
    this.type = defaultType;
    this.kit = newKit(network.rpcUrl);
    this.network = network;
  }

  persist() {
    persist({
      walletType: this.type,
      network: this.network,
    });
  }

  async initialise(): Promise<this> {
    const injected = await getInjectedEthereum();
    if (!injected) {
      throw new Error('Ethereum wallet not installed');
    }
    const { web3, ethereum, isMetaMask } = injected;

    this.type = isMetaMask ? WalletTypes.MetaMask : WalletTypes.Injected;

    const [defaultAccount] = await ethereum.request({
      method: 'eth_requestAccounts',
    });

    ethereum.removeListener('chainChanged', this.onChainChanged);
    ethereum.removeListener('accountsChanged', this.onAccountsChanged);
    await switchToCeloNetwork(this.kit, this.network, ethereum);
    ethereum.on('chainChanged', this.onChainChanged);
    ethereum.on('accountsChanged', this.onAccountsChanged);

    this.kit = newKitFromWeb3(web3 as unknown as Web3Type);

    this.kit.connection.defaultAccount = defaultAccount;
    this.account = defaultAccount ?? null;
    this.initialised = true;

    this.persist();

    return this;
  }

  private onChainChanged = (chainIdHex: string) => {
    const chainId = parseInt(chainIdHex, 16);
    if (this.onNetworkChangeCallback && this.network.chainId !== chainId) {
      this.onNetworkChangeCallback(chainId);
    }
  };

  private onAccountsChanged = (accounts: string[]) => {
    if (this.onAddressChangeCallback) {
      this.kit.connection.defaultAccount = accounts[0];
      this.onAddressChangeCallback(accounts[0] ?? null);
    }
  };

  supportsFeeCurrency() {
    return false;
  }

  async updateKitWithNetwork(network: Network): Promise<void> {
    setTypedStorageKey(localStorageKeys.lastUsedNetwork, network.name);
    this.network = network;
    await this.initialise();
  }

  onNetworkChange(callback: (chainId: number) => void): void {
    this.onNetworkChangeCallback = callback;
  }

  onAddressChange(callback: (address: Maybe<string>) => void): void {
    this.onAddressChangeCallback = callback;
  }

  close(): void {
    clearPreviousConfig();
    const ethereum = getEthereum();
    if (ethereum) {
      ethereum.removeListener('chainChanged', this.onChainChanged);
      ethereum.removeListener('accountsChanged', this.onAccountsChanged);
    }
    this.onNetworkChangeCallback = undefined;
    this.onAddressChangeCallback = undefined;
    return;
  }
}
