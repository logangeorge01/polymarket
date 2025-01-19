// Utility functions to manage recent markets in localStorage

const LOCAL_STORAGE_KEY = "recentMarkets";

export const getRecentMarkets = (): Record<string, string> => {
  const storedMarkets = localStorage.getItem(LOCAL_STORAGE_KEY);
  return storedMarkets ? JSON.parse(storedMarkets) : {};
};

export const addRecentMarket = (name: string, marketId: string) => {
  const recentMarkets = getRecentMarkets();
  recentMarkets[name] = marketId;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recentMarkets));
};

export const removeRecentMarket = (marketId: string) => {
  const recentMarkets = getRecentMarkets();
  const updatedMarkets = Object.fromEntries(
    Object.entries(recentMarkets).filter(([_, id]) => id !== marketId)
  );
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedMarkets));
};
