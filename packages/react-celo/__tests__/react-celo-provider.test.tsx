import '@testing-library/jest-dom';

import { CeloContract } from '@celo/contractkit';
import { act, fireEvent, render, renderHook } from '@testing-library/react';
import React, { ReactElement } from 'react';

import { Mainnet } from '../src/constants';
import { CeloProvider, CeloProviderProps } from '../src/react-celo-provider';
import { Maybe, Network, Theme } from '../src/types';
import { UseCelo, useCelo, useCeloInternal } from '../src/use-celo';
import defaultTheme from '../src/theme/default';

interface RenderArgs {
  providerProps: Partial<CeloProviderProps>;
}

const defaultProps: CeloProviderProps = {
  dapp: {
    name: 'Testing Celo React',
    description: 'Test it well',
    url: 'https://celo.developers',
    icon: '',
  },
  children: null,
};

function renderHookInCKProvider<R>(
  hook: (i: unknown) => R,
  { providerProps }: RenderArgs
) {
  return renderHook<R, unknown>(hook, {
    wrapper: ({ children }) => {
      const props = { ...defaultProps, ...providerProps };
      return <CeloProvider {...props}>{children}</CeloProvider>;
    },
  });
}

function renderComponentInCKProvider(
  ui: ReactElement<unknown, string>,
  { providerProps }: RenderArgs
) {
  return render(ui, {
    wrapper: ({ children }) => {
      const props = { ...defaultProps, ...providerProps };
      return <CeloProvider {...props}>{children}</CeloProvider>;
    },
  });
}

describe('CeloProvider', () => {
  describe('user interface', () => {
    const ConnectButton = () => {
      const { connect } = useCelo();
      return <button onClick={connect}>Connect</button>;
    };

    async function stepsToOpenModal() {
      const dom = renderComponentInCKProvider(<ConnectButton />, {
        providerProps: {},
      });

      const button = await dom.findByText('Connect');
      act(() => {
        fireEvent.click(button);
      });

      return dom;
    }

    describe('when Button with connect is Pressed', () => {
      it('opens wallets modal', async () => {
        const dom = await stepsToOpenModal();

        const modal = await dom.findByText('Connect a wallet');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        expect(modal).toBeVisible();
      });
    });
  });

  describe('hook interface', () => {
    const renderUseCelo = (props: Partial<CeloProviderProps>) =>
      renderHookInCKProvider<UseCelo>(useCelo, {
        providerProps: props,
      });

    const renderUseCeloInternal = (props: Partial<CeloProviderProps>) =>
      renderHookInCKProvider<UseCelo & { theme: Maybe<Theme> }>(
        useCeloInternal,
        {
          providerProps: props,
        }
      );

    describe('regarding networks', () => {
      const networks: Network[] = [
        {
          name: 'SecureFastChain',
          rpcUrl: 'https://rpc-mainnet.matic.network',
          explorer: 'https://explorer.example.com',
          chainId: 9812374,
          nativeCurrency: {
            name: 'SFC',
            symbol: 'SFC',
            decimals: 18,
          },
        },
        {
          name: 'BoringChain',
          rpcUrl: 'https://bsc-dataseed.binance.org/',
          explorer: 'https://explorer.boringchain.org',
          chainId: 0x38,
          nativeCurrency: {
            name: 'BORING',
            symbol: 'BOR',
            decimals: 18,
          },
        },
      ];

      it('defaults to Celo Mainnet', () => {
        const hookReturn = renderUseCelo({});
        expect(hookReturn.result.current.network).toEqual(Mainnet);
        hookReturn.unmount();
      });

      it('supports passing other networks', () => {
        const hookReturn = renderUseCelo({ networks, network: networks[0] });
        expect(hookReturn.result.current.networks).toEqual(networks);

        expect(hookReturn.result.current.network).toEqual(networks[0]);
        hookReturn.unmount();
      });

      it('updates the Current network', async () => {
        const { result, rerender, unmount } = renderUseCelo({ networks });

        // TODO Need to determine behavior when network is not in networks
        expect(result.current.network).toEqual(Mainnet);

        await act(async () => {
          await result.current.updateNetwork(networks[1]);
        });

        rerender();

        expect(result.current.network).toEqual(networks[1]);
        unmount();
      });
    });

    describe('regarding feeCurrency', () => {
      describe('when none given', () => {
        it('defaults to CELO', () => {
          const { result, unmount } = renderUseCelo({});
          expect(result.current.feeCurrency).toEqual(CeloContract.GoldToken);
          unmount();
        });
        it('does not set any feeCurrency on the kit', () => {
          const { result, unmount } = renderUseCelo({});
          expect(result.current.walletType).toEqual('Unauthenticated');
          expect(result.current.kit.connection.defaultFeeCurrency).toEqual(
            undefined
          );
          unmount();
        });
      });

      describe('when feeCurrency WhitelistToken passed', () => {
        it('sets that as the feeCurrency', () => {
          const { result } = renderUseCelo({
            feeCurrency: CeloContract.StableTokenBRL,
          });

          expect(result.current.feeCurrency).toEqual(
            CeloContract.StableTokenBRL
          );
        });

        it.todo('sets on the kit');

        it('allows updating feeCurrency', () => {
          const { result } = renderUseCelo({});

          expect(result.current.supportsFeeCurrency).toBe(false);
        });
      });
    });

    it('updates the current theme', () => {
      const { result, rerender } = renderUseCeloInternal({});

      // FIXME Need to determine behavior when network is not in networks
      expect(result.current.network).toEqual(Mainnet);

      act(() => {
        result.current.updateTheme(defaultTheme.light);
      });

      rerender();

      expect(result.current.theme).toEqual({
        background: '#ffffff',
        primary: '#6366f1',
        secondary: '#eef2ff',
        muted: '#e2e8f0',
        error: '#ef4444',
        text: '#000000',
        textSecondary: '#1f2937',
        textTertiary: '#64748b',
      });
    });
  });
});
