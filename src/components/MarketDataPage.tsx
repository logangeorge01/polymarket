import React, { useEffect, useState } from "react";
import { getBalance, getMarketById, placeOrder } from "../services/polyservice";
import { Link, useParams } from "react-router-dom";
import { Side } from "@polymarket/clob-client";

const MarketDataPage: React.FC = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const { marketId } = useParams<{ marketId: string }>();
  const [marketData, setMarketData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unitSize, setUnitSize] = useState('1');

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

  // Fetch balance on mount
  useEffect(() => {
    const fetchBalanceData = async () => {
      try {
        const result = await getBalance();
        setBalance(result);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch balance.");
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

  return (
    <div>
        <Link to='/'><button>Home</button></Link>

        {/* Balance Section */}
        
        <div>Your Balance: <strong>{balance ? `$${balance}` : 'Loading'}</strong></div>

        {/* Market Data Display */}
        {marketData && (
          <div className="card">
            <img src={marketData.icon} className="icon" />
            <h2>{marketData.question}</h2>
            {/* <p>
              <strong>Market ID:</strong> {marketData.condition_id}
            </p> */}
            <p>
              <strong>Description:</strong> {marketData.description}
            </p>
            <p>
              <strong>Start Time:</strong> {formatDate(marketData.game_start_time)}
            </p>

            <p><strong>Unit Size</strong></p>
            <input
              className="unitsize"
              type="text"
              placeholder="Unit Size"
              value={unitSize}
              onChange={(e) => setUnitSize(e.target.value)}
            />


            {/* <p>
              <strong>End Date:</strong> {formatDate(marketData.end_date_iso)}
            </p>
            <p>
              <strong>Active:</strong> {marketData.active ? "Yes" : "No"}
            </p>
            <p>
              <strong>Closed:</strong> {marketData.closed ? "Yes" : "No"}
            </p>
            <p>
              <strong>Market Slug:</strong> {marketData.market_slug || "N/A"}
            </p> */}
  
            {/* Tokens */}
            {/* <h4>Tokens</h4> */}
            {marketData.tokens && marketData.tokens.length > 0 ? (
              marketData.tokens.map((token: any, index: number) => (
                <div className="token-item" key={index}>
                  {/* <p>
                    <strong>Outcome:</strong> {token.outcome}
                  </p>
                  <p>
                    <strong>Token ID:</strong> {token.token_id}
                  </p>
                  <p>
                    <strong>Price:</strong> {token.price}
                  </p>
                  <p>
                    <strong>Winner:</strong> {token.winner ? "Yes" : "No"}
                  </p> */}
  
                  {/* Placeholder Buy / Sell Boxes */}
                  <div className="order-actions">
                    {/* BUY section */}
                    <div className="order-box buy-box">
                      <h3>Buy {token.outcome} @ ${token.price}</h3>
                      {/* <button
                        className="btn-buy"
                        onClick={() =>
                          alert(`(Placeholder) GTC Buy for tokenID: ${token.token_id}`)
                        }
                      >
                        GTC
                      </button>
                      <button
                        className="btn-buy"
                        onClick={() =>
                          alert(`(Placeholder) GTD Buy for tokenID: ${token.token_id}`)
                        }
                      >
                        GTD
                      </button> */}


                      {/* FOK BUY */}
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
                    <h3>Sell {token.outcome} @ ${token.price}</h3>
                      {/* <button
                        className="btn-sell"
                        onClick={() =>
                          alert(`(Placeholder) GTC Sell for tokenID: ${token.token_id}`)
                        }
                      >
                        GTC
                      </button>
                      <button
                        className="btn-sell"
                        onClick={() =>
                          alert(`(Placeholder) GTD Sell for tokenID: ${token.token_id}`)
                        }
                      >
                        GTD
                      </button> */}


                      {/* FOK SELL */}
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
        )}
    </div>
  );
};

export default MarketDataPage;
