'use client';

import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { CourtFeeType } from '@/types';

import { MdOutlineRadioButtonUnchecked } from "react-icons/md";
import { MdOutlineRadioButtonChecked } from "react-icons/md";
import { LuClock3 } from "react-icons/lu";

export default function FeeConfigCard() {
  const { state, updateFeeConfig } = useData();
  const { feeConfig } = state;
  
  // Use state for form values
  const [singlesFee, setSinglesFee] = useState(feeConfig.singlesFee.toString());
  const [doublesFee, setDoublesFee] = useState(feeConfig.doublesFee.toString());
  const [currency, setCurrency] = useState(feeConfig.currency);
  const [isEditing, setIsEditing] = useState(false);
  
  // Court fee
  const [courtFeeType, setCourtFeeType] = useState<CourtFeeType>(feeConfig.courtFeeType || 'perHour');
  const [courtFeeAmount, setCourtFeeAmount] = useState(feeConfig.courtFeeAmount?.toString() || '');
  const [numCourts, setNumCourts] = useState(feeConfig.numCourts?.toString() || '');
  const [rentalHours, setRentalHours] = useState(feeConfig.rentalHours?.toString() || '');

  // Update local state when feeConfig changes
  useEffect(() => {
    setSinglesFee(feeConfig.singlesFee.toString());
    setDoublesFee(feeConfig.doublesFee.toString());
    setCurrency(feeConfig.currency);

    setCourtFeeType(feeConfig.courtFeeType || 'perHour');
    setCourtFeeAmount(feeConfig.courtFeeAmount?.toString() || '');
    setNumCourts(feeConfig.numCourts?.toString() || '');
    setRentalHours(feeConfig.rentalHours?.toString() || '');
  }, [feeConfig]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse the values, ensuring they're valid numbers
    const parsedSinglesFee = parseFloat(singlesFee);
    const parsedDoublesFee = parseFloat(doublesFee);
    const parsedCourtFeeAmount = parseFloat(courtFeeAmount);
    const parsedNumCourts = parseInt(numCourts);
    const parsedRentalHours = parseFloat(rentalHours);

    const newConfig = {
      singlesFee: isNaN(parsedSinglesFee) ? 0 : parsedSinglesFee,
      doublesFee: isNaN(parsedDoublesFee) ? 0 : parsedDoublesFee,
      currency,
      autoCalculate: true,
      requirePayment: false,
      courtFeeType,
      courtFeeAmount: isNaN(parsedCourtFeeAmount) ? 0 : parsedCourtFeeAmount,
      numCourts: courtFeeType === "perHour" ? (isNaN(parsedNumCourts) ? 1 : parsedNumCourts) : undefined,
      rentalHours: courtFeeType === "perHour" ? (isNaN(parsedRentalHours) ? 1 : parsedRentalHours) : undefined,
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
            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm flex items-center gap-[0.2rem]"
          >
            Edit fees
          </button>
        )}
      </div>
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="singlesFee" className="block text-xs text-gray-500 mb-1">
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
                  className="pl-6.5 w-full border rounded-md px-3 py-2"
                  placeholder="Enter singles fee"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="doublesFee" className="block text-xs text-gray-500 mb-1">
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
                  className="pl-6.5 w-full border rounded-md px-3 py-2"
                  placeholder="Enter doubles fee"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium mb-2">Court Fee</label>
            <div className="flex gap-3 mb-2">
              <label className={`flex items-center p-1 cursor-pointer justify-center text-[14px] ${courtFeeType === 'perHead' && 'text-green-600' }`}>
                {courtFeeType === 'perHead' ? <MdOutlineRadioButtonChecked size={`21px`} className='text-green-500'/> : <MdOutlineRadioButtonUnchecked size={`21px`} className='text-gray-400'/>}

                <input
                  type="radio"
                  name="courtFeeType"
                  value="perHead"
                  checked={courtFeeType === "perHead"}
                  onChange={() => setCourtFeeType("perHead")}
                  className="hidden"
                />
                <span className='ml-[4px]'>Per head</span>
              </label>

              <label className={`flex items-center p-1 cursor-pointer justify-center text-[14px] ${courtFeeType === 'perHour' && 'text-green-600' }`}>
                {courtFeeType === 'perHour' ? <MdOutlineRadioButtonChecked size={`21px`} className='text-green-500'/> : <MdOutlineRadioButtonUnchecked size={`21px`} className='text-gray-400'/>}

                <input
                  type="radio"
                  name="courtFeeType"
                  value="perHour"
                  checked={courtFeeType === "perHour"}
                  onChange={() => setCourtFeeType("perHour")}
                  className="hidden"
                />
                <span className='ml-[4px]'>Per hour</span>
              </label>
            </div>
            <div className="flex gap-3 items-center mb-2 flex-col">
              <div className='w-full'>
                <label htmlFor="courtFeeAmount" className='block text-xs text-gray-500 mb-1'>{courtFeeType === "perHour" ? "Court Rate per Hour" : "Court Rate per Player"}</label>
                <div className="relative">
                  <span className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500'>{currency === "PHP" ? "₱" : "$"}</span>
                  <input
                    type="number"
                    id="courtFeeAmount"
                    value={courtFeeAmount}
                    onChange={e => setCourtFeeAmount(e.target.value)}
                    className="border rounded-md px-3 py-2 w-full pl-6.5"
                    placeholder={`Enter ${courtFeeType === "perHour" ? "rate per hour" : "rate per player"}`}
                    required
                  />
                </div>
              </div>
              {courtFeeType === "perHour" && (
                <div className="flex gap-2 w-full">
                  <div className='w-full'>
                    <label htmlFor="numCourts" className='block text-xs text-gray-500 mb-1'>Number of courts</label>
                    <input
                      type="number"
                      id='numCourts'
                      min="1"
                      value={numCourts}
                      onChange={e => setNumCourts(e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="Enter number of courts"
                      required
                    />
                  </div>

                  <div className='w-full'>
                    <label htmlFor="rentalHours" className='block text-xs text-gray-500 mb-1'>Rental hours</label>
                    <div className="relative">
                      <LuClock3 className='absolute left-2 text-[16px] top-[11.5px] items-center pointer-events-none text-gray-500'/>
                      <input
                        type="number"
                        id='rentalHours'
                        min="1"
                        step="0.1"
                        value={rentalHours}
                        onChange={e => setRentalHours(e.target.value)}
                        className="border rounded-md px-3 py-2 w-full pl-7"
                        placeholder="Number of hours?"
                        required
                      />
                    </div>
                  </div>

                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {courtFeeType === "perHour"
                ? "Total court rental fee = Amount × Number of courts × Rental hours, divided among all players."
                : "Flat fee per player for unlimited play."}
            </p>
          </div>

          <div className='p-4 bg-gray-100 rounded-md'>
            <div className='w-full'>
              <label htmlFor='currency' className="block text-xs text-gray-500 mb-1">Select Currency</label>
              <div className="relative">
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full appearance-none border rounded-md px-2 py-2 pl-3 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 h-[38px]"
                >
                  <option value="USD">USD ($)</option>
                  <option value="PHP">PHP (₱)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-gray-700">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                // Reset form values to current state
                setSinglesFee(feeConfig.singlesFee.toString());
                setDoublesFee(feeConfig.doublesFee.toString());
                setCurrency(feeConfig.currency);
                setCourtFeeType(feeConfig.courtFeeType || 'perHour');
                setCourtFeeAmount(feeConfig.courtFeeAmount?.toString() || '');
                setNumCourts(feeConfig.numCourts?.toString() || '');
                setRentalHours(feeConfig.rentalHours?.toString() || '');
              }}
              className="bg-gray-200 hover:bg-gray-400 text-gray-800 py-2.5 px-5 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white py-2.5 px-5 rounded"
            >
              Save Changes
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
        </div>
      )}
    </div>
  );
}