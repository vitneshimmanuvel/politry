import React, { useState, useRef, useEffect } from 'react';
import { useBilling } from '../context/BillingContext';
import { formatCurrency } from '../utils/formatters';
import { ChevronDown, User, ShieldCheck } from 'lucide-react';

export type ActiveTab = 'pos' | 'pending' | 'finished' | 'ledgers' | 'admin';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentOperator,
    currentOperatorId,
    setCurrentOperatorId,
    operators,
    bills,
  } = useBilling();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute pending count based on whether active operator is Admin or regular user
  const userPendingCount = bills.filter((b) => {
    const isPending = b.paymentStatus !== 'PAID' && b.pendingAmount > 0;
    if (currentOperator.role === 'admin') return isPending;
    return isPending && b.operatorId === currentOperator.id;
  }).length;

  const isAdmin = currentOperator.role === 'admin';

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-neutral-900 border-b border-neutral-800 no-print sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setActiveTab('pos')}
          className="text-lg font-bold tracking-tight text-white hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-sm border border-blue-500/30">
            FB
          </span>
          <span>FeatherBill POS</span>
        </button>
      </div>

      {/* Zone 2: 3-5 concise single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
        <button
          onClick={() => setActiveTab('pos')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
            activeTab === 'pos'
              ? 'text-blue-400 border-b-2 border-blue-500 font-bold'
              : ''
          }`}
        >
          Create Bill
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
            activeTab === 'pending'
              ? 'text-blue-400 border-b-2 border-blue-500 font-bold'
              : ''
          }`}
        >
          <span>{isAdmin ? 'All Pending Bills' : 'My Pending Bills'}</span>
          {userPendingCount > 0 && (
            <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded text-[10px] font-mono font-bold border border-blue-500/30">
              {userPendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('finished')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
            activeTab === 'finished'
              ? 'text-blue-400 border-b-2 border-blue-500 font-bold'
              : ''
          }`}
        >
          {isAdmin ? 'All Settled Bills' : 'My Settled Bills'}
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('ledgers')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'ledgers'
                ? 'text-blue-400 border-b-2 border-blue-500 font-bold'
                : ''
            }`}
          >
            Seller & Buyer Ledgers
          </button>
        )}

        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1 ${
              activeTab === 'admin'
                ? 'text-blue-400 border-b-2 border-blue-500 font-bold'
                : ''
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Panel</span>
          </button>
        )}
      </nav>

      {/* Zone 3: 1 primary action - Active Operator Switcher */}
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-200 transition-colors whitespace-nowrap shrink-0"
        >
          <span
            className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-[11px] font-bold ${currentOperator.avatarColor}`}
          >
            {currentOperator.name.charAt(0)}
          </span>
          <div className="text-left hidden sm:block">
            <span className="block font-semibold leading-tight text-neutral-100">
              {currentOperator.name}
            </span>
            <span className="block text-[10px] text-neutral-400 leading-tight">
              {currentOperator.role === 'admin' ? 'Store Admin' : currentOperator.counter.split('(')[0]}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
        </button>

        {/* Dropdown Menu to Switch Operators */}
        {isUserMenuOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-1.5 border-b border-neutral-800">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                Switch Active Operator
              </span>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Bills generated will be tagged to the active user.
              </p>
            </div>

            <div className="p-1 space-y-1">
              {operators.map((op) => (
                <button
                  key={op.id}
                  onClick={() => {
                    setCurrentOperatorId(op.id);
                    if (op.role !== 'admin' && (activeTab === 'admin' || activeTab === 'ledgers')) {
                      setActiveTab('pos');
                    }
                    setIsUserMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                    currentOperatorId === op.id
                      ? 'bg-neutral-800/90 text-white'
                      : 'hover:bg-neutral-800/50 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold ${op.avatarColor}`}
                    >
                      {op.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-neutral-100">{op.name}</p>
                      <p className="text-[10px] text-neutral-400">{op.counter}</p>
                    </div>
                  </div>
                  {currentOperatorId === op.id && (
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  )}
                </button>
              ))}
            </div>

            <div className="px-3 pt-2 mt-1 border-t border-neutral-800 flex justify-between items-center text-[10px] text-neutral-400">
              <span>Current Role:</span>
              <span className="font-semibold text-neutral-300 uppercase">
                {currentOperator.role}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
