import React, { useEffect, useState } from "react";
import { getBalance, getMarket } from "./services/asdf.ts";

const App: React.FC = () => {
    const [balance, setBalance] = useState<number | null>(null);
    const [searchString, setMarketId] = useState<string>("");
    const [marketData, setMarketData] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch balance on component mount
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const result = await getBalance();
                setBalance(result);
            } catch (err) {
                console.error(err);
                setError("An error occurred while fetching the balance.");
            }
        };

        fetchBalance();
    }, []);

    // Fetch market data when the button is clicked
    const fetchMarketData = async () => {
        try {
            if (!searchString) {
                setError("Please enter a valid search string.");
                return;
            }
            const result = await getMarket(searchString);
            setMarketData(result);
            setError(null); // Clear any previous errors
        } catch (err) {
            console.error(err);
            setError("An error occurred while fetching the market data.");
        }
    };

    return (
        <div>
            <h2>Polymarket Interface</h2>

            {/* Display Balance */}
            <h3>Balance</h3>
            {balance !== null ? (
                <div>{`$${balance}`}</div>
            ) : (
                <div>Loading balance...</div>
            )}
            {error && <div style={{ color: "red" }}>{error}</div>}

            {/* Market Section */}
            <h3>Market</h3>
            <input
                type="text"
                placeholder="Search for market"
                value={searchString}
                onChange={(e) => setMarketId(e.target.value)}
            />
            <button onClick={fetchMarketData}>Get Market</button>

            {/* Display Market Data */}
            {marketData && (
                <div>
                    <h4>Market Data:</h4>
                    <pre>{JSON.stringify(marketData, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default App;
