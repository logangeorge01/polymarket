import { ApiKeyCreds, AssetType, Chain, ClobClient, OrderType, PaginationPayload, UserMarketOrder, Side } from "@polymarket/clob-client";
import { Wallet } from "@ethersproject/wallet";
import { SignatureType, SignedOrder } from "@polymarket/order-utils";

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
        funderAddress: import.meta.env.VITE_FUNDER_ADDRESS
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

function isSameDay(gameStartTime: string) {
    var gst = new Date(gameStartTime);
    var cur = new Date();
    return gst.getFullYear() === cur.getFullYear() &&
           gst.getMonth() === cur.getMonth() &&
           gst.getDate() === cur.getDate();
}

export const getMarket = async (searchString: string): Promise<any> => {
    const clobClient = ClobClientInstance.getInstance();

    var nextCursor: string | undefined = undefined;
    var count = 0;
    while (true) {
        const asdf: PaginationPayload = await clobClient.getMarkets(nextCursor);
        const data = asdf.data;
        nextCursor = asdf.next_cursor;
        // console.log(nextCursor);
        // console.log('count', asdf.count);
        // console.log('limit', asdf.limit);

        const asdf1 = data.find((item) => item.question.toLowerCase().includes(searchString.toLowerCase()) && isSameDay(item.game_start_time));

        if (asdf1) {
            // console.log('found item');
            console.log(asdf1);
            return asdf1;
        }
        if (nextCursor == 'LTE=') {
            return 'error didnt find market';
        };
        // console.log(`didnt find going to next page, count: ${count}`);
        count++;
        // if (count > 10) {
        //     // can remove once lte= confirmed to return, don't want infinite loop
        //     return 'error didnt find market';
        // }
    }
}

export const getMarketById = async (marketId: string): Promise<any> => {
    const clobClient = ClobClientInstance.getInstance();

    const asdf = await clobClient.getMarket(marketId);

    console.log(asdf);
    return asdf;
}

// polymarket js client code has a bug so writing my own
export const getMarketPrice = async (tokenId: string, orderType: Side, amount: number): Promise<number> => {
    const clobClient = ClobClientInstance.getInstance();

    const book = await clobClient.getOrderBook(tokenId);
    const positions = orderType == Side.BUY ? book.asks : book.bids;

    let sum = 0;
    for (let i = positions.length - 1; i >= 0; i--) {
        const p = positions[i];
        sum += parseFloat(p.size) * (orderType == Side.BUY ? parseFloat(p.price) : 1);
        if (sum >= amount) {
            return parseFloat(p.price);
        }
    }
    return -1;
}

export const placeOrder = async (tokenId: string, orderType: Side, amount: number): Promise<any> => {
    const clobClient = ClobClientInstance.getInstance();

    // param amount
    // shares to transact

    // var quantity
    // * BUY orders: $$$ Amount to buy
    // * SELL orders: Shares to sell

    var quantity: number = amount;
    const marketPrice = await getMarketPrice(tokenId, orderType, amount);

    if (orderType == Side.BUY) {
        // console.log(buyPrice);
        quantity = amount * marketPrice;
    }

    // console.log(quantity);

    const userMarketOrder: UserMarketOrder = {
        tokenID: tokenId,
        side: orderType,
        amount: quantity,
        price: marketPrice// currently have to set limit price because createMarketOrder also calls getMarketPrice which has a bug
    }
    // const asdfa = await clobClient.getApiKeys();
    // console.log(asdfa);

    const marketOrder: SignedOrder = await clobClient.createMarketOrder(userMarketOrder);
    // console.log(marketOrder);

    const res = await clobClient.postOrder(marketOrder, OrderType.FOK);
    console.log(res);
}

