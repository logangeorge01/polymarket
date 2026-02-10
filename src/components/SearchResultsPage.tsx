import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { searchMarkets } from "../services/polyservice";
import { addRecentMarket } from "../services/recentMarketsUtil";

interface Market {
  id: string;
  question: string;
  conditionId: string;
  outcomes: string;
  outcomePrices: string;
  volume: string;
  clobTokenIds: string;
}

interface Event {
  id: string;
  ticker: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  active: boolean;
  closed: boolean;
  volume: number;
  markets: Market[];
}

interface SearchResults {
  events: Event[];
}

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const navigate = useNavigate();

  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setError("No search query provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await searchMarkets(query);
        setResults(data);
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to search markets");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleMarketClick = (market: Market, eventTitle: string) => {
    // Add to recent markets - use just the market question to avoid duplication
    addRecentMarket(market.question, market.conditionId);
    // Navigate to market page
    navigate(`/market/${market.conditionId}`);
  };

  if (loading) {
    return (
      <div>
        <Link to="/">
          <button>Home</button>
        </Link>
        <div style={{ marginTop: "20px" }}>Searching for "{query}"...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Link to="/">
          <button>Home</button>
        </Link>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const hasResults = results?.events && results.events.length > 0;

  return (
    <div>
      <Link to="/">
        <button>Home</button>
      </Link>

      <h2>Search Results for "{query}"</h2>

      {!hasResults ? (
        <div className="card">
          <p>No markets found for your search.</p>
        </div>
      ) : (
        <div>
          <p style={{ marginBottom: "20px" }}>
            Found {results.events.length} event(s)
          </p>

          {results.events.map((event) => (
            <div key={event.id} className="card" style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "start", gap: "15px" }}>
                {event.image && (
                  <img
                    src={event.image}
                    alt={event.title}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <h3>{event.title}</h3>
                  <p style={{ fontSize: "0.9em", color: "#666" }}>
                    {event.description}
                  </p>
                  <p style={{ fontSize: "0.85em", color: "#888" }}>
                    {event.volume !== undefined && event.volume !== null && (
                      <>Volume: ${event.volume.toLocaleString()} |{" "}</>
                    )}
                    Status: {event.closed ? "Closed" : event.active ? "Active" : "Inactive"}
                  </p>

                  {/* Markets within this event */}
                  {event.markets && event.markets.length > 0 && (
                    <div style={{ marginTop: "15px" }}>
                      <strong style={{ fontSize: "0.95em" }}>
                        Markets ({event.markets.length}):
                      </strong>
                      <div style={{ marginTop: "10px" }}>
                        {event.markets.map((market) => {
                          const outcomes = market.outcomes
                            ? JSON.parse(market.outcomes)
                            : [];
                          const prices = market.outcomePrices
                            ? JSON.parse(market.outcomePrices)
                            : [];

                          return (
                            <div
                              key={market.id}
                              onClick={() => handleMarketClick(market, event.title)}
                              style={{
                                padding: "12px",
                                marginBottom: "8px",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "6px",
                                cursor: "pointer",
                                border: "1px solid #e0e0e0",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#e9ecef";
                                e.currentTarget.style.borderColor = "#007bff";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#f8f9fa";
                                e.currentTarget.style.borderColor = "#e0e0e0";
                              }}
                            >
                              <div style={{ fontWeight: "500", marginBottom: "5px" }}>
                                {market.question}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.85em",
                                  color: "#555",
                                  display: "flex",
                                  gap: "15px",
                                  flexWrap: "wrap",
                                }}
                              >
                                {outcomes.map((outcome: string, idx: number) => (
                                  <span key={idx}>
                                    <strong>{outcome}:</strong>{" "}
                                    {prices[idx]
                                      ? `$${parseFloat(prices[idx]).toFixed(2)}`
                                      : "N/A"}
                                  </span>
                                ))}
                              </div>
                              {market.volume && (
                                <div style={{ fontSize: "0.8em", color: "#888", marginTop: "5px" }}>
                                  Volume: ${parseFloat(market.volume).toLocaleString()}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
