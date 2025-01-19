import React, { useEffect, useState } from "react";
import { getMarketById } from "../services/polyservice";
import { Link, useParams } from "react-router-dom";

const MarketDataPage: React.FC = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const [marketData, setMarketData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

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

        {/* Market Data Display */}
        {marketData && (
          <div className="card">
            <h2>{marketData.question}</h2>
            <p>
              <strong>Market ID:</strong> {marketData.condition_id}
            </p>
            <p>
              <strong>Description:</strong> {marketData.description}
            </p>
            <p>
              <strong>Start Time:</strong> {formatDate(marketData.game_start_time)}
            </p>
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
                  <p>
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
                  </p>
  
                  {/* Placeholder Buy / Sell Boxes */}
                  <div className="order-actions">
                    {/* BUY section */}
                    <div className="order-box buy-box">
                      <h5>Buy</h5>
                      <button
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
                      </button>
                      <button
                        className="btn-buy"
                        onClick={() =>
                          alert(`(Placeholder) FOK (Market) Buy for tokenID: ${token.token_id}`)
                        }
                      >
                        FOK
                      </button>
                    </div>
  
                    {/* SELL section */}
                    <div className="order-box sell-box">
                      <h5>Sell</h5>
                      <button
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
                      </button>
                      <button
                        className="btn-sell"
                        onClick={() =>
                          alert(`(Placeholder) FOK (Market) Sell for tokenID: ${token.token_id}`)
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
