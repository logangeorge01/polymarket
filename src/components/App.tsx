import React/*, { useEffect, useState }*/ from "react";
// import { getBalance, getMarket, getMarketById } from "../services/polyservice";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MarketDataPage from "./MarketDataPage";
import HomePage from "./HomePage";
import "./App.css";

const App: React.FC = () => {
    return (
      <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/market/:marketId" element={<MarketDataPage />} />
          </Routes>
      </Router>
    );
  };

export default App;
