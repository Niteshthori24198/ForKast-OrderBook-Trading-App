"use client";

import React, { useState } from "react";
import axios from "axios";

interface OrderFormProps {
  onOrderPlaced: () => void;
}

interface OrderFormState {
  orderType: "buy" | "sell";
  price: string;
  quantity: string;
  userId: string;
  loading: boolean;
  error: string;
  success: string;
}

export default function OrderForm({ onOrderPlaced }: OrderFormProps) {
  const [formState, setFormState] = useState<OrderFormState>({
    orderType: "buy",
    price: "",
    quantity: "",
    userId: "",
    loading: false,
    error: "",
    success: "",
  });

  const updateFormState = (updates: Partial<OrderFormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    updateFormState({
      price: "",
      quantity: "",
      userId: "",
      error: "",
      success: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateFormState({ loading: true, error: "", success: "" });

    // Validate inputs before sending
    const price = parseFloat(formState.price);
    const quantity = parseFloat(formState.quantity);

    if (isNaN(price) || price <= 0) {
      updateFormState({ 
        loading: false, 
        error: "Please enter a valid price greater than 0" 
      });
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      updateFormState({ 
        loading: false, 
        error: "Please enter a valid quantity greater than 0" 
      });
      return;
    }

    if (!formState.userId.trim()) {
      updateFormState({ 
        loading: false, 
        error: "Please enter a valid User ID" 
      });
      return;
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        type: formState.orderType,
        price: price,
        quantity: quantity,
        userId: formState.userId.trim(),
      });

      updateFormState({
        price: "",
        quantity: "",
        userId: "",
        success: `${formState.orderType.toUpperCase()} order placed successfully!`,
      });
      onOrderPlaced();

      setTimeout(() => updateFormState({ success: "" }), 3000);
    } catch (error: any) {
      updateFormState({
        error: error.response?.data?.message || "Error placing order",
      });
    } finally {
      updateFormState({ loading: false });
    }
  };

  const totalValue =
    formState.price && formState.quantity
      ? (parseFloat(formState.price) * parseFloat(formState.quantity)).toFixed(
          2
        )
      : "0.00";

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Place Order</h2>
            <p className="text-sm text-gray-600">
              Enter your order details below
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={resetForm}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear Form"
            >
              🗑️
            </button>
            <button
              onClick={onOrderPlaced}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh Data"
            >
              🔄
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Order Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => updateFormState({ orderType: "buy" })}
                className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  formState.orderType === "buy"
                    ? "bg-green-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                📈 Buy
              </button>
              <button
                type="button"
                onClick={() => updateFormState({ orderType: "sell" })}
                className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  formState.orderType === "sell"
                    ? "bg-red-500 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                📉 Sell
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💰 Price (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                step="0.01"
                value={formState.price}
                onChange={(e) => updateFormState({ price: e.target.value })}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📊 Quantity
            </label>
            <input
              type="number"
              step="0.01"
              value={formState.quantity}
              onChange={(e) => updateFormState({ quantity: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👤 User ID
            </label>
            <input
              type="text"
              value={formState.userId}
              onChange={(e) => updateFormState({ userId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your user ID : user123"
              required
            />
          </div>

          {formState.price && formState.quantity && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">💵 Total Value:</span>
                <span className="text-lg font-semibold text-gray-900">
                  ${totalValue}
                </span>
              </div>
            </div>
          )}

          {formState.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">❌ {formState.error}</p>
            </div>
          )}

          {formState.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-600">✅ {formState.success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={formState.loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
              formState.loading
                ? "bg-gray-400 cursor-not-allowed"
                : formState.orderType === "buy"
                ? "bg-green-500 hover:bg-green-600 active:bg-green-700"
                : "bg-red-500 hover:bg-red-600 active:bg-red-700"
            }`}
          >
            {formState.loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Placing Order...
              </div>
            ) : (
              `${
                formState.orderType === "buy" ? "🚀" : "💸"
              } Place ${formState.orderType.toUpperCase()} Order`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
