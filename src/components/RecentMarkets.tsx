import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import { getRecentMarkets } from "../services/recentMarketsUtil";

const RecentMarkets: React.FC = () => {
    const [recentMarkets, setRecentMarkets] = useState<Record<string, string>>({});
    // const navigate = useNavigate();

    useEffect(() => {
        setRecentMarkets(getRecentMarkets());
    }, []);

    return (
        <div className="card">
            <h3>Recently Viewed Markets</h3>
            {Object.keys(recentMarkets).length > 0 ? (
                <div>
                    {Object.entries(recentMarkets).map(([name, marketId]) => (
                        <div key={marketId}>
                            <a
                                href={`/market/${marketId}`}
                                style={{
                                    color: "blue",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                    display: "block", // Ensures each link is on a new line
                                }}
                            >
                                {name}
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
