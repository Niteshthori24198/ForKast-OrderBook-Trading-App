"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Loader from "./Loader";

interface Trade {
  id: string;
  price: number;
  quantity: number;
  executedAt: string;
  buyUserId: string;
  sellUserId: string;
}

interface TradeHistoryProps {
  refreshTrigger: number;
}

export default function TradeHistory({ refreshTrigger }: TradeHistoryProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTrades = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/trades/history`
      );
      setTrades(response.data);
    } catch (error) {
      console.error("Error fetching trades:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [refreshTrigger]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Trade History</h2>
          <span className="text-sm text-gray-500">{trades.length} trades</span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-4 text-xs text-gray-500 font-medium">
          <span>Price</span>
          <span>Quantity</span>
          <span>Time</span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {trades.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-gray-500 text-sm">No trades yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Trades will appear here once orders are matched
              </p>
            </div>
          ) : (
            trades
              .slice()
              .reverse()
              .map((trade, index) => (
                <div
                  key={trade.id}
                  className={`grid grid-cols-3 gap-4 py-3 px-3 rounded-lg border transition-all hover:bg-gray-50 ${
                    index < 3 ? "bg-blue-50 border-blue-200" : "border-gray-200"
                  }`}
                >
                  <div>
                    <div className="font-mono text-sm font-medium text-gray-900">
                      ${Number(trade.price).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      $
                      {(Number(trade.price) * Number(trade.quantity)).toFixed(
                        2
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-sm text-gray-900">
                      {Number(trade.quantity).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">qty</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-900">
                      {formatTime(trade.executedAt)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(trade.executedAt)}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>

        {trades.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Last Price:</span>
                <span className="ml-2 font-mono font-medium">
                  ${Number(trades[trades.length - 1]?.price || 0).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">24h Volume:</span>
                <span className="ml-2 font-mono font-medium">
                  $
                  {trades
                    .reduce(
                      (sum, trade) =>
                        sum + Number(trade.price) * Number(trade.quantity),
                      0
                    )
                    .toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
