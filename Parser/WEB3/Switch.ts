import { TerminalError } from '../../Errors/ErrorCodes';
import { mmChains } from '../WEB3/chains';
declare const window: any;

const switchChain = async (network: string): Promise<void> => {
  if (!window.ethereum || !window.ethereum!.isMetaMask) {
    throw new TerminalError({ code: 'NO_METAMASK' });
  }
  if (!window.ethereum.request) {
    throw new TerminalError({ code: 'METAMASK_WRONG_NETWORK' });
  }

  network = network.toLowerCase();

  const { chainIdHex, chainName, rpcUrls, nativeCurrency, blockExplorerUrls } = mmChains[network];

  if (chainIdHex === '0x1' || chainIdHex === '0x3') {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: chainIdHex,
          },
        ],
      });
      return;
    } catch (e) {
      throw new Error(e.message);
    }
  }
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: chainIdHex,
          chainName,
          rpcUrls,
          nativeCurrency,
          blockExplorerUrls,
        },
      ],
    });
    return;
  } catch (e) {
    throw new Error(e.message);
  }
};

export default switchChain;
