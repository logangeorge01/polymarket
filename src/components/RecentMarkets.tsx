import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import { getRecentMarkets, RecentMarket, clearRecentMarkets } from "../services/recentMarketsUtil";

const RecentMarkets: React.FC = () => {
    const [recentMarkets, setRecentMarkets] = useState<RecentMarket[]>([]);
    // const navigate = useNavigate();

    useEffect(() => {
        setRecentMarkets(getRecentMarkets());
    }, []);

    const handleClearRecents = () => {
        clearRecentMarkets();
        setRecentMarkets([]);
    };

    return (
        <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>Recently Viewed Markets</h3>
                {recentMarkets.length > 0 && (
                    <button onClick={handleClearRecents}>Clear</button>
                )}
            </div>
            {recentMarkets.length > 0 ? (
                <div>
                    {recentMarkets.map((market) => (
                        <div key={market.marketId}>
                            <a
                                href={`/market/${market.marketId}`}
                                style={{
                                    color: "blue",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                    display: "block", // Ensures each link is on a new line
                                }}
                            >
                                {market.name}
                            </a>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No recent markets viewed.</p>
            )}

        </div>
    );
};

export default RecentMarkets;
