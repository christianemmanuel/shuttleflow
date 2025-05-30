'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { formatCurrency } from '@/lib/utils';

export default function FeeManagement() {
  const { state, markFeesAsPaid } = useData();
  const { players, gameSessions, feeConfig } = state;
  
  // Calculate total revenue
  const totalRevenue = players.reduce((sum, player) => sum + player.totalFees, 0);
  
  // Calculate collected revenue
  const collectedRevenue = players.reduce((sum, player) => sum + player.paidFees, 0);
  
  // Get players with unpaid fees
  const playersWithUnpaidFees = players.filter(player => player.unpaidFees > 0);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-5">
      <h3 className="text-lg font-bold mb-4">Fee Management</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-blue-900">
            {formatCurrency(totalRevenue, feeConfig.currency)}
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-800 mb-1">Collected</p>
          <p className="text-2xl font-bold text-green-900">
            {formatCurrency(collectedRevenue, feeConfig.currency)}
          </p>
        </div>
        
        <div className="bg-amber-50 p-4 rounded-lg">
          <p className="text-sm text-amber-800 mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-amber-900">
            {formatCurrency(totalRevenue - collectedRevenue, feeConfig.currency)}
          </p>
        </div>
      </div>
      
      {playersWithUnpaidFees.length > 0 ? (
        <div>
          <h4 className="text-md font-semibold mb-3">Players with Unpaid Fees</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unpaid Amount
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {playersWithUnpaidFees.map(player => (
                  <tr key={player.id} className='hover:bg-gray-50'>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {player.name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-red-600 font-medium">
                      {formatCurrency(player.unpaidFees, feeConfig.currency)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      <button
                        onClick={() => markFeesAsPaid(player.id, player.unpaidFees)}
                        className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm"
                      >
                        Mark as Paid
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 italic text-[12px] text-center">No outstanding payments</p>
      )}
    </div>
  );
}