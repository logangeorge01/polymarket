import { ApiKeyCreds, AssetType, Chain, ClobClient, PaginationPayload } from "@polymarket/clob-client";
import { Wallet } from "@ethersproject/wallet";
import { SignatureType } from "@polymarket/order-utils";

export interface Balance {
    address: string;
    chainId: number;
    collateral: any;
    // yes: any;
    // no: any;
}

interface PolyConfig {
    host: string,
    chainId: Chain,
    wallet: Wallet,
    creds: ApiKeyCreds,
    signatureType: SignatureType,
    funderAddress: string
}

class ClobClientInstance {
    static instance: ClobClient | null = null;

    static c: PolyConfig = {
        host: import.meta.env.VITE_CLOB_API_URL,
        chainId: parseInt(import.meta.env.VITE_CHAIN_ID || `${Chain.AMOY}`) as Chain,
        wallet: new Wallet(import.meta.env.VITE_PK),
        creds: {
            key: import.meta.env.VITE_CLOB_API_KEY,
            secret: import.meta.env.VITE_CLOB_SECRET,
            passphrase: import.meta.env.VITE_CLOB_PASS_PHRASE
        },
        signatureType: SignatureType.POLY_GNOSIS_SAFE,
        funderAddress: import.meta.env.FUNDER_ADDRESS
    }

    static getInstance() {
        if (!ClobClientInstance.instance) {
            ClobClientInstance.instance = new ClobClient(
                this.c.host,
                this.c.chainId,
                this.c.wallet,
                this.c.creds,
                this.c.signatureType,
                this.c.funderAddress
            );
        }
        return ClobClientInstance.instance;
    }
}

export const getBalance = async (): Promise<number> => {
    const clobClient = ClobClientInstance.getInstance();

    const collateral = await clobClient.getBalanceAllowance({ asset_type: AssetType.COLLATERAL });
    // const yes = await clobClient.getBalanceAllowance({
    //     asset_type: AssetType.CONDITIONAL,
    //     token_id: "71321045679252212594626385532706912750332728571942532289631379312455583992563",
    // });
    // const no = await clobClient.getBalanceAllowance({
    //     asset_type: AssetType.CONDITIONAL,
    //     token_id: "52114319501245915516055106046884209969926127482827954674443846427813813222426",
    // });

    // console.log(collateral.balance)
    return parseFloat((parseFloat(collateral.balance) / 1000000).toFixed(2));

    // return {
    //     address: await wallet.getAddress(),
    //     chainId,
    //     collateral,
    //     // yes,
    //     // no,
    // };
};


export const getMarket = async (searchString: string): Promise<any> => {
    const clobClient = ClobClientInstance.getInstance();

    const asdf: PaginationPayload = await clobClient.getMarkets();
    const data = asdf.data;

    // const asdf1 = asdf.data.map((item: any) => item.question);

    const asdf1 = data.find((item) => item.question.toLowerCase() === searchString.toLowerCase());

    console.log(asdf1);

    return searchString;
}

