import {
    textLine,
    textWord,
} from 'crt-terminal';
import BigNumber from 'bignumber.js';
import messages from '../../Messages/Messages';
import notFoundStrings from '../../Errors/notfound-strings'
import commonOperators, { printLink, createWorker } from '../common';
import userBondIds, { getBondingByBondId, bondInfo } from '../WEB3/bonding/ids';
import getAmountOut, { getDiscount } from '../WEB3/bonding/amountOut';
import { fromWei, toWei } from '../WEB3/API/balance';
import { BondTypes, BondTokens, bondingContracts, tokenAddresses, ftmscanUrl, storageAddress } from '../../config/config';
import { allowance, approve } from '../WEB3/approve';
import { mint, mintFTM } from '../WEB3/bonding/mint';
import { claim } from '../WEB3/bonding/claim';

const parseArguments = (args: string) => {
    const argArr = args.split(" ");
    const token = argArr[0]
    const type = argArr[1]
    const amount = argArr[2]
    return [token, type, amount]
}

function timeConverter(UNIX_timestamp) {
    const a = new Date(UNIX_timestamp * 1000);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = a.getFullYear();
    const month = months[a.getMonth()];
    const date = a.getDate();
    const hour = a.getHours();
    const min = a.getMinutes();
    const sec = a.getSeconds();
    const time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
}

function validateArgs([token, type]: string[]) {
    if (!(Object.keys(BondTokens).includes(token)) || !(Object.keys(BondTypes).includes(type))) {
        throw new Error("Invalid arguments are passed")
    }
}
// Func Router 

const helpWorker = ({ print }) => {
    print([textLine({ words: [textWord({ characters: messages.bondingHelpText })] })]);
}

const typesWorker = ({ print }) => {
    print([textLine({ words: [textWord({ characters: "Available bond types: " })] })]);
    for (const key of Object.keys(BondTypes)) {
        print([textLine({ words: [textWord({ characters: `-  ${key}` })] })]);
    }

}

const tokensWorker = ({ print }) => {
    print([textLine({ words: [textWord({ characters: "Available tokens: " })] })]);
    for (const key of Object.keys(BondTokens)) {
        print([textLine({ words: [textWord({ characters: `-  ${key}` })] })]);
    }

}

const bondsWorker = createWorker(async ({ print }) => {
    const ids = await userBondIds();
    if (ids.length === 0) {
        throw new Error("You don't have active bonds.")
    }
    const amount = ids.length === 1 ? "id is" : "ids are";
    print([textLine({ words: [textWord({ characters: `Your bond ${amount}: ${ids.join(", ")}` })] })]);
})

const mintWorker = createWorker(async ({ print }, args) => {
    const [token, type, amount] = parseArguments(args)
    validateArgs([token, type]);
    const weiAmount = toWei(new BigNumber(amount))
    const contractAddress = bondingContracts[token][type]
    const tokenAddress = tokenAddresses[token];
    let tx;
    if (token === BondTokens.ftm) {
        tx = await mintFTM(contractAddress, weiAmount);
    } else {
        // TODO add check for allowance
        const all = await allowance(tokenAddress, contractAddress);
        if (all.lt(weiAmount)) {
            await approve(tokenAddress, contractAddress, weiAmount)
        }
        tx = await mint(contractAddress, weiAmount);
    }
    const id = tx.events.Mint.returnValues.tokenId;
    const txHash = tx.transactionHash
    print([textLine({ words: [textWord({ characters: `You have successfully issued bond with id ${id}` })] })]);
    printLink(print, messages.viewTxn, ftmscanUrl + txHash)
})

const claimWorker = createWorker(async ({ print }, bondId) => {
    const contractAddress = await getBondingByBondId(bondId);
    const info = await bondInfo(contractAddress, bondId);
    const currentTs = Math.floor(Date.now() / 1000);
    if (currentTs < info.releaseTimestamp) {
        throw new Error("Bond is not allowed to claim yet")
    }
    await approve(storageAddress, contractAddress, new BigNumber(bondId))
    const tx = await claim(contractAddress, bondId);
    const txHash = tx.transactionHash
    print([textLine({ words: [textWord({ characters: `You have successfully claimed bond with id ${bondId}` })] })]);
    printLink(print, messages.viewTxn, ftmscanUrl + txHash)

})

const infoWorker = createWorker(async ({ print }, bondId) => {
        const contractAddress = await getBondingByBondId(bondId);
        const info = await bondInfo(contractAddress, bondId);
        print([textLine({
            words: [textWord({
                characters: `
        Status: ${info.isActive ? "Active" : "Claimed"}
        Issued: ${timeConverter(info.issueTimestamp)}
        Claim date: ${timeConverter(info.releaseTimestamp)}
        Release amount: ${fromWei(new BigNumber(info.releaseAmount)).toFixed(4)}
        ` })]
        })]);
})

const previewWorker = createWorker(async ({ print }, args) => {
        const [token, type, amount] = parseArguments(args)
        validateArgs([token, type]);
        const contractAddress = bondingContracts[token][type]
        const weiAmount = toWei(new BigNumber(amount));
        const [amountOut, discount] = await getAmountOut(contractAddress, weiAmount);
        const outEther = fromWei(amountOut);
        const discountEther = fromWei(discount)
        const percent = await getDiscount(contractAddress);

        print([textLine({ words: [textWord({ characters: `You will receive ${outEther.toFixed(18)} of sGTON` })] })]);
        print([textLine({ words: [textWord({ characters: `Discount for this offer will be ${discountEther.toFixed(18)} - ${percent}%` })] })]);
})


const BondingMap =
{
    preview: previewWorker,
    help: helpWorker,
    tokens: tokensWorker,
    bonds: bondsWorker,
    types: typesWorker,
    mint: mintWorker,
    claim: claimWorker,
    info: infoWorker,
    ...commonOperators
}

const ArgsFunctions =
    [
        "mint",
        "preview",
        "claim",
        "info",
    ]

async function Parse(eventQueue, command) {
    const { print } = eventQueue.handlers;
    const Command = command.split(' ')[0].trim().toLowerCase();
    // split was replaced by substring because of the buy command, which assumes two parameters
    const Arg = command.substring(command.indexOf(' ')).replace(' ', '');

    try {
        // Handle incorrect command
        if (!(Command in BondingMap)) throw Error(notFoundStrings[Math.floor(Math.random() * notFoundStrings.length)]);
        if (ArgsFunctions.includes(Command) && Arg === Command) throw Error("You should provide args for calling this function. e.g stake 1");
        BondingMap[Command](eventQueue.handlers, Arg.toLowerCase());
    }
    catch (err) {
        print([textLine({ words: [textWord({ characters: err.message })] })]);
    }
}

export default Parse;
