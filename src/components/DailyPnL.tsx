// dailyPnlUtil.ts
import { getBalance } from "../services/polyservice";

/**
 * Fetch or reset today's baseline in localStorage, compute daily PnL
 */
export async function getDailyPnl(): Promise<number> {
    const todayStr = new Date().toISOString().slice(0, 10); // "2025-01-20"
  
    const storedDay = localStorage.getItem("pnlDay");
    const storedBase = localStorage.getItem("pnlBase");
  
    // If no stored day, or it's a different day, reset baseline
    if (!storedDay || !storedBase || storedDay !== todayStr) {
      const curBal = await getBalance(); // from polyservice
      localStorage.setItem("pnlDay", todayStr);
      localStorage.setItem("pnlBase", String(curBal));
      return 0; // fresh new day => PnL is 0 so far
    }
  
    // Otherwise, same day => compute difference
    const baseline = parseFloat(storedBase);
    const curBal = await getBalance();
    return curBal - baseline;
  }
  
