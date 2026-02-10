import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Side } from "@polymarket/clob-client";

// Import your services
import {
  getBalance,
  getMarketById,
  placeOrder,
  // Keep your existing getMarketPrice if you need it, but now also:
  getSlippageData,
  getTokenBalance,
  sellWholePosition,
} from "../services/polyservice";

import { getDailyPnl } from "./DailyPnL";

const MarketDataPage: React.FC = () => {
  const { marketId } = useParams<{ marketId: string }>();

  const [balance, setBalance] = useState<number | null>(null);
  const [dailyPnl, setDailyPnl] = useState<number>(0);

  const [marketData, setMarketData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The order size (units) the user types in
  const [unitSize, setUnitSize] = useState("1");

  // We'll store slippage details here:
  // slippageMap[tokenId] = { buy: { bestPrice, finalPrice, ... }, sell: {...} }
  const [slippageMap, setSlippageMap] = useState<{
    [tokenId: string]: {
      buy: {
        bestPrice: number;
        finalPrice: number;
        slippageValue: number;
        slippagePercent: number;
      };
      sell: {
        bestPrice: number;
        finalPrice: number;
        slippageValue: number;
        slippagePercent: number;
      };
    };
  }>({});

  // Store token balances: tokenBalanceMap[tokenId] = balance
  const [tokenBalanceMap, setTokenBalanceMap] = useState<{
    [tokenId: string]: number;
  }>({});

  // Format numbers
  const formatPrice = (value: number, decimals = 3) => {
    if (value === -1) return "N/A";
    return value.toFixed(decimals);
  };

  const formatPercent = (val: number) => {
    return (val * 100).toFixed(2) + "%";
  };

  // 1) Fetch Market Data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        if (!marketId) {
          setError("Market ID is required.");
          return;
        }
        const result = await getMarketById(marketId);
        setMarketData(result);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch market data.");
      }
    };
    fetchMarketData();
  }, [marketId]);

  // 2) Fetch balance + daily PnL
  useEffect(() => {
    const fetchBalanceData = async () => {
      try {
        const result = await getBalance();
        setBalance(result);

        const pnl = await getDailyPnl();
        setDailyPnl(pnl);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch balance or daily Earnings.");
      }
    };
    fetchBalanceData();
  }, []);

  // 3) Fetch slippage data and token balances
  useEffect(() => {
    const fetchSlippage = async () => {
      if (!marketData?.tokens) return;

      const sizeNum = parseFloat(unitSize);
      if (isNaN(sizeNum) || sizeNum <= 0) return;

      try {
        // For each token, get BUY and SELL slippage
        const tasks = marketData.tokens.map(async (token: any) => {
          const buyData = await getSlippageData(token.token_id, Side.BUY, sizeNum);
          const sellData = await getSlippageData(token.token_id, Side.SELL, sizeNum);
          return { tokenId: token.token_id, buyData, sellData };
        });

        const results = await Promise.all(tasks);
        const newMap: any = {};

        results.forEach((r) => {
          newMap[r.tokenId] = {
            buy: r.buyData,
            sell: r.sellData,
          };
        });

        setSlippageMap(newMap);
      } catch (slipErr) {
        console.error("Failed to fetch slippage data:", slipErr);
      }
    };

    // Fetch immediately
    fetchSlippage();

    // Set up interval to fetch every second
    const intervalId = setInterval(() => {
      fetchSlippage();
    }, 5000);

    // Cleanup interval on unmount or when dependencies change
    return () => clearInterval(intervalId);
  }, [marketData, unitSize]);

  // 4) Fetch token balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (!marketData?.tokens) return;

      try {
        const balanceTasks = marketData.tokens.map(async (token: any) => {
          const balance = await getTokenBalance(token.token_id);
          return { tokenId: token.token_id, balance };
        });

        const results = await Promise.all(balanceTasks);
        const newBalanceMap: any = {};

        results.forEach((r) => {
          newBalanceMap[r.tokenId] = r.balance;
        });

        setTokenBalanceMap(newBalanceMap);
      } catch (err) {
        console.error("Failed to fetch token balances:", err);
      }
    };

    // Fetch immediately
    fetchBalances();

    // Set up interval to fetch balances every 5 seconds
    const intervalId = setInterval(() => {
      fetchBalances();
    }, 5000);

    // Cleanup interval on unmount or when dependencies change
    return () => clearInterval(intervalId);
  }, [marketData]);

  // Format date
  const formatDate = (isoString?: string) => {
    if (!isoString) return "N/A";
    const d = new Date(isoString);
    return isNaN(d.getTime()) ? isoString : d.toLocaleString();
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!marketData) {
    return <div>Loading market data...</div>;
  }

  // Decide PnL color
  let pnlClass = "pnl-zero";
  if (dailyPnl > 0) pnlClass = "pnl-positive";
  if (dailyPnl < 0) pnlClass = "pnl-negative";

  return (
    <div>
      <Link to="/">
        <button>Home</button>
      </Link>

      {/* Balance + PnL */}
      <div>
        Your Balance:{" "}
        <strong>{balance !== null ? `$${balance}` : "Loading"}</strong> | Daily
        Earnings:{" "}
        <strong className={pnlClass}>
          {dailyPnl > 0
            ? `+$${dailyPnl.toFixed(2)}`
            : dailyPnl < 0
            ? `-$${Math.abs(dailyPnl).toFixed(2)}`
            : "$0.00"}
        </strong>
      </div>

      {/* Market Data Display */}
      <div className="card">
        <img src={marketData.icon} alt="icon" className="icon" />
        <h2>{marketData.question}</h2>

        <p>
          <strong>Description:</strong> {marketData.description}
        </p>
        <p>
          <strong>Start Time:</strong> {formatDate(marketData.game_start_time)}
        </p>

        <p>
          <strong>Unit Size: </strong> Enter how many units you want to buy/sell.
        </p>
        <input
          className="unitsize"
          type="text"
          placeholder="Unit Size"
          value={unitSize}
          onChange={(e) => setUnitSize(e.target.value)}
        />

        {marketData.tokens && marketData.tokens.length > 0 ? (
          marketData.tokens.map((token: any, index: number) => {
            const slip = slippageMap[token.token_id] || {
              buy: {
                bestPrice: -1,
                finalPrice: -1,
                slippageValue: 0,
                slippagePercent: 0,
              },
              sell: {
                bestPrice: -1,
                finalPrice: -1,
                slippageValue: 0,
                slippagePercent: 0,
              },
            };

            const buyBest = slip.buy.bestPrice;
            const buyFinal = slip.buy.finalPrice;
            const buySlipVal = slip.buy.slippageValue;
            const buySlipPct = slip.buy.slippagePercent;

            const sellBest = slip.sell.bestPrice;
            const sellFinal = slip.sell.finalPrice;
            const sellSlipVal = slip.sell.slippageValue;
            const sellSlipPct = slip.sell.slippagePercent;

            // Calculate totals
            const sizeNum = parseFloat(unitSize) || 0;
            const buyTotalCost = sizeNum * buyFinal; // Total $ to spend
            const buyTotalWin = sizeNum * 1.0; // Each unit worth $1 if wins
            const sellTotalReceive = sizeNum * sellFinal; // Total $ to receive

            // Get current position
            const currentPosition = tokenBalanceMap[token.token_id] || 0;

            return (
              <div className="token-item" key={index}>
                <h3>{token.outcome}</h3>
                <p>
                  <strong>Current Position:</strong> {currentPosition.toFixed(2)} shares
                  {currentPosition > 0 && sellBest !== -1 && (
                    <> (≈ ${(currentPosition * sellBest).toFixed(2)} value)</>
                  )}
                </p>
                <div className="order-actions">
                  {/* BUY section */}
                  <div className="order-box buy-box">
                    {buyBest === -1 ? (
                      <p>No buy data (insufficient liquidity?).</p>
                    ) : (
                      <>
                        <p>Best Ask: ${formatPrice(buyBest)}</p>
                        <p>Slippage Price: ${formatPrice(buyFinal)}</p>
                        <p>
                          Slippage:{" "}
                          {buySlipVal > 0 ? "+" : ""}
                          {formatPrice(buySlipVal, 4)}{" "}
                          ({formatPercent(buySlipPct)})
                        </p>
                      </>
                    )}
                    <button
                      className="btn-buy"
                      onClick={() =>
                        placeOrder(token.token_id, Side.BUY, parseFloat(unitSize))
                      }
                      disabled={buyFinal === -1 || sizeNum <= 0}
                    >
                      {buyFinal === -1 || sizeNum <= 0 
                        ? `Buy @ $${formatPrice(buyBest)}`
                        : `Buy $${buyTotalCost.toFixed(2)} to win $${buyTotalWin.toFixed(2)}`
                      }
                    </button>
                  </div>

                  {/* SELL section */}
                  <div className="order-box sell-box">
                    {sellBest === -1 ? (
                      <p>No sell data (insufficient liquidity?).</p>
                    ) : (
                      <>
                        <p>Best Bid: ${formatPrice(sellBest)}</p>
                        <p>Slippage Price: ${formatPrice(sellFinal)}</p>
                        <p>
                          Slippage:{" "}
                          {sellSlipVal > 0 ? "+" : ""}
                          {formatPrice(sellSlipVal, 4)}{" "}
                          ({formatPercent(sellSlipPct)})
                        </p>
                      </>
                    )}
                    <button
                      className="btn-sell"
                      onClick={() =>
                        placeOrder(token.token_id, Side.SELL, parseFloat(unitSize))
                      }
                      disabled={sellFinal === -1 || sizeNum <= 0}
                    >
                      {sellFinal === -1 || sizeNum <= 0
                        ? `Sell @ $${formatPrice(sellBest)}`
                        : `Sell ${sizeNum} for $${sellTotalReceive.toFixed(2)}`
                      }
                    </button>
                    <button
                      className="btn-sell-all"
                      onClick={async () => {
                        try {
                          await sellWholePosition(token.token_id);
                          // Refresh balances after selling
                          const newBalance = await getTokenBalance(token.token_id);
                          setTokenBalanceMap(prev => ({
                            ...prev,
                            [token.token_id]: newBalance
                          }));
                        } catch (err: any) {
                          alert(err.message || "Failed to sell position");
                          console.error(err);
                        }
                      }}
                      disabled={currentPosition <= 0}
                    >
                      Sell All ({currentPosition.toFixed(2)})
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p>No tokens found for this market.</p>
        )}
      </div>
    </div>
  );
};

export default MarketDataPage;
