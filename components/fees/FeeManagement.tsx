'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { formatCurrency } from '@/lib/utils';
import { BiExport } from "react-icons/bi";
import { FaFileCsv, FaFileExcel } from "react-icons/fa";
import Modal from '@/components/ui/Modal';
import useModal from '@/hooks/useModal';

export default function FeeManagement() {
  const exportDataModal = useModal();

  const { state, markFeesAsPaid } = useData();
  const { players, feeConfig } = state;

  // Only show players who have ever owed any fees (totalFees > 0)
  const playersToShow = players.filter(
    player => player.totalFees > 0
  );


  // Calculate court fee per player
  const calculateCourtFeePerPlayer = () => {
    if (!feeConfig.courtFeeType || !feeConfig.courtFeeAmount) return 0;
    
    if (feeConfig.courtFeeType === "perHead") {
      return feeConfig.courtFeeAmount;
    } else if (feeConfig.courtFeeType === "perHour") {
      const numCourts = feeConfig.numCourts || 1;
      const rentalHours = feeConfig.rentalHours || 1;
      const totalCourtFee = feeConfig.courtFeeAmount * numCourts * rentalHours;
      
      // Count active players (players who have played at least one game)
      const activePlayers = players.filter(p => p.gamesPlayed > 0).length;
      
      // Prevent division by zero
      if (activePlayers === 0) return 0;
      
      // Divide total court fee by number of active players
      return totalCourtFee / activePlayers;
    }
    
    return 0;
  };
  
  const courtFeePerPlayer = calculateCourtFeePerPlayer();

  // Handler for "Mark as Paid"
  const handleMarkAsPaid = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    // Include court fee in the paid amount
    const paidAmount = player.unpaidFees + (player.gamesPlayed > 0 ? courtFeePerPlayer : 0);
    
    // Mark the base fees as paid through the context
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
            <strong>Court Fee:</strong> {symbol}{feeConfig.courtFeeAmount.toFixed(2)} per hour &times; {numCourts} court{numCourts > 1 ? "s" : ""} &times; {rentalHours} hour{rentalHours > 1 ? "s" : ""}
            {" "}= <strong>{symbol}{totalCourtFee.toFixed(2)}</strong> 
            {/* ({activePlayers} players = <strong>{symbol}{perPlayerFee.toFixed(2)}</strong> per player) */}
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

  // Calculate total outstanding amount including court fees
  const outstandingRevenue = players.reduce((sum, player) => {
    const playerOutstanding = player.unpaidFees;
    // Add court fee if player has played games and still has unpaid fees
    const courtFee = (player.gamesPlayed > 0 && playerOutstanding > 0) ? courtFeePerPlayer : 0;
    return sum + playerOutstanding + courtFee;
  }, 0);

  // Collected = all paid fees plus court fees for paid players
  const collectedRevenue = players.reduce((sum, player) => {
    const playerPaid = player.paidFees;
    // Add court fee if player has played games and all fees are paid
    const courtFee = (player.gamesPlayed > 0 && player.unpaidFees === 0) ? courtFeePerPlayer : 0;
    return sum + playerPaid + courtFee;
  }, 0);

  // EXPORT FUNCTIONALITY
  const prepareExportData = () => {
    const rows = [];
    const dateStr = new Date().toLocaleDateString();
    const timeStr = new Date().toLocaleTimeString();
    
    // Title & Date
    rows.push(['ShuttleFlow Fee Reports']);
    rows.push([`Generated on: ${dateStr} ${timeStr}`]);
    rows.push([]);
    
    // Header row
    rows.push(['Player Name', 'Games Played', 'Game Fees', 'Court Fee', 'Total Amount', 'Status']);
    
    // Player data
    playersToShow.forEach(player => {
      const isPaid = player.unpaidFees === 0;
      
      // Calculate court fee for this player
      const playerCourtFee = player.gamesPlayed > 0 ? courtFeePerPlayer : 0;
      
      // Game fees (singles/doubles fees)
      const gameFees = isPaid
        ? player.paidFees
        : player.unpaidFees;
      
      // Total amount including court fee
      const totalAmount = gameFees + playerCourtFee;
      
      rows.push([
        player.name,
        player.gamesPlayed.toString(),
        formatCurrency(gameFees, feeConfig.currency),
        formatCurrency(playerCourtFee, feeConfig.currency),
        formatCurrency(totalAmount, feeConfig.currency),
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
  
  const handleDownloadCSV = () => {
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
    link.setAttribute("download", `${new Date().toISOString().split('T')[0]}_shuttleflow_fee_reports.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    exportDataModal.closeModal();
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
    exportDataModal.closeModal();
  };

  return (
    <div className='bg-white p-4 rounded-lg shadow-md mb-5'>
      <div className='flex justify-between items-center mb-5'>
        <h3 className="text-lg font-bold">Fee Management</h3>

        <button 
          className='bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm flex items-center gap-[0.2rem]'
          onClick={exportDataModal.openModal}
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
          <h4 className="text-md font-semibold mb-3">Players with Fees</h4>
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
                    Game Fees
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Court Fee
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {playersToShow.map(player => {
                  const isPaid = player.unpaidFees === 0;
                  
                  // Calculate court fee for this player
                  const playerCourtFee = player.gamesPlayed > 0 ? courtFeePerPlayer : 0;
                  
                  // Game fees (singles/doubles fees)
                  const gameFees = isPaid
                    ? player.paidFees
                    : player.unpaidFees;
                  
                  // Total amount including court fee
                  const totalAmount = gameFees + playerCourtFee;

                  return (
                    <tr key={player.id} className='hover:bg-gray-50'>
                      <td className="px-4 py-2 whitespace-nowrap capitalize">{player.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{player.gamesPlayed}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {formatCurrency(gameFees, feeConfig.currency)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {formatCurrency(playerCourtFee, feeConfig.currency)}
                      </td>
                      <td
                        className={
                          isPaid
                            ? "px-4 py-2 whitespace-nowrap text-green-600 font-medium"
                            : "px-4 py-2 whitespace-nowrap text-red-600 font-medium"
                        }
                      >
                        {formatCurrency(totalAmount, feeConfig.currency)}
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
          <p className="text-gray-500 italic text-center text-[12px] sm:text-sm">No payments to display</p>
        </div>
      )}
      
      {/* Export Modal */}
      <Modal 
        isOpen={exportDataModal.isOpen} 
        onClose={exportDataModal.closeModal}
        title="Export Fee Management Data"
        maxWidth="md"
      >
        <div className="my-4">
          <p className="text-sm text-gray-600 mb-2">
            Choose a format to export your fee management data:
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleDownloadCSV}
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
      </Modal>
    </div>
  );
}