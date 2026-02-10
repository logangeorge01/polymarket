import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { ClobClient, Side, OrderType } from "@polymarket/clob-client";
import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider } from "@ethersproject/providers";

// Load environment variables from .env file
dotenv.config();

const PORT: number = parseInt(process.env.PORT || "3000", 10);
const CLOB_HOST: string = process.env.CLOB_HOST || "https://clob.polymarket.com";
const PRIVATE_KEY: string | undefined = process.env.PRIVATE_KEY; 
const POLYGON_CHAIN_ID: number = 137;

if (!PRIVATE_KEY) {
  console.error("Error: PRIVATE_KEY is required.");
  process.exit(1);
}

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

const provider: JsonRpcProvider = new JsonRpcProvider("https://polygon-rpc.com");
const wallet: Wallet = new Wallet(PRIVATE_KEY, provider);

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

app.get("/search", async (req, res) => {
  try {
    const query = req.query.q as string;

    if (!query) {
      return res.status(400).send({ error: "Query parameter 'q' is required." });
    }

    // Fetch all results by paginating through the API
    const allEvents: any[] = [];
    let offset = 0;
    const limit = 50; // Max allowed by API
    let hasMore = true;

    while (hasMore) {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
        offset: offset.toString(),
        events_status: "active"
      });

      const url = `https://gamma-api.polymarket.com/public-search?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.events && data.events.length > 0) {
        // Filter out closed events
        const openEvents = data.events.filter((event: any) => !event.closed);
        allEvents.push(...openEvents);
        offset += limit;
        
        // If we got fewer results than the limit, we've reached the end
        if (data.events.length < limit) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    // Sort by startDate ascending (earliest first)
    allEvents.sort((a, b) => {
      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return dateA - dateB;
    });

    res.send({ events: allEvents });
  } catch (error: unknown) {
    console.error("Error searching markets:", error);
    res.status(500).send({ error: "Failed to search markets." });
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
