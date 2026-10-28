import React, { useState } from 'react';
import { Bill, PaymentMethod } from '../types/billing';
import { useBilling } from '../context/BillingContext';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { CheckCircle2, DollarSign, X } from 'lucide-react';

interface PaymentCollectModalProps {
  bill: Bill | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PaymentCollectModal: React.FC<PaymentCollectModalProps> = ({
  bill,
  onClose,
  onSuccess,
}) => {
  const { addPaymentToBill, currentOperator } = useBilling();

  const [paymentAmount, setPaymentAmount] = useState<number>(() => {
    return bill ? bill.pendingAmount : 0;
  });
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!bill) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) return;

    addPaymentToBill(
      bill.id,
      Number(paymentAmount),
      method,
      note || `Next installment on ${bill.billNumber}`,
      reference || undefined
    );

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 600);
  };

  const handleQuickAmount = (ratio: number) => {
    const val = Math.round(bill.pendingAmount * ratio);
    setPaymentAmount(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs no-print">
      <div className="relative w-full max-w-lg bg-[#131d36] border border-[#243354] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#243354] bg-[#0b1120]">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              Collect Payment for Bill {bill.billNumber}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Party: <span className="font-semibold text-white">{bill.customerName}</span> · Billed by {bill.operatorName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status card */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-3 p-3 bg-[#0b1120] rounded-lg border border-[#243354] text-center font-mono">
            <div>
              <span className="text-[11px] font-sans text-slate-400 block">Total Bill</span>
              <span className="text-sm font-bold text-white">{formatCurrency(bill.grandTotal)}</span>
            </div>
            <div>
              <span className="text-[11px] font-sans text-slate-400 block">Already Paid</span>
              <span className="text-sm font-bold text-emerald-400">{formatCurrency(bill.paidAmount)}</span>
            </div>
            <div>
              <span className="text-[11px] font-sans text-blue-300 block font-semibold">Pending Due</span>
              <span className="text-base font-extrabold text-blue-400">{formatCurrency(bill.pendingAmount)}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  Payment Amount to Collect (₹)
                </label>
                <div className="flex gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(1)}
                    className="px-2 py-0.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded border border-blue-500/40 transition-colors font-bold"
                  >
                    Full Due ({formatCurrency(bill.pendingAmount)})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(0.5)}
                    className="px-2 py-0.5 bg-[#0b1120] hover:bg-slate-800 text-slate-300 rounded transition-colors border border-[#243354]"
                  >
                    50%
                  </button>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold font-mono">₹</span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  max={bill.pendingAmount}
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  required
                  className="w-full pl-8 pr-4 py-2 bg-[#0b1120] border border-blue-500 rounded-lg text-lg font-bold font-mono text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Remaining due after this payment:{' '}
                <span className="font-mono font-bold text-white">
                  {formatCurrency(Math.max(0, bill.pendingAmount - (paymentAmount || 0)))}
                </span>
              </p>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Payment Mode
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['cash', 'upi', 'bank_transfer', 'cheque'] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                      method === m
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold shadow-xs'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                    }`}
                  >
                    {m === 'cash' ? '💵 Cash' : m === 'upi' ? '📱 UPI / QR' : m === 'bank_transfer' ? '🏦 Bank NEFT' : '📜 Cheque'}
                  </button>
                ))}
              </div>
            </div>

            {/* Ref Number & Note */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-400 block mb-1">
                  Reference / Txn ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI/6291/GPay"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-400 block mb-1">
                  Note / Remarks (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2nd installment at counter"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
                />
              </div>
            </div>

            <div className="text-[11px] text-neutral-500 pt-1">
              Collector: <span className="text-neutral-300 font-semibold">{currentOperator.name}</span> ({currentOperator.counter})
            </div>

            {/* Existing Payments in this same bill */}
            {bill.payments.length > 0 && (
              <div className="pt-2 border-t border-neutral-800">
                <span className="text-[11px] font-semibold text-neutral-400 block mb-1">
                  Previous Payments on this Bill ({bill.payments.length}):
                </span>
                <div className="max-h-24 overflow-y-auto space-y-1 text-[11px] font-mono text-neutral-400">
                  {bill.payments.map((p, idx) => (
                    <div key={p.id || idx} className="flex justify-between py-0.5 bg-neutral-950/40 px-2 rounded">
                      <span>#{idx + 1}. {formatDateTime(p.date).split(',')[0]} ({p.paymentMethod})</span>
                      <span className="font-bold text-neutral-200">{formatCurrency(p.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 rounded-lg border border-neutral-800 text-neutral-300 hover:bg-neutral-800 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={paymentAmount <= 0 || isSubmitted}
                className="flex-1 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                {isSubmitted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 animate-bounce" />
                    Payment Recorded!
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4" />
                    Apply {formatCurrency(paymentAmount || 0)} to Bill
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
