"use client";

import React, { useState } from "react";
import OrderForm from "./components/OrderForm";
import Orderbook from "./components/Orderbook";
import TradeHistory from "./components/TradeHistory";
import MarketSummary from "./components/MarketSummary";
import Header from "./components/Header";
import MobileNav from "./components/MobileNav";

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("order");

  const handleOrderPlaced = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const renderMobileContent = () => {
    switch (activeTab) {
      case "order":
        return <OrderForm onOrderPlaced={handleOrderPlaced} />;
      case "book":
        return <Orderbook refreshTrigger={refreshTrigger} />;
      case "trades":
        return <TradeHistory refreshTrigger={refreshTrigger} />;
      default:
        return <OrderForm onOrderPlaced={handleOrderPlaced} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6 pb-20 xl:pb-6">
        <div className="mb-6">
          <MarketSummary refreshTrigger={refreshTrigger} />
        </div>

        <div className="hidden xl:grid xl:grid-cols-4 gap-6">
          <div className="xl:col-span-1">
            <OrderForm onOrderPlaced={handleOrderPlaced} />
          </div>

          <div className="xl:col-span-2">
            <Orderbook refreshTrigger={refreshTrigger} />
          </div>

          <div className="xl:col-span-1">
            <TradeHistory refreshTrigger={refreshTrigger} />
          </div>
        </div>

        <div className="xl:hidden">
          <div className="animate-fade-in">{renderMobileContent()}</div>
        </div>
      </main>

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
