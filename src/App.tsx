import React, { useState, useEffect } from 'react';
import { BillingProvider, useBilling } from './context/BillingContext';
import { Header, ActiveTab } from './components/Header';
import { POSBillingView } from './components/POSBillingView';
import { PendingBillsView } from './components/PendingBillsView';
import { FinishedBillsView } from './components/FinishedBillsView';
import { SellerLedgerView } from './components/SellerLedgerView';
import { AdminPanel } from './components/AdminPanel';
import { BillReceiptModal } from './components/BillReceiptModal';
import {
  Receipt,
  Clock,
  CheckCircle,
  Users,
  ShieldCheck,
} from 'lucide-react';

function AppContent() {
  const { currentOperator } = useBilling();
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  const isAdmin = currentOperator.role === 'admin';

  // If role is changed to non-admin while on an admin tab, reset to 'pos'
  useEffect(() => {
    if (!isAdmin && (activeTab === 'admin' || activeTab === 'ledgers')) {
      setActiveTab('pos');
    }
  }, [isAdmin, activeTab]);

  return (
    <div className="min-h-screen bg-[#0c0e12] text-neutral-100 flex flex-col font-sans">
      {/* Top Bar matching contract */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Viewport */}
      <main className="flex-1 pb-16 md:pb-8">
        {activeTab === 'pos' && <POSBillingView />}
        {activeTab === 'pending' && <PendingBillsView />}
        {activeTab === 'finished' && <FinishedBillsView />}
        {isAdmin && activeTab === 'ledgers' && (
          <SellerLedgerView
            onStartBillForCustomer={() => {
              setActiveTab('pos');
            }}
          />
        )}
        {isAdmin && activeTab === 'admin' && <AdminPanel />}
      </main>

      {/* Receipt Preview & Print Studio Modal */}
      <BillReceiptModal />

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-3 py-2 z-30 no-print flex justify-around items-center">
        <button
          onClick={() => setActiveTab('pos')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'pos' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Create Bill</span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'pending' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending</span>
        </button>

        <button
          onClick={() => setActiveTab('finished')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            activeTab === 'finished' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Settled</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('ledgers')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
              activeTab === 'ledgers' ? 'text-blue-400' : 'text-slate-400'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Ledgers</span>
          </button>
        )}

        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
              activeTab === 'admin' ? 'text-blue-400' : 'text-slate-400'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin</span>
          </button>
        )}
      </div>

      {/* Quiet Footer */}
      <footer className="no-print border-t border-neutral-800/80 py-4 px-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 FeatherBill POS · Commercial Poultry & Egg Trading System</p>
          <p className="text-[11px] text-neutral-600 font-mono">
            Support: Thermal 58mm / 80mm · Mandi Bilti · A4 / A5 Invoicing · Dual Operator Ledger
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BillingProvider>
      <AppContent />
    </BillingProvider>
  );
}
