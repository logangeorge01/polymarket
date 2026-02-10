import React, { useEffect, useState } from "react";
import { getBalance, getMarketById } from "../services/polyservice";
import "./App.css";
import { useNavigate } from "react-router";
import RecentMarkets from "./RecentMarkets";
import { addRecentMarket } from "../services/recentMarketsUtil";
import { getDailyPnl } from "./DailyPnL";

const HomePage: React.FC = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [dailyPnl, setDailyPnl] = useState<number>(0);

  const [searchString, setSearchString] = useState("");
  const [marketIdString, setMarketIdString] = useState("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Fetch balance on mount
  useEffect(() => {
    const fetchBalanceData = async () => {
      try {
        const result = await getBalance();
        setBalance(result);

        // Also fetch today's daily PnL
        const pnl = await getDailyPnl();
        setDailyPnl(pnl);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch balance.");
      }
    };
    fetchBalanceData();
  }, []);

  // Navigate to search results page
  const handleFetchMarket = async () => {
    if (!searchString) {
      setError("Please enter a search string.");
      return;
    }
    setError(null);
    navigate(`/search?q=${encodeURIComponent(searchString)}`);
  };

  // Fetch market by ID
  const handleFetchMarketById = async () => {
    if (!marketIdString) {
      setError("Please enter a market id.");
      return;
    }
    try {
      const result = await getMarketById(marketIdString);
      if (!result.condition_id) {
        setError("Invalid market id.");
        return;
      }
      addRecentMarket(result.question, result.condition_id);
      navigate(`/market/${marketIdString}`);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch market by id.");
    }
  };


  let pnlClass = "pnl-zero";
  if (dailyPnl > 0) pnlClass = "pnl-positive";
  if (dailyPnl < 0) pnlClass = "pnl-negative";
  return (
    <div>
      <h2>Simple Market Display</h2>

      {/* Balance Section */}
      <div className="card">
        <h3>Balance</h3>
        <p>
          Your Balance:{" "}
          <strong>
            {balance !== null ? `$${balance}` : "Loading..."}
          </strong>
          {" | "}
          Daily Earnings:{" "}
          <strong className={pnlClass}>
            {dailyPnl > 0
              ? `+$${dailyPnl.toFixed(2)}`
              : dailyPnl < 0
              ? `-$${Math.abs(dailyPnl).toFixed(2)}`
              : "$0.00"}
          </strong>
        </p>
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

      {/* Known Market ID UI */}
      <div className="card">
        <h3>Find a Market by ID</h3>
        <input
          type="text"
          placeholder="Enter known market id"
          value={marketIdString}
          onChange={(e) => setMarketIdString(e.target.value)}
        />
        <button onClick={handleFetchMarketById}>Fetch Market</button>
      </div>

      {/* Recent Markets UI */}
      <RecentMarkets />
    </div>
  );
};

export default HomePage