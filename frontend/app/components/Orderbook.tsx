"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  formatPrice,
  formatQuantity,
  formatTotal,
  safeToNumber,
} from "../utils/formatters";
import Loader from "./Loader";

interface Order {
  id: string;
  type: "buy" | "sell";
  price: number;
  quantity: number;
  filledQuantity: number;
  userId: string;
  createdAt: string;
}

interface OrderbookProps {
  refreshTrigger: number;
}

export default function Orderbook({ refreshTrigger }: OrderbookProps) {
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const fetchOrderbook = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/orderbook`
      );
      setBuyOrders(response.data.buyOrders);
      setSellOrders(response.data.sellOrders);
    } catch (error) {
      console.error("Error fetching orderbook:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderbook();
  }, [refreshTrigger]);

  // Auto-refresh every 5 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchOrderbook, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const calculateDepth = (orders: Order[], maxQuantity: number) => {
    return orders.map((order) => {
      const remainingQty =
        safeToNumber(order.quantity) - safeToNumber(order.filledQuantity);
      return {
        ...order,
        remainingQuantity: remainingQty,
        depthPercentage: (remainingQty / maxQuantity) * 100,
      };
    });
  };

  const maxBuyQuantity = Math.max(
    ...buyOrders.map(
      (o) => safeToNumber(o.quantity) - safeToNumber(o.filledQuantity)
    ),
    1
  );

  const maxSellQuantity = Math.max(
    ...sellOrders.map(
      (o) => safeToNumber(o.quantity) - safeToNumber(o.filledQuantity)
    ),
    1
  );

  const buyOrdersWithDepth = calculateDepth(buyOrders, maxBuyQuantity);
  const sellOrdersWithDepth = calculateDepth(sellOrders, maxSellQuantity);

  if (loading && buyOrders.length === 0 && sellOrders.length === 0) {
    return <Loader />;
  }

  const OrderRow = ({
    order,
    type,
    depthPercentage,
  }: {
    order: any;
    type: "buy" | "sell";
    depthPercentage: number;
  }) => (
    <div className="relative group">
      <div
        className={`absolute inset-0 ${
          type === "buy" ? "bg-green-50" : "bg-red-50"
        } opacity-60`}
        style={{ width: `${depthPercentage}%` }}
      ></div>
      <div className="relative flex justify-between items-center py-2 px-3 hover:bg-gray-50 transition-colors">
        <div className="flex items-center space-x-3">
          <span
            className={`font-mono text-sm font-medium ${
              type === "buy" ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatPrice(order.price)}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            👤 {order.userId}
          </span>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm text-gray-900">
            {formatQuantity(order.remainingQuantity)}
          </div>
          <div className="text-xs text-gray-500">
            💰 {formatTotal(order.price, order.remainingQuantity)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-900">
              📚 Order Book
            </h2>
            {loading && (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh
                  ? "text-green-600 bg-green-50 hover:bg-green-100"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title={autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            >
              {autoRefresh ? "🔄" : "⏸️"}
            </button>
            <button
              onClick={fetchOrderbook}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Manual Refresh"
            >
              🔃
            </button>
            <div className="flex items-center space-x-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  autoRefresh ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
              ></div>
              <span className="text-xs text-gray-500">
                {autoRefresh ? "Live" : "Paused"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-4 text-xs text-gray-500 font-medium">
          <span>💰 Price (USD)</span>
          <span>📊 Quantity / Total</span>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center mb-3">
              <h3 className="text-sm font-medium text-red-600">
                📉 Sell Orders
              </h3>
              <span className="ml-2 text-xs text-gray-500">
                ({sellOrders.length})
              </span>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {sellOrdersWithDepth
                .slice(0, 15)
                .reverse()
                .map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    type="sell"
                    depthPercentage={order.depthPercentage}
                  />
                ))}
              {sellOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">📭 No sell orders</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-b py-3">
            <div className="text-center">
              <span className="text-xs text-gray-500">📏 Bid-Ask Spread</span>
              <div className="text-sm font-mono text-gray-700">
                {buyOrders.length > 0 && sellOrders.length > 0 ? (
                  (() => {
                    const spreadValue = safeToNumber(sellOrders[0].price) - safeToNumber(buyOrders[0].price);
                    const spreadColor = 
                      spreadValue <= 1 ? 'text-green-600' : 
                      spreadValue <= 5 ? 'text-yellow-600' : 
                      'text-red-600';
                    const spreadLabel = 
                      spreadValue <= 1 ? '🟢 Tight' : 
                      spreadValue <= 5 ? '🟡 Wide' : 
                      '🔴 Very Wide';
                    
                    return (
                      <div className="space-y-1">
                        <div className={`font-semibold ${spreadColor}`}>
                          {formatPrice(spreadValue)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {spreadLabel}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="space-y-1">
                    <div className="text-blue-600 font-semibold">No spread</div>
                    <div className="text-xs text-gray-500">⚡ Ready to trade</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center mb-3">
              <h3 className="text-sm font-medium text-green-600">
                📈 Buy Orders
              </h3>
              <span className="ml-2 text-xs text-gray-500">
                ({buyOrders.length})
              </span>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {buyOrdersWithDepth.slice(0, 15).map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  type="buy"
                  depthPercentage={order.depthPercentage}
                />
              ))}
              {buyOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">📭 No buy orders</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
