import { isTestnet } from '../config/config';

enum Commands 
{
    CD = "cd",
    HELP = "help",
    JOIN = "join",
    STAKE = "stake",
    UNSTAKE = "unstake",
    SWITCH = "switch",
    BALANCE = "balance",
    ADD_TOKEN = "add",
    FAUCET = "faucet",
    HARVEST = "harvest"
}

enum OptionalActions {
  YES = 'yes',
  NO = 'no'
}

enum Prompt {
  PROMPT = '/gton/testing $ ',
}

enum Prefix {
  PREFIX = '>',
}

enum Links {
  ABOUT = 'https://medium.com/gearbox-protocol/credit-account-mining-guide-fueling-up-for-the-launch-abc17fbddbad',
  WALLETS_TO_PARTICIPATE = 'https://github.com/Gearbox-protocol/launch-snapshot#credit-account-mining-snapshot',
  CLAIM = 'https://medium.com/gearbox-protocol/credit-account-mining-guide-fueling-up-for-the-launch-abc17fbddbad',
}


const messages = {
  banner: `

       ██████╗ ████████╗ ██████╗ ███╗   ██╗     ██████╗ █████╗ ██████╗ ██╗████████╗ █████╗ ██╗     
      ██╔════╝ ╚══██╔══╝██╔═══██╗████╗  ██║    ██╔════╝██╔══██╗██╔══██╗██║╚══██╔══╝██╔══██╗██║     
      ██║  ███╗   ██║   ██║   ██║██╔██╗ ██║    ██║     ███████║██████╔╝██║   ██║   ███████║██║     
      ██║   ██║   ██║   ██║   ██║██║╚██╗██║    ██║     ██╔══██║██╔═══╝ ██║   ██║   ██╔══██║██║     
      ╚██████╔╝   ██║   ╚██████╔╝██║ ╚████║    ╚██████╗██║  ██║██║     ██║   ██║   ██║  ██║███████╗
       ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═══╝     ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝
                                                       
                      ⚜️ Welcome to GTON CAPITAL (𝔾ℂ) CLI UI 📺!

       We were inspired by the way how GearBox CA minting ceremony (the biggest bag of @ivangbi 
         besides $USDC and $LOBS NFT) was organized and decided to fork the ui application, 
         so that our users can work with smart contracts directly, both on the testnet 
           and mainnet.

                       Type ${Prefix.PREFIX}${Commands.HELP} to see the list of available commands.

       #WA𝔾MI ⚜️
  `,
  faucet: 'Get free testnet $FTMs',
  gc: 'Find more info about GC',

  helpText: `
  Available commands:
  ${Prefix.PREFIX}${Commands.HELP} - this output
  ${Prefix.PREFIX}${Commands.JOIN} - connect wallet to the terminal
  ${Prefix.PREFIX}${Commands.STAKE} <amount> - stake funds
  ${Prefix.PREFIX}${Commands.UNSTAKE} <amount> - unstake funds
  ${Prefix.PREFIX}${Commands.HARVEST} <amount> - harvest reward
  ${Prefix.PREFIX}${Commands.SWITCH} - switch chain to test fantom
  ${Prefix.PREFIX}${Commands.BALANCE} gton | sgton | harvest - get actual erc20 token balance
  ${Prefix.PREFIX}${Commands.ADD_TOKEN} gton | sgton - add tokens to metamask
  ${ isTestnet ? `${Prefix.PREFIX}${Commands.FAUCET} - receive gton airdrop` : ''}

  ${Prefix.PREFIX}${Commands.CD}  ogswap | candyshop | staking- change project

  `,
  links: `
  Empty command rn
  `,
  LINKS: 
  `
  TODO
  `,
  viewTxn: 'View transaction',
  metamaskConnected: `
  Metamask is connected
  `,
  permissionCheckingStarted: `
  ...the machine is checking if you are in the snapshot...
  Learn more about which wallets are allowed to participate: ${Links.WALLETS_TO_PARTICIPATE}
  `,
  amountOfMineAccounts: `
  You have 1 credit accounts to mine
  `,
  almostDone: `
  We're almost done. Now wait till tx is confirmed.
  `,
  approve: `
      You have succesfully approved your funds!
      Transaction approve: 
    `
  ,
  stake(type: string, amount: string) {
    return `
    You have succesfully ${type} your funds!
    Amount: ${amount},
    Transaction stake:`;
   },
  harvested(amount: string) {
    return `
    You have succesfully harvested your reward!
    Amount: ${amount},
    Transaction:`;
   },
  accountsMined: (n: number) => `
  Accounts mined: ${n}
  `,
  balance: (n: string) => `
      Token balance: ${n}
    `
  ,
  chainSwitch: `
  Successfully switched to Fantom ${isTestnet? 'Testnet' : ''}.
  `,
  faucetDeposit: `
  Succesfully airdropped GTON.
  `,
  addToken: `
  Successfully added token to the MetaMask.
  `,
};

export { Prefix, Links, Prompt, Commands, OptionalActions };
export default messages;