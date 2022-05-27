import { TerminalError } from '../../Errors/ErrorCodes';
import { network, claimNetwork } from '../../config/config';
import Web3 from 'web3';
import { mmChains } from '../WEB3/chains';
declare const window: any;

export async function validate() {
  if (!window.ethereum || !window.ethereum!.isMetaMask) {
    throw new TerminalError({ code: 'NO_METAMASK' });
  }

  if (!window.ethereum.request) {
    throw new TerminalError({ code: 'NO_METAMASK' });
  }
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  if (accounts.length === 0) {
    throw new TerminalError({ code: 'NO_METAMASK' });
  }
  const chainId: string = await window.ethereum.request({ method: 'net_version' });
  if (chainId !== network && chainId !== claimNetwork) {
    throw new TerminalError({ code: 'METAMASK_WRONG_NETWORK' });
  }
}

export async function isCurrentChain(chainId: string): Promise<void> {
  const web3 = new Web3(window.ethereum);
  let currentChainId = await web3.eth.net.getId();
  if (currentChainId !== +chainId) {
    throw new Error(`Wrong network. Switch to ${mmChains[chainId].chainName}, please.`);
  }
}
