import React, { useState } from 'react';
import { useBilling } from '../context/BillingContext';
import { CustomerSeller, Bill } from '../types/billing';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { PaymentCollectModal } from './PaymentCollectModal';
import {
  Users,
  Search,
  Plus,
  Receipt,
  Printer,
  CreditCard,
  Phone,
  MapPin,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface SellerLedgerViewProps {
  onStartBillForCustomer?: (customerId: string) => void;
}

export const SellerLedgerView: React.FC<SellerLedgerViewProps> = ({
  onStartBillForCustomer,
}) => {
  const {
    customers,
    getCustomerPendingBalance,
    getCustomerBills,
    setSelectedBillForReceipt,
    addNewCustomer,
  } = useBilling();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<Bill | null>(null);

  // New customer modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newType, setNewType] = useState<'buyer' | 'seller'>('buyer');
  const [newAddress, setNewAddress] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const customerBills = selectedCustomerId ? getCustomerBills(selectedCustomerId) : [];
  const customerTotalPending = selectedCustomerId
    ? getCustomerPendingBalance(selectedCustomerId)
    : 0;
  const customerTotalBilled = customerBills.reduce((sum, b) => sum + b.grandTotal, 0);
  const customerTotalPaid = customerBills.reduce((sum, b) => sum + b.paidAmount, 0);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const created = addNewCustomer({
      name: newName.trim(),
      phone: newPhone.trim(),
      type: newType,
      address: newAddress.trim(),
    });
    setSelectedCustomerId(created.id);
    setShowAddModal(false);
    setNewName('');
    setNewPhone('');
    setNewAddress('');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* If a customer is selected, show their full ledger statement */}
      {selectedCustomer ? (
        <div className="space-y-6">
          {/* Back button and profile banner */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All Sellers & Buyers</span>
              </button>

              {onStartBillForCustomer && (
                <button
                  onClick={() => onStartBillForCustomer(selectedCustomer.id)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Generate New Bill for {selectedCustomer.name}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2 border-t border-neutral-800">
              <div className="md:col-span-6">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  Khata & Ledger Account
                </span>
                <h2 className="text-xl font-extrabold text-neutral-100 flex items-center gap-2 mt-0.5">
                  <span>{selectedCustomer.name}</span>
                  <span className="text-xs px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded font-normal uppercase">
                    {selectedCustomer.type === 'seller' ? 'Poultry Farm Supplier' : 'Regular Buyer'}
                  </span>
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 mt-2">
                  {selectedCustomer.phone && (
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-neutral-500" />
                      {selectedCustomer.phone}
                    </span>
                  )}
                  {selectedCustomer.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                      {selectedCustomer.address}
                    </span>
                  )}
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="md:col-span-6 grid grid-cols-3 gap-2 font-mono text-center text-xs">
                <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                  <span className="text-[10px] font-sans text-neutral-400 block">Total Invoiced</span>
                  <span className="font-bold text-neutral-200">{formatCurrency(customerTotalBilled)}</span>
                </div>
                <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                  <span className="text-[10px] font-sans text-neutral-400 block">Total Cleared</span>
                  <span className="font-bold text-emerald-400">{formatCurrency(customerTotalPaid)}</span>
                </div>
                <div
                  className={`p-3 rounded-lg border ${
                    customerTotalPending > 0
                      ? 'bg-amber-950/40 border-amber-800/80 text-amber-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <span className="text-[10px] font-sans block font-semibold">Net Pending Due</span>
                  <span className="text-base font-extrabold">{formatCurrency(customerTotalPending)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Statement Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-neutral-100">
                Invoice & Payment Transaction History ({customerBills.length})
              </h3>
            </div>

            {customerBills.length === 0 ? (
              <div className="py-12 text-center text-neutral-500 text-xs">
                No bills recorded yet for this party.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-950/80 text-[11px] font-bold uppercase text-neutral-400 border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Counter Clerk</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4 text-right">Bill Total</th>
                      <th className="py-3 px-4 text-right">Paid</th>
                      <th className="py-3 px-4 text-right">Pending Balance</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/80">
                    {customerBills.map((b) => (
                      <tr key={b.id} className="hover:bg-neutral-850/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-neutral-100">
                          {b.billNumber}
                        </td>
                        <td className="py-3 px-4 text-[11px] text-neutral-400">
                          {formatDateTime(b.invoiceDate)}
                        </td>
                        <td className="py-3 px-4 text-neutral-300">{b.operatorName}</td>
                        <td className="py-3 px-4 text-neutral-400 max-w-xs truncate">
                          {b.items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-neutral-200">
                          {formatCurrency(b.grandTotal)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-emerald-400">
                          {formatCurrency(b.paidAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-extrabold text-amber-400">
                          {b.pendingAmount > 0 ? formatCurrency(b.pendingAmount) : '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              b.paymentStatus === 'PAID'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : b.paymentStatus === 'PARTIAL'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                : 'bg-red-950 text-red-400 border border-red-800'
                            }`}
                          >
                            {b.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            {b.pendingAmount > 0 && (
                              <button
                                onClick={() => setSelectedBillForPayment(b)}
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded text-xs font-bold transition-colors"
                                title="Collect next payment installment for this bill"
                              >
                                Pay
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedBillForReceipt(b)}
                              className="p-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors"
                              title="Print bill"
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
            )}
          </div>
        </div>
      ) : (
        /* Customer Directory View */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Seller & Buyer Ledger Directory
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Manage regular poultry farm suppliers and wholesale egg/chicken buyers with their running balances.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Party</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Search sellers or buyers by name / phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
              />
            </div>
            <span className="text-xs text-neutral-400 font-medium">
              {filteredCustomers.length} registered parties
            </span>
          </div>

          {/* Customers Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((cust) => {
              const pending = getCustomerPendingBalance(cust.id);
              const bCount = getCustomerBills(cust.id).length;

              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomerId(cust.id)}
                  className="p-5 bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-850 rounded-xl cursor-pointer transition-all duration-150 flex flex-col justify-between shadow-xs group"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 px-2 py-0.5 bg-neutral-950 rounded border border-neutral-800">
                        {cust.type === 'seller' ? 'Supplier' : 'Buyer'}
                      </span>
                      {pending > 0 ? (
                        <span className="text-xs font-mono font-extrabold text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          {formatCurrency(pending)} Due
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-medium text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Settled
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-neutral-100 mt-2.5 group-hover:text-amber-400 transition-colors">
                      {cust.name}
                    </h4>
                    <p className="text-xs text-neutral-400 font-mono mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-neutral-500" />
                      {cust.phone || 'No phone'}
                    </p>
                    {cust.address && (
                      <p className="text-[11px] text-neutral-500 truncate mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
                        {cust.address}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-neutral-800/80 flex justify-between items-center text-xs text-neutral-400">
                    <span>{bCount} total invoice{bCount === 1 ? '' : 's'}</span>
                    <span className="font-semibold text-neutral-200 group-hover:text-amber-400 flex items-center gap-1">
                      View Ledger <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Collect Payment Modal if triggered from ledger */}
      {selectedBillForPayment && (
        <PaymentCollectModal
          bill={selectedBillForPayment}
          onClose={() => setSelectedBillForPayment(null)}
          onSuccess={() => setSelectedBillForPayment(null)}
        />
      )}

      {/* New Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs no-print">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                Register New Party
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-100 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                  Business / Seller / Buyer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shalimar Biryani Center"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                    Phone / Mobile
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98000 00000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-neutral-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as 'buyer' | 'seller')}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-neutral-100"
                  >
                    <option value="buyer">Buyer (Customer/Retailer)</option>
                    <option value="seller">Seller (Poultry/Egg Farm Supplier)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-300 block mb-1">
                  Location / Mandi Stall (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shop 22, Meat Market"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-neutral-100"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-lg border border-neutral-800 text-xs font-semibold text-neutral-300 hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Save Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
