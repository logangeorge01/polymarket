import React, { useEffect, useState } from "react";
import { getBalance, getMarket } from "./services/polyservice";
import "./App.css";

const App: React.FC = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [marketData, setMarketData] = useState<any | null>(null);
  const [searchString, setSearchString] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  // Fetch market data on button click
  const handleFetchMarket = async () => {
    try {
      if (!searchString) {
        setError("Please enter a search string.");
        return;
      }
      setError(null);
      const result = await getMarket(searchString);
      setMarketData(result);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch market data.");
    }
  };

  // Helper to format ISO date strings
  const formatDate = (isoString?: string) => {
    if (!isoString) return "N/A";
    const d = new Date(isoString);
    return isNaN(d.getTime()) ? isoString : d.toLocaleString();
  };

  return (
    <div>
      <h2>Simple Market Display</h2>

      {/* Balance Section */}
      <div className="card">
        <h3>Balance</h3>
        {balance !== null ? (
          <p>
            Your Balance: <strong>${balance}</strong>
          </p>
        ) : (
          <p>Loading balance...</p>
        )}
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Market Search UI */}
      <div className="card">
        <h3>Find a Market</h3>
        <input
          type="text"
          placeholder="Enter market search (e.g. 'Commanders')"
          value={searchString}
          onChange={(e) => setSearchString(e.target.value)}
        />
        <button onClick={handleFetchMarket}>Fetch Market</button>
      </div>

      {/* Market Data Display */}
      {marketData && (
        <div className="card">
          <h3>Market Details</h3>
          <p>
            <strong>Question:</strong> {marketData.question}
          </p>
          <p>
            <strong>Description:</strong> {marketData.description}
          </p>
          <p>
            <strong>Start Time:</strong> {formatDate(marketData.game_start_time)}
          </p>
          <p>
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
          </p>

          {/* Tokens */}
          <h4>Tokens</h4>
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

export default App;
