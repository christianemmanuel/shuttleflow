'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { formatCurrency } from '@/lib/utils';
import { BiExport } from "react-icons/bi";
import { FaFileCsv, FaFileExcel } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

export default function FeeManagement() {
  const { state, markFeesAsPaid } = useData();
  const { players, feeConfig } = state;
  const [showExportModal, setShowExportModal] = useState(false);

  // Only show players who have ever owed any fees (totalFees > 0)
  const playersToShow = players.filter(
    player => player.totalFees > 0
  );

  // Store last paid played amount per player
  const [paidAmounts, setPaidAmounts] = useState<{ [playerId: string]: number }>({});

  // Handler for "Mark as Paid"
  const handleMarkAsPaid = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    // The unpaidFees now already includes the court fee from our data model fix,
    // so we simply use that value.
    const paidAmount = player.unpaidFees;
    setPaidAmounts(prev => ({ ...prev, [playerId]: paidAmount }));
    // Just pass the unpaidFees amount - it already includes court fee
    markFeesAsPaid(playerId, player.unpaidFees);
  };

  // --- Court Fee Calculation ---
  const renderCourtFee = () => {
    if (!feeConfig.courtFeeType || !feeConfig.courtFeeAmount) return null;
    const symbol =
      feeConfig.currency === "PHP" ? "₱" :
      feeConfig.currency === "USD" ? "$" :
      feeConfig.currency === "EUR" ? "€" :
      feeConfig.currency === "GBP" ? "£" : feeConfig.currency + " ";

    if (feeConfig.courtFeeType === "perHour") {
      const numCourts = feeConfig.numCourts || 1;
      const rentalHours = feeConfig.rentalHours || 1;
      const totalCourtFee = (feeConfig.courtFeeAmount ?? 0) * numCourts * rentalHours;
      return (
        <div className="mb-4 p-3 bg-yellow-50 rounded border border-yellow-200 text-yellow-900 text-sm flex flex-col md:flex-row md:items-center gap-1">
          <span>
            <strong>Court Fee:</strong> {symbol}{feeConfig.courtFeeAmount.toFixed(2)} per hour × {numCourts} court{numCourts > 1 ? "s" : ""} × {rentalHours} hour{rentalHours > 1 ? "s" : ""}
            {" "}= <strong>{symbol}{totalCourtFee.toFixed(2)}</strong> (to be divided among all players)
          </span>
        </div>
      );
    } else if (feeConfig.courtFeeType === "perHead") {
      return (
        <div className="mb-4 p-3 bg-yellow-50 rounded border border-yellow-200 text-yellow-900 text-sm flex flex-col md:flex-row md:items-center gap-1">
          <span>
            <strong>Court Fee:</strong> {symbol}{feeConfig.courtFeeAmount.toFixed(2)} per player
          </span>
        </div>
      );
    }
    return null;
  };

  // Get unpaid players and all active players
  const unpaidPlayers = players.filter(player => player.unpaidFees > 0);
  const unpaidPlayerCount = unpaidPlayers.length;
  const activePlayers = players.filter(player => player.gamesPlayed > 0);
  const activePlayerCount = activePlayers.length || 1; // avoid division by zero

  // We no longer need to calculate court fee separately for outstanding,
  // as it's now included in player.unpaidFees
  const outstandingRevenue = players.reduce((sum, player) => sum + player.unpaidFees, 0);

  // Collected = all paid fees (already includes court fee)
  const collectedRevenue = players.reduce((sum, player) => sum + player.paidFees, 0);

  // EXPORT FUNCTIONALITY
  const prepareExportData = () => {
    const rows = [];
    const dateStr = new Date().toLocaleDateString();
    const timeStr = new Date().toLocaleTimeString();
    
    // Title & Date
    rows.push(['Fee Management Report']);
    rows.push([`Generated on: ${dateStr} ${timeStr}`]);
    rows.push([]);
    
    // Header row
    rows.push(['Player Name', 'Games Played', 'Played Amount', 'Status']);
    
    // Player data
    playersToShow.forEach(player => {
      const isPaid = player.unpaidFees === 0;
      
      // Use player.unpaidFees for unpaid, or stored paid amount for paid players
      const playedAmount = isPaid
        ? paidAmounts[player.id] ?? player.paidFees  // use paidFees as fallback
        : player.unpaidFees;  // unpaidFees already includes court fee
      
      rows.push([
        player.name,
        player.gamesPlayed.toString(),
        formatCurrency(playedAmount, feeConfig.currency),
        isPaid ? 'Paid' : 'Unpaid'
      ]);
    });
    
    // Empty row
    rows.push([]);
    
    // Court fee details
    if (feeConfig.courtFeeType === "perHead") {
      rows.push(['Court Fee Details:', `${formatCurrency(feeConfig.courtFeeAmount ?? 0, feeConfig.currency)} per player`]);
    } else if (feeConfig.courtFeeType === "perHour") {
      const numCourts = feeConfig.numCourts || 1;
      const rentalHours = feeConfig.rentalHours || 1;
      const totalCourtFee = (feeConfig.courtFeeAmount ?? 0) * numCourts * rentalHours;
      rows.push([
        'Court Fee Details:', 
        `${formatCurrency(feeConfig.courtFeeAmount ?? 0, feeConfig.currency)} per hour × ${numCourts} court(s) × ${rentalHours} hour(s) = ${formatCurrency(totalCourtFee, feeConfig.currency)}`
      ]);
    }
    
    rows.push([]);
    
    // Summary rows
    rows.push(['SUMMARY']);
    rows.push(['Collected', '', formatCurrency(collectedRevenue, feeConfig.currency)]);
    rows.push(['Outstanding', '', formatCurrency(outstandingRevenue, feeConfig.currency)]);
    rows.push(['Total', '', formatCurrency(collectedRevenue + outstandingRevenue, feeConfig.currency)]);
    
    return rows;
  };
  
  const downloadCSV = () => {
    const rows = prepareExportData();
    let csvContent = "data:text/csv;charset=utf-8,";
    
    rows.forEach(row => {
      const csvRow = row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma or newline
        if (cell && (cell.includes(',') || cell.includes('\n') || cell.includes('"'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell || '';
      }).join(',');
      csvContent += csvRow + '\n';
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fee_management_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportModal(false);
  };
  
  const downloadSheet = () => {
    const rows = prepareExportData();
    
    // Create HTML table for Excel
    let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
    html += '<head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Fee Management</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>';
    html += '<body><table>';
    
    rows.forEach(row => {
      html += '<tr>';
      row.forEach(cell => {
        html += `<td>${cell || ''}</td>`;
      });
      html += '</tr>';
    });
    
    html += '</table></body></html>';
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fee_management_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  return (
    <div className='bg-white p-4 rounded-lg shadow-md mb-5'>
      <div className='flex justify-between items-center mb-5'>
        <h3 className="text-lg font-bold">Fee Management</h3>

        <button 
          className='bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm flex items-center gap-[0.2rem]'
          onClick={() => setShowExportModal(true)}
        >
          <BiExport /> Export
        </button>
      </div>

      {/* --- Court Fee Info --- */}
      {renderCourtFee()}

      {/* Only Collected and Outstanding, aligned at the bottom */}
      <div className="grid grid-cols-2 gap-4 mb-5 w-full">
        <div className="bg-green-50 p-3 rounded-lg flex flex-col">
          <p className="text-sm text-green-800 mb-1">Collected</p>
          <p className="text-2xl font-bold text-green-900 w-full">
            {formatCurrency(collectedRevenue, feeConfig.currency)}
          </p>
        </div>
        <div className="bg-amber-50 p-3 rounded-lg flex flex-col">
          <p className="text-sm text-amber-800 mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-amber-900 w-full">
            {formatCurrency(outstandingRevenue, feeConfig.currency)}
          </p>
        </div>
      </div>

      {playersToShow.length > 0 ? (
        <div className="pt-3">
          <h4 className="text-md font-semibold mb-3">Players with Unpaid Fees</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Games played
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Played Amount
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {playersToShow.map(player => {
                  const isPaid = player.unpaidFees === 0;
                  
                  // Show the played amount - unpaidFees already includes court fee
                  const playedAmount = isPaid
                    ? paidAmounts[player.id] ?? player.paidFees
                    : player.unpaidFees;

                  return (
                    <tr key={player.id} className='hover:bg-gray-50'>
                      <td className="px-4 py-2 whitespace-nowrap">{player.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{player.gamesPlayed}</td>
                      <td
                        className={
                          isPaid
                            ? "px-4 py-2 whitespace-nowrap text-green-600 font-medium"
                            : "px-4 py-2 whitespace-nowrap text-red-600 font-medium"
                        }
                      >
                        {formatCurrency(playedAmount, feeConfig.currency)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">
                        {isPaid ? (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-xs font-semibold opacity-70">
                            Paid
                          </span>
                        ) : (
                          <button
                            onClick={() => handleMarkAsPaid(player.id)}
                            className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm"
                          >
                            Set Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className='p-4 bg-gray-50 rounded-md text-center'>
          <p className="text-gray-500 italic text-center text-[12px] sm:text-sm">No outstanding payments</p>
        </div>
      )}
      
      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-medium">Export Fee Management Data</h3>
              <button 
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <IoMdClose size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Choose a format to export your fee management data:
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={downloadCSV}
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <FaFileCsv size={40} className="text-green-600 mb-3" />
                  <span className="font-medium">CSV File</span>
                  <span className="text-xs text-gray-500 mt-1">For spreadsheet apps</span>
                </button>
                
                <button
                  onClick={downloadSheet}
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <FaFileExcel size={40} className="text-green-800 mb-3" />
                  <span className="font-medium">Excel Sheet</span>
                  <span className="text-xs text-gray-500 mt-1">For Microsoft Excel</span>
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 border-t text-right rounded-b-lg">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded mr-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}