'use client';

import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';

export default function FeeConfigCard() {
  const { state, updateFeeConfig } = useData();
  const { feeConfig } = state;
  
  // Use state for form values
  const [singlesFee, setSinglesFee] = useState(feeConfig.singlesFee.toString());
  const [doublesFee, setDoublesFee] = useState(feeConfig.doublesFee.toString());
  const [currency, setCurrency] = useState(feeConfig.currency);
  const [isEditing, setIsEditing] = useState(false);
  
  // Update local state when feeConfig changes
  useEffect(() => {
    setSinglesFee(feeConfig.singlesFee.toString());
    setDoublesFee(feeConfig.doublesFee.toString());
    setCurrency(feeConfig.currency);
  }, [feeConfig]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse the values, ensuring they're valid numbers
    const parsedSinglesFee = parseFloat(singlesFee);
    const parsedDoublesFee = parseFloat(doublesFee);
    
    const newConfig = {
      singlesFee: isNaN(parsedSinglesFee) ? 0 : parsedSinglesFee,
      doublesFee: isNaN(parsedDoublesFee) ? 0 : parsedDoublesFee,
      currency,
      autoCalculate: true, // Always set to true (default)
      requirePayment: false // Always set to false
    };
    
    // Update the fee configuration
    updateFeeConfig(newConfig);
    setIsEditing(false);
    
    // Log for debugging
    console.log('Updated fee config:', newConfig);
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Fee Configuration</h3>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
          >
            Edit fees
          </button>
        )}
      </div>
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="singlesFee" className="block text-sm font-medium mb-1">
                Singles Fee (per player)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  {currency === 'PHP' ? '₱' : '$'}
                </span>
                <input
                  id="singlesFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={singlesFee}
                  onChange={(e) => setSinglesFee(e.target.value)}
                  className="pl-8 w-full border rounded-md px-3 py-2"
                  placeholder="Enter singles fee"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="doublesFee" className="block text-sm font-medium mb-1">
                Doubles Fee (per player)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  {currency === 'PHP' ? '₱' : '$'}
                </span>
                <input
                  id="doublesFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={doublesFee}
                  onChange={(e) => setDoublesFee(e.target.value)}
                  className="pl-8 w-full border rounded-md px-3 py-2"
                  placeholder="Enter doubles fee"
                  required
                />
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="currency" className="block text-sm font-medium mb-1">
              Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="USD">USD ($)</option>
              <option value="PHP">PHP (₱)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                // Reset form values to current state
                setSinglesFee(feeConfig.singlesFee.toString());
                setDoublesFee(feeConfig.doublesFee.toString());
                setCurrency(feeConfig.currency);
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">Singles Fee</p>
              <p className="text-lg font-semibold">
                {feeConfig.currency === 'PHP' ? '₱' : '$'}{feeConfig.singlesFee.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">per player</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">Doubles Fee</p>
              <p className="text-lg font-semibold">
                {feeConfig.currency === 'PHP' ? '₱' : '$'}{feeConfig.doublesFee.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">per player</p>
            </div>
          </div>
          
          {/* <div className="space-y-1 mt-4">
            <p className="text-sm">
              <span className="font-medium">Currency:</span> {feeConfig.currency}
            </p>
            <p className="text-sm text-green-600">
              <span className="font-medium">Auto Fee Calculation:</span> Enabled
            </p>
          </div> */}
        </div>
      )}
    </div>
  );
}