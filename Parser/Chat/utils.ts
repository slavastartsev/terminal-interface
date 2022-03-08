import {
    encrypt,
} from 'eth-sig-util';
import {utils} from "ethers";

export const messengerUrl = "http://a5bffd3b4a14c4a5a85a1e5d01d3a5b6-bc51aedea274507b.elb.eu-west-2.amazonaws.com/api/mailbox/"

function stringifiableToHex(value) {
    return utils.hexlify(Buffer.from(JSON.stringify(value)));
}

export const encryptMessage = (message: string, openKey: string): string => {
    const res = stringifiableToHex(
        encrypt(
            openKey,
            { data: message },
            'x25519-xsalsa20-poly1305',
        ),
    );
    return res;
}

export const payloadToString = (data: {to_address: string, payload: string}[]): string => {
    let res = "";
    for(let i = 0; i < data.length; i += 1) {
        const address = data[i];
        res += address.to_address.substring(2) + address.payload
    }
    return res;
}

export const makeRequest = async (route: string, body: Record<string, any>) => {
    const res = await fetch(messengerUrl + route, {
        method: "POST",
        body: JSON.stringify(body)
    })
    const resBody = await res.json()
    return resBody
}

export const getWhitelist = async (): Promise<{ id: number, address: string, open_key: string, name: string }[]> => {
    const res = await makeRequest("whitelist", {});
    return res;
}

