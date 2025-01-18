import express from "express";
import bodyParser from "body-parser";
import { ClobClient, Side, OrderType } from "@polymarket/clob-client";
import { ethers } from "ethers";

const PORT: number = parseInt(process.env.PORT || "3000", 10);
const CLOB_HOST: string = process.env.CLOB_HOST || "https://clob.polymarket.com";
const PRIVATE_KEY: string | undefined = process.env.PRIVATE_KEY; 
const POLYGON_CHAIN_ID: number = 137;

if (!PRIVATE_KEY) {
  console.error("Error: PRIVATE_KEY is required.");
  process.exit(1);
}

const app = express();
app.use(bodyParser.json());

const provider: ethers.providers.JsonRpcProvider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
const wallet: ethers.Wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const clobClient: ClobClient = new ClobClient(
  CLOB_HOST,
  POLYGON_CHAIN_ID,
  wallet
);


app.get("/health", (req, res) => {
  res.send({ status: "OK" });
});

app.get("/markets", async (req, res) => {
  try {
    const markets = await clobClient.getMarkets("");
    res.send(markets);
  } catch (error: unknown) {
    console.error("Error fetching markets:", error);
    res.status(500).send({ error: "Failed to fetch markets." });
  }
});

app.post("/order", async (req, res) => {
  const { tokenID, price, side, size, orderType }: {
    tokenID: string;
    price: number;
    side: Side;
    size: number;
    orderType: OrderType;
  } = req.body;

  if (!tokenID || !price || !side || !size || !orderType) {
    return res.status(400).send({ error: "Missing required fields." });
  }

  try {
    const order = await clobClient.createOrder({
      tokenID,
      price,
      side,
      size,
      feeRateBps: 100,
      nonce: Date.now(),
    });

    const response = await clobClient.postOrder(order, orderType);
    res.send(response);
  } catch (error: unknown) {
    console.error("Error placing order:", error);
    res.status(500).send({ error: "Failed to place order." });
  }
});

 app.delete("/order/:id", async (req, res) => {
  const { id }: { id?: string } = req.params;

  if (!id) {
    return res.status(400).send({ error: "Order ID is required." });
  }

  try {
    const response = await clobClient.cancelOrder({ orderID: id });
    res.send(response);
  } catch (error: unknown) {
    console.error("Error canceling order:", error);
    res.status(500).send({ error: "Failed to cancel order." });
  }
});

app.get("/order-book/:tokenID", async (req, res) => {
  const { tokenID }: { tokenID?: string } = req.params;

  if (!tokenID) {
    return res.status(400).send({ error: "Token ID is required." });
  }

  try {
    const orderBook = await clobClient.getOrderBook(tokenID);
    res.send(orderBook);
  } catch (error: unknown) {
    console.error("Error fetching order book:", error);
    res.status(500).send({ error: "Failed to fetch order book." });
  }
});

app.get("/trades", async (req, res) => {
  try {
    const trades = await clobClient.getTrades({ maker_address: wallet.address });
    res.send(trades);
  } catch (error: unknown) {
    console.error("Error fetching trades:", error);
    res.status(500).send({ error: "Failed to fetch trades." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
