import React, { useState } from 'react';
import { useBilling } from '../context/BillingContext';
import { Bill, ProductItem } from '../types/billing';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { PaymentCollectModal } from './PaymentCollectModal';
import {
  Users,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Receipt,
  Printer,
  CreditCard,
  Edit2,
  Check,
  RotateCcw,
  Download,
  ShieldCheck,
  Filter,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    bills,
    products,
    updateProductPrice,
    setSelectedBillForReceipt,
    resetToDemoData,
    getOperatorStats,
  } = useBilling();

  const [selectedUserTab, setSelectedUserTab] = useState<'user1' | 'user2' | 'all'>('user1');
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<Bill | null>(null);

  // Rate master editing state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPriceValue, setNewPriceValue] = useState<string>('');

  // Operator stats
  const statsUser1 = getOperatorStats('user1');
  const statsUser2 = getOperatorStats('user2');

  const grandTotalSales = bills.reduce((sum, b) => sum + b.grandTotal, 0);
  const grandTotalCollected = bills.reduce((sum, b) => sum + b.paidAmount, 0);
  const grandTotalPending = bills.reduce((sum, b) => sum + b.pendingAmount, 0);

  // Filter bills by selected user tab
  const displayedUserBills =
    selectedUserTab === 'all'
      ? bills
      : bills.filter((b) => b.operatorId === selectedUserTab);

  const handleStartEditPrice = (product: ProductItem) => {
    setEditingPriceId(product.id);
    setNewPriceValue(product.defaultPrice.toString());
  };

  const handleSavePrice = (productId: string) => {
    const val = Number(newPriceValue);
    if (!isNaN(val) && val >= 0) {
      updateProductPrice(productId, val);
    }
    setEditingPriceId(null);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bills, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `featherbill_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-neutral-100">Store Management & Admin Panel</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Reconcile pending bills, audit individual operator performance, and update daily poultry rates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            title="Download full database snapshot"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Reset all demo data back to default initial state?')) {
                resetToDemoData();
              }
            }}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-red-950/60 hover:text-red-300 text-neutral-400 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            title="Reset demo records"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Global Business KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-xs">
          <div className="flex justify-between items-center text-neutral-400 text-xs mb-1">
            <span>Total Sales Volume</span>
            <TrendingUp className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="text-xl font-extrabold font-mono text-neutral-100">
            {formatCurrency(grandTotalSales)}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            {bills.length} total bills generated
          </span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-xs">
          <div className="flex justify-between items-center text-neutral-400 text-xs mb-1">
            <span>Cash / Digital Collected</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold font-mono text-emerald-400">
            {formatCurrency(grandTotalCollected)}
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">
            {((grandTotalCollected / (grandTotalSales || 1)) * 100).toFixed(1)}% recovery rate
          </span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-xs">
          <div className="flex justify-between items-center text-neutral-400 text-xs mb-1">
            <span>Total Credit Pending</span>
            <AlertTriangle className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-extrabold font-mono text-blue-400">
            {formatCurrency(grandTotalPending)}
          </div>
          <span className="text-[11px] text-blue-300/70 mt-1 block">
            Across {bills.filter((b) => b.pendingAmount > 0).length} partial/unpaid bills
          </span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-xs">
          <div className="flex justify-between items-center text-neutral-400 text-xs mb-1">
            <span>Active Billing Clerks</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-extrabold font-mono text-blue-300">
            2 Operators
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            Rajesh (Counter 1) · Suresh (Counter 2)
          </span>
        </div>
      </div>

      {/* Operator Individual Performance Comparison Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Individual User Breakdown (Counter 1 vs Counter 2)
            </h3>
            <p className="text-xs text-neutral-400">
              Individual bill generation, cash collection, and pending credit per operator.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* User 1 Card */}
          <div
            onClick={() => setSelectedUserTab('user1')}
            className={`p-5 rounded-xl border cursor-pointer transition-all ${
              selectedUserTab === 'user1'
                ? 'bg-neutral-850 border-emerald-500 shadow-md'
                : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                  R
                </span>
                <div>
                  <h4 className="text-sm font-bold text-neutral-100">Rajesh Sharma</h4>
                  <p className="text-[11px] text-neutral-400">Counter 1 (Retail & Live Birds)</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-neutral-950 text-neutral-300 rounded text-xs font-mono font-bold border border-neutral-800">
                {statsUser1.totalBills} Bills
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 bg-neutral-950 rounded-lg border border-neutral-800/80 text-center font-mono text-xs">
              <div>
                <span className="text-[10px] font-sans text-neutral-400 block">Total Billed</span>
                <span className="font-bold text-neutral-200">{formatCurrency(statsUser1.totalSales)}</span>
              </div>
              <div>
                <span className="text-[10px] font-sans text-neutral-400 block">Cash Collected</span>
                <span className="font-bold text-emerald-400">{formatCurrency(statsUser1.collectedAmount)}</span>
              </div>
              <div>
                <span className="text-[10px] font-sans text-neutral-400 block">Pending Due</span>
                <span className="font-bold text-amber-400">{formatCurrency(statsUser1.pendingAmount)}</span>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 mt-2.5 text-center">
              Click to view all individual bills generated by Rajesh →
            </p>
          </div>

          {/* User 2 Card */}
          <div
            onClick={() => setSelectedUserTab('user2')}
            className={`p-5 rounded-xl border cursor-pointer transition-all ${
              selectedUserTab === 'user2'
                ? 'bg-neutral-850 border-blue-500 shadow-md'
                : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  S
                </span>
                <div>
                  <h4 className="text-sm font-bold text-neutral-100">Suresh Patel</h4>
                  <p className="text-[11px] text-neutral-400">Counter 2 (Bulk Wholesale & Eggs)</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-neutral-950 text-neutral-300 rounded text-xs font-mono font-bold border border-neutral-800">
                {statsUser2.totalBills} Bills
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 bg-neutral-950 rounded-lg border border-neutral-800/80 text-center font-mono text-xs">
              <div>
                <span className="text-[10px] font-sans text-neutral-400 block">Total Billed</span>
                <span className="font-bold text-neutral-200">{formatCurrency(statsUser2.totalSales)}</span>
              </div>
              <div>
                <span className="text-[10px] font-sans text-neutral-400 block">Cash Collected</span>
                <span className="font-bold text-emerald-400">{formatCurrency(statsUser2.collectedAmount)}</span>
              </div>
              <div>
                <span className="text-[10px] font-sans text-neutral-400 block">Pending Due</span>
                <span className="font-bold text-blue-400">{formatCurrency(statsUser2.pendingAmount)}</span>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 mt-2.5 text-center">
              Click to view all individual bills generated by Suresh →
            </p>
          </div>
        </div>
      </div>

      {/* Individual User Bills Inspector */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-neutral-400" />
              Showing Invoices Generated by:
            </span>
            <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800 gap-1">
              <button
                onClick={() => setSelectedUserTab('user1')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedUserTab === 'user1'
                    ? 'bg-neutral-800 text-blue-400 font-bold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Rajesh Sharma (Counter 1)
              </button>
              <button
                onClick={() => setSelectedUserTab('user2')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedUserTab === 'user2'
                    ? 'bg-neutral-800 text-blue-400 font-bold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Suresh Patel (Counter 2)
              </button>
              <button
                onClick={() => setSelectedUserTab('all')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedUserTab === 'all'
                    ? 'bg-neutral-800 text-white font-bold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                All Combined ({bills.length})
              </button>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950/80 text-[11px] font-bold uppercase text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Bill #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Party Name</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Pending</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {displayedUserBills.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-850/60 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-neutral-100">
                      {b.billNumber}
                    </td>
                    <td className="py-2.5 px-4 text-[11px] text-neutral-400">
                      {formatDateTime(b.invoiceDate).split(',')[0]}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-neutral-100">
                      {b.customerName}
                    </td>
                    <td className="py-2.5 px-4 text-neutral-400 max-w-xs truncate">
                      {b.items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-neutral-200">
                      {formatCurrency(b.grandTotal)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-emerald-400">
                      {formatCurrency(b.paidAmount)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-blue-400">
                      {b.pendingAmount > 0 ? formatCurrency(b.pendingAmount) : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          b.paymentStatus === 'PAID'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : b.paymentStatus === 'PARTIAL'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {b.pendingAmount > 0 && (
                          <button
                            onClick={() => setSelectedBillForPayment(b)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-colors"
                            title="Collect payment on this bill"
                          >
                            Pay
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedBillForReceipt(b)}
                          className="p-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors"
                          title="Print/Preview"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Daily Mandi Rate Board (Price Master) */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Daily Mandi Rate Board (Pricing Master)
          </h3>
          <p className="text-xs text-neutral-400">
            Adjust chicken per kg rates and egg tray/crate wholesale prices. All billing counters update immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between shadow-xs"
            >
              <div>
                <span className="text-[10px] font-semibold text-neutral-400 uppercase">
                  {p.category} · Per {p.unit}
                </span>
                <h5 className="text-xs font-bold text-neutral-100 mt-0.5">{p.name}</h5>
              </div>

              {editingPriceId === p.id ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono text-neutral-400">₹</span>
                  <input
                    type="number"
                    step="any"
                    value={newPriceValue}
                    onChange={(e) => setNewPriceValue(e.target.value)}
                    className="w-20 px-2 py-1 bg-neutral-950 border border-blue-500 rounded text-xs font-mono font-bold text-neutral-100 text-right"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSavePrice(p.id)}
                    className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold font-mono text-emerald-400">
                    ₹{p.defaultPrice}
                  </span>
                  <button
                    onClick={() => handleStartEditPrice(p)}
                    className="p-1 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded transition-colors"
                    title="Change default rate"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Collect Payment Modal inside Admin */}
      {selectedBillForPayment && (
        <PaymentCollectModal
          bill={selectedBillForPayment}
          onClose={() => setSelectedBillForPayment(null)}
          onSuccess={() => setSelectedBillForPayment(null)}
        />
      )}
    </div>
  );
};
