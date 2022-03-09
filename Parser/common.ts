import {
  textLine,
  textWord,
  anchorWord
} from 'crt-terminal';
import Big from 'big.js';
import connectMetamask from './WEB3/ConnectMetamask';
import switchChain from './WEB3/Switch';
import addToken from './WEB3/addTokenToMM';
import faucet from './WEB3/Faucet';
import messages from '../Messages/Messages';
import balance, { userShare } from './WEB3/Balance';
import { fromWei } from './WEB3/API/balance';
import tokenMap, { tokens } from './WEB3/API/addToken';
import notFoundStrings from '../Errors/notfound-strings'

export function timeConverter(UNIX_timestamp: number): string {
    const a = new Date(UNIX_timestamp * 1000);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = a.getFullYear();
    const month = months[a.getMonth()];
    const date = a.getDate();
    const hour = a.getHours();
    const min = a.getMinutes();
    const sec = a.getSeconds();
    const time = `${date} ${month} ${year} ${hour}:${min}:${sec}`;
    return time;
}

export function createWorker(handler: (handlers, arg, state) => Promise<void>, errMessage: string | null = null) {
  return async ({ lock, loading, print }, args: string, state) => {
    try {
      lock(true);
      loading(true);
      await handler({ lock, loading, print }, args, state)
      loading(false);
      lock(false);
    }
    catch (err) {
      console.log(err);
      let message
      if (!state[0]) {
        message = "First - connect the website by typing >join"
      } else {
        message = errMessage || err.message
      }
      print([textLine({ words: [textWord({ characters: message })] })]);
      loading(false);
      lock(false);
    }
  }
}

export async function connect(state) {
  const address = await connectMetamask();
  state[1](address)
  return address;
}

const ConnectMetamaskWorker = createWorker(async ({ print }, _, state) => {
  const address = await connect(state)
  print([textLine({ words: [textWord({ characters: `Connected succefuly: ${address}` })] })]);

}, "Error while connecting metamask, please try again")

const SwitchWorker = createWorker(async ({ print }) => {
  await switchChain();
  print([textLine({ words: [textWord({ characters: messages.chainSwitch })] })]);
}, "Error while switching chain, make sure metamask are connected.")

const BalanceWorker = createWorker(async ({ print }, TokenName, [userAddress]) => {
  if (TokenName === "all") {
    const token = tokenMap.sgton
    const balanceWei = Big(await balance(userAddress, token.address))
    const shareWei = await userShare(userAddress)

    const harvest = fromWei(balanceWei.minus(shareWei).toFixed(18));
    const share = fromWei(shareWei)
    const gton = fromWei(await balance(userAddress, tokenMap.gton.address))

    print([textLine({ words: [textWord({ characters: `Harvest: ${harvest.toFixed(4).replace(/0*$/, "")}` })] })]);
    print([textLine({ words: [textWord({ characters: `SGTON:   ${share.toFixed(4).replace(/0*$/, "")}` })] })]);
    print([textLine({ words: [textWord({ characters: `GTON:    ${gton.toFixed(4).replace(/0*$/, "")}` })] })]);
    return
  }

  const token = TokenName === "harvest" ? tokenMap.sgton : tokenMap[TokenName]
  if (!token) throw Error("Available tokens are: gton, sgton, harvest");
  const Balance = Big(await balance(userAddress, token.address));
  
  let CoinBalance;

  if (TokenName === "harvest") {
    const share = await userShare(userAddress);
    CoinBalance = fromWei(Balance.minus(share).toFixed(18));
  } else if (TokenName === "sgton") {
    CoinBalance = fromWei(await userShare(userAddress))
  } else {
    CoinBalance = fromWei(Balance.toFixed(18));
  }
  const res = messages.balance(CoinBalance.toFixed(18));
  print([textLine({ words: [textWord({ characters: res })] })]);
}, "Something went wrong, please try again")

const AddTokenWorker = createWorker(async ({ print }, TokenName) => {
  const token = tokenMap[TokenName]
  if (!token) throw Error("Available tokens are: gton, sgton");
  await addToken(token);
  print([textLine({ words: [textWord({ characters: messages.addToken })] })]);
}, "Error adding token to Meramask")

const FaucetWorker = createWorker(async ({ print }, token) => {
  const tokenAddress = tokens[token]

  if (!tokenAddress) {
    print([textLine({ words: [textWord({ characters: "Pass token name as second argument" })] })]);
    return;
  }
  await faucet(tokenAddress);
  print([textLine({ words: [textWord({ characters: messages.faucetDeposit })] })]);
})

const commonOperators = {
  faucet: FaucetWorker,
  add: AddTokenWorker,
  balance: BalanceWorker,
  switch: SwitchWorker,
  join: ConnectMetamaskWorker
}

export function printLink(print, text, link) {
  print([textLine({ words: [anchorWord({ className: "link-padding", characters: text, onClick: () => { window.open(link, '_blank'); } })] })]);
}

export function parser(operands) {
  return async (queue, state, command) => {
    const { print } = queue.handlers;
    const Command = command.split(' ')[0].trim().toLowerCase();
    // split was replaced by substring because of the buy command, which assumes two parameters
    const Arg = command.substring(command.indexOf(' ')).replace(' ', '');

    try {
      // Handle incorrect command
      if (!(Command in operands)) throw Error(notFoundStrings[Math.floor(Math.random() * notFoundStrings.length)]);
      operands[Command](queue.handlers, Arg.toLowerCase(), state);
    }
    catch (err) {
      print([textLine({ words: [textWord({ characters: err.message })] })]);
    }
  }
}
export default commonOperators;