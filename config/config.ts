const network = '250';
const isDev = process.env.NODE_ENV === 'development';
const isLive = 'true';
const isTestnet = false;

const spiritswaprouteraddress = '0x16327E3FbDaCA3bcF7E38F5Af2599D2DDc33aE52';
const stakingAddress = '0xB0dAAb4eb0C23aFFaA5c9943d6f361b51479ac48';
const faucetAddress = '';
const tokenAddress = '0xc1be9a4d5d45beeacae296a7bd5fadbfc14602c4';
const fantomTestnet = {
  chainId: '250',
  chainIdHex: '0xFA',
  chainName: 'Fantom Mainnet',
  rpcUrls: ['https://rpc.fantom.network'],
  nativeCurrency: { name: 'FTM', decimals: 18, symbol: 'FTM' },
  blockExplorerUrls: ['https://ftmscan.com/'],
};
const ftmscanUrl = "https://ftmscan.com/tx/"
const faucetLink = "https://faucet.fantom.network/"
const gcLink = "https://gton.capital/"

export {
  network,
  gcLink,
  faucetLink,
  ftmscanUrl,
  isTestnet,
  spiritswaprouteraddress,
  fantomTestnet,
  stakingAddress,
  faucetAddress,
  tokenAddress,
  isDev,
  isLive,
};
