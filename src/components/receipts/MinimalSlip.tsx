import React from 'react';
import { Bill } from '../../types/billing';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

interface MinimalSlipProps {
  bill: Bill;
}

export const MinimalSlip: React.FC<MinimalSlipProps> = ({ bill }) => {
  return (
    <div className="font-mono text-neutral-900 bg-white p-3 text-[11px] select-text">
      <div className="text-center border-b border-neutral-300 pb-1.5 mb-2">
        <h3 className="font-bold text-xs uppercase tracking-wide">GOLDEN FEATHER TRADERS</h3>
        <p className="text-[10px] text-neutral-600">SLIP: {bill.billNumber} · {formatDateTime(bill.invoiceDate)}</p>
        <p className="text-[10px] font-semibold text-neutral-800">
          Party: {bill.customerName} {bill.customerPhone ? `(${bill.customerPhone})` : ''}
        </p>
      </div>

      <div className="space-y-1 mb-2 border-b border-neutral-300 pb-2">
        {bill.items.map((item, idx) => (
          <div key={item.id || idx} className="flex justify-between items-baseline">
            <span className="truncate pr-2 font-medium">
              {item.productName} ({item.quantity} {item.unit})
            </span>
            <span className="font-bold font-mono shrink-0">
              {formatCurrency(item.subtotal)}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-0.5 text-[11px] mb-2 font-mono">
        <div className="flex justify-between font-bold text-xs">
          <span>TOTAL:</span>
          <span>{formatCurrency(bill.grandTotal)}</span>
        </div>
        <div className="flex justify-between text-neutral-700">
          <span>PAID:</span>
          <span>{formatCurrency(bill.paidAmount)}</span>
        </div>
        <div className="flex justify-between font-bold text-amber-900 border-t border-dotted border-neutral-400 pt-0.5">
          <span>PENDING:</span>
          <span>{formatCurrency(bill.pendingAmount)}</span>
        </div>
      </div>

      {bill.payments.length > 0 && (
        <div className="text-[9px] text-neutral-600 border-t border-neutral-200 pt-1">
          <span>Payments: </span>
          {bill.payments.map((p, i) => (
            <span key={p.id || i} className="mr-1.5">
              [#{i + 1}: ₹{p.amount} ({p.paymentMethod})]
            </span>
          ))}
        </div>
      )}

      <div className="text-center text-[9px] text-neutral-400 pt-1.5">
        Billed by {bill.operatorName} · Thank you
      </div>
    </div>
  );
};
