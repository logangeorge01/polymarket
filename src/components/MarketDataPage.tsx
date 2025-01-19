import React, { useEffect, useState } from "react";
import { getBalance, getMarketById, placeOrder } from "../services/polyservice";
import { Link, useParams } from "react-router-dom";
import { Side } from "@polymarket/clob-client";
import { getDailyPnl } from "./DailyPnL";

const MarketDataPage: React.FC = () => {
  const { marketId } = useParams<{ marketId: string }>();

  const [balance, setBalance] = useState<number | null>(null);
  const [dailyPnl, setDailyPnl] = useState<number>(0);

  const [marketData, setMarketData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unitSize, setUnitSize] = useState("1");

  // Fetch market data
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

  // Fetch balance + daily PnL
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
        <strong>{balance !== null ? `$${balance}` : "Loading"}</strong>{" "}
        | Daily Earnings:{" "}
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
          <strong>Unit Size</strong>
        </p>
        <input
          className="unitsize"
          type="text"
          placeholder="Unit Size"
          value={unitSize}
          onChange={(e) => setUnitSize(e.target.value)}
        />

        {marketData.tokens && marketData.tokens.length > 0 ? (
          marketData.tokens.map((token: any, index: number) => (
            <div className="token-item" key={index}>
              <div className="order-actions">
                {/* BUY section */}
                <div className="order-box buy-box">
                  <h3>
                    Buy {token.outcome} @ ${token.price}
                  </h3>
                  <button
                    className="btn-buy"
                    onClick={() =>
                      placeOrder(token.token_id, Side.BUY, parseFloat(unitSize))
                    }
                  >
                    FOK
                  </button>
                </div>

                {/* SELL section */}
                <div className="order-box sell-box">
                  <h3>
                    Sell {token.outcome} @ ${token.price}
                  </h3>
                  <button
                    className="btn-sell"
                    onClick={() =>
                      placeOrder(token.token_id, Side.SELL, parseFloat(unitSize))
                    }
                  >
                    FOK
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No tokens found for this market.</p>
        )}
      </div>
    </div>
  );
};

export default MarketDataPage;