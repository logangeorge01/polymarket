import React, { useEffect, useState } from "react";
import { getBalance, getMarket, getMarketById } from "../services/polyservice";
import "./App.css";
import { useNavigate } from "react-router";

const HomePage: React.FC = () => {
    const [balance, setBalance] = useState<number | null>(null);
    // const [marketData, setMarketData] = useState<any | null>(null);
    const [searchString, setSearchString] = useState("");
    const [marketIdString, setMarketIdString] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [searching, setSearching] = useState<boolean>(false);

    const navigate = useNavigate();
  
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
      setSearching(true);
      try {
        if (!searchString) {
          setError("Please enter a search string.");
          return;
        }
        setError(null);
        const result = await getMarket(searchString);
        navigate(`/market/${result.condition_id}`);
        // TODO ROUTE TO MARKET PAGE
        // setMarketData(result);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch market data.");
      }
    };
  
    // Fetch market data from id on button click
    const handleFetchMarketById = async () => {
        if (!marketIdString) {
            setError("Please enter a market id.");
            return;
        }
        const result = await getMarketById(marketIdString);

        if (!result.condition_id) {
            setError("Invalid market id.");
            return;
        }

        navigate(`/market/${marketIdString}`);

        //   setError(null);

        // TODO ROUTE TO MARKET PAGE
        // const result = await getMarketById(marketIdString);

    //   try {
    //     if (!marketIdString) {
    //       setError("Please enter a market id.");
    //       return;
    //     }
    //     setError(null);
    //     const result = await getMarketById(marketIdString);
    //     setMarketData(result);
    //   } catch (err) {
    //     console.error(err);
    //     setError("Failed to fetch market data.");
    //   }
    };

    if (searching) {
        return <div>Searching for '{searchString}' market...</div>
    }
  
    return (
      <div>
        <h2>Simple Market Display</h2>
  
        {/* Balance Section */}
        <div className="card">
          <h3>Balance</h3>
          <p>
              Your Balance: <strong>{balance ? `$${balance}` : 'Loading'}</strong>
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
      </div>
    );
  };

export default HomePage;
