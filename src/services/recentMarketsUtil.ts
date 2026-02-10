// Utility functions to manage recent markets in localStorage
// Markets are stored as a stack (most recent first) with max 10 items

const LOCAL_STORAGE_KEY = "recentMarkets";
const MAX_RECENT_MARKETS = 10;

export interface RecentMarket {
  name: string;
  marketId: string;
}

export const getRecentMarkets = (): RecentMarket[] => {
  const storedMarkets = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!storedMarkets) return [];
  
  const parsed = JSON.parse(storedMarkets);
  
  // Migration: handle old object format and convert to array
  if (!Array.isArray(parsed)) {
    // Old format was an object { name: marketId }
    const migratedArray = Object.entries(parsed).map(([name, marketId]) => ({
      name,
      marketId: marketId as string
    }));
    // Save in new format
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(migratedArray));
    return migratedArray;
  }
  
  // Deduplicate by marketId (keep first occurrence)
  const seen = new Set<string>();
  const deduped = parsed.filter((market: RecentMarket) => {
    if (seen.has(market.marketId)) {
      return false;
    }
    seen.add(market.marketId);
    return true;
  });
  
  // If we found duplicates, save the cleaned data back
  if (deduped.length !== parsed.length) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(deduped));
  }
  
  return deduped;
};

export const addRecentMarket = (name: string, marketId: string) => {
  let recentMarkets = getRecentMarkets();
  
  // Remove any existing entry with the same marketId to avoid duplicates
  recentMarkets = recentMarkets.filter(market => market.marketId !== marketId);
  
  // Add the new market to the front (top of stack)
  recentMarkets.unshift({ name, marketId });
  
  // Keep only the first 10 items
  if (recentMarkets.length > MAX_RECENT_MARKETS) {
    recentMarkets = recentMarkets.slice(0, MAX_RECENT_MARKETS);
  }
  
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recentMarkets));
};

export const removeRecentMarket = (marketId: string) => {
  const recentMarkets = getRecentMarkets();
  const updatedMarkets = recentMarkets.filter(market => market.marketId !== marketId);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedMarkets));
};

export const clearRecentMarkets = () => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
};
