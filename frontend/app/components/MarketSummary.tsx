"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { formatPrice, safeToFixed } from "../utils/formatters";

interface MarketSummaryProps {
  refreshTrigger: number;
}

interface MarketData {
  lastPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  totalTrades: number;
  openOrders: number;
  highPrice24h: number;
  lowPrice24h: number;
}

export default function MarketSummary({ refreshTrigger }: MarketSummaryProps) {
  const [marketData, setMarketData] = useState<MarketData>({
    lastPrice: 0,
    priceChange24h: 0,
    priceChangePercent24h: 0,
    volume24h: 0,
    totalTrades: 0,
    openOrders: 0,
    highPrice24h: 0,
    lowPrice24h: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchMarketData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/market/summary`);
      setMarketData(response.data);
    } catch (error) {
      console.error("Error fetching market data:", error);
      // Fallback to empty data if API fails
      setMarketData({
        lastPrice: 0,
        priceChange24h: 0,
        priceChangePercent24h: 0,
        volume24h: 0,
        totalTrades: 0,
        openOrders: 0,
        highPrice24h: 0,
        lowPrice24h: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const priceChangeColor = marketData.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600';
  const priceChangeIcon = marketData.priceChange24h >= 0 ? '📈' : '📉';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Price</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(marketData.lastPrice)}
            </p>
            <div className={`flex items-center text-sm ${priceChangeColor}`}>
              <span className="mr-1">{priceChangeIcon}</span>
              <span>
                {marketData.priceChange24h >= 0 ? '+' : ''}
                {formatPrice(marketData.priceChange24h)} 
                ({safeToFixed(marketData.priceChangePercent24h, 2)}%)
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 text-xl">💰</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">24h Volume</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(marketData.volume24h)}
            </p>
            <p className="text-xs text-gray-500">
              Total trading value
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-green-600 text-xl">📊</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">24h Range</p>
            <div className="space-y-1">
              <div className="flex items-center text-sm">
                <span className="text-red-600 mr-1">↓</span>
                <span className="font-mono">{formatPrice(marketData.lowPrice24h)}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-green-600 mr-1">↑</span>
                <span className="font-mono">{formatPrice(marketData.highPrice24h)}</span>
              </div>
            </div>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-purple-600 text-xl">📏</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Market Activity</p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Trades:</span>
                <span className="font-semibold">{marketData.totalTrades}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Open Orders:</span>
                <span className="font-semibold">{marketData.openOrders}</span>
              </div>
            </div>
          </div>
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <span className="text-orange-600 text-xl">🔄</span>
          </div>
        </div>
      </div>
    </div>
  );
}
