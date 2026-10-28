import React from 'react';
import { Bill } from '../../types/billing';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

interface ThermalReceiptProps {
  bill: Bill;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ bill }) => {
  return (
    <div className="font-mono text-black bg-white p-3 sm:p-4 leading-tight select-text text-[11px] sm:text-xs">
      {/* Header */}
      <div className="text-center pb-2 border-b border-dashed border-neutral-400">
        <h2 className="text-sm sm:text-base font-bold tracking-wider uppercase">
          GOLDEN FEATHER
        </h2>
        <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-800 uppercase tracking-wide">
          POULTRY & EGG TRADERS
        </p>
        <p className="text-[9px] sm:text-[10px] text-neutral-600 mt-0.5">
          Wholesale Mandi Gate #2, Market Yard
        </p>
        <p className="text-[9px] sm:text-[10px] text-neutral-600">
          Phone: +91 98000 12345 · GSTIN: 27AABCG1290K1Z5
        </p>
      </div>

      {/* Bill Meta */}
      <div className="py-2 border-b border-dashed border-neutral-400 space-y-0.5 text-[10px] sm:text-[11px]">
        <div className="flex justify-between">
          <span className="font-bold">INVOICE:</span>
          <span className="font-bold">{bill.billNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{formatDateTime(bill.invoiceDate)}</span>
        </div>
        <div className="flex justify-between">
          <span>Counter / User:</span>
          <span>{bill.operatorName}</span>
        </div>
        <div className="flex justify-between font-medium pt-1">
          <span>Seller/Buyer:</span>
          <span className="text-right truncate max-w-[160px] font-bold">
            {bill.customerName}
          </span>
        </div>
        {bill.customerPhone && (
          <div className="flex justify-between text-[9px] text-neutral-600">
            <span>Phone:</span>
            <span>{bill.customerPhone}</span>
          </div>
        )}
        {bill.vehicleNumber && (
          <div className="flex justify-between text-[9px] text-neutral-600">
            <span>Vehicle:</span>
            <span>{bill.vehicleNumber}</span>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="py-2 border-b border-dashed border-neutral-400">
        <div className="grid grid-cols-12 font-bold text-[10px] pb-1 border-b border-neutral-300">
          <span className="col-span-6">ITEM</span>
          <span className="col-span-3 text-right">QTY/RATE</span>
          <span className="col-span-3 text-right">AMOUNT</span>
        </div>

        <div className="divide-y divide-neutral-100 py-1">
          {bill.items.map((item, idx) => (
            <div key={item.id || idx} className="py-1">
              <div className="grid grid-cols-12 font-medium">
                <span className="col-span-6 font-semibold">{item.productName}</span>
                <span className="col-span-3 text-right text-[10px]">
                  {item.quantity} {item.unit} @ ₹{item.unitPrice}
                </span>
                <span className="col-span-3 text-right font-bold">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
              {/* Egg Sheets & Total count specs */}
              {(item.eggSheetsCount || item.totalEggsCount) && (
                <div className="text-[9px] text-neutral-800 pl-1 font-semibold">
                  {item.eggSheetsCount ? `Sheets Given: ${item.eggSheetsCount} sheets · ` : ''}
                  {item.totalEggsCount ? `Total Count: ${item.totalEggsCount} eggs` : ''}
                  {item.eggsPerSheet ? ` (${item.eggsPerSheet} eggs/sheet)` : ''}
                </div>
              )}
              {/* Chicken Tare specs if live bird */}
              {(item.grossWeightKg || item.tareWeightKg || item.birdCount) && (
                <div className="text-[9px] text-neutral-600 pl-1">
                  {item.birdCount ? `${item.birdCount} birds · ` : ''}
                  {item.grossWeightKg ? `Gross: ${item.grossWeightKg}kg - ` : ''}
                  {item.tareWeightKg ? `Tare: ${item.tareWeightKg}kg = ` : ''}
                  <span className="font-bold text-neutral-900">Net: {item.quantity}kg</span>
                  {item.crateCount ? ` (${item.crateCount} crates)` : ''}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Financials */}
      <div className="py-2 border-b border-dashed border-neutral-400 space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span>Items Subtotal:</span>
          <span>{formatCurrency(bill.subtotal)}</span>
        </div>
        {bill.discountTotal > 0 && (
          <div className="flex justify-between text-neutral-600">
            <span>Discount:</span>
            <span>- {formatCurrency(bill.discountTotal)}</span>
          </div>
        )}
        {bill.transportOrCrateFee > 0 && (
          <div className="flex justify-between text-neutral-600">
            <span>Transport/Crate:</span>
            <span>+ {formatCurrency(bill.transportOrCrateFee)}</span>
          </div>
        )}
        {bill.roundOff !== 0 && (
          <div className="flex justify-between text-neutral-500 text-[10px]">
            <span>Round off:</span>
            <span>{bill.roundOff > 0 ? `+${bill.roundOff}` : bill.roundOff}</span>
          </div>
        )}
        <div className="flex justify-between text-sm sm:text-base font-extrabold pt-1 border-t border-neutral-400">
          <span>BILL TOTAL:</span>
          <span>{formatCurrency(bill.grandTotal)}</span>
        </div>
      </div>

      {/* Payments & Pending Breakdown (Key Feature) */}
      <div className="py-2 border-b border-dashed border-neutral-400 space-y-1.5">
        <div className="flex justify-between font-bold text-[11px] sm:text-xs">
          <span>Amount Paid:</span>
          <span className="text-emerald-800">{formatCurrency(bill.paidAmount)}</span>
        </div>
        <div className="flex justify-between font-extrabold text-xs sm:text-sm">
          <span>PENDING BALANCE:</span>
          <span className={bill.pendingAmount > 0 ? 'text-amber-900 underline' : 'text-emerald-700'}>
            {formatCurrency(bill.pendingAmount)}
          </span>
        </div>

        {/* Status Stamp */}
        <div className="text-center my-2 py-1 px-2 border-2 border-black font-extrabold uppercase tracking-widest text-[11px]">
          {bill.paymentStatus === 'PAID'
            ? '✓ FULLY PAID / SETTLED'
            : bill.paymentStatus === 'PARTIAL'
            ? `⚠ PARTIAL PAYMENT (DUE: ${formatCurrency(bill.pendingAmount)})`
            : 'CREDIT / PAYMENT PENDING'}
        </div>

        {/* Payment History Log in the same bill */}
        {bill.payments.length > 0 && (
          <div className="pt-1 text-[9px] sm:text-[10px]">
            <p className="font-bold text-neutral-700 uppercase mb-1">
              Payment Installment History ({bill.payments.length}):
            </p>
            <div className="space-y-1 bg-neutral-50 p-1.5 rounded border border-neutral-200">
              {bill.payments.map((p, idx) => (
                <div key={p.id || idx} className="flex justify-between items-start border-b border-neutral-200 last:border-b-0 pb-1 last:pb-0">
                  <div>
                    <span className="font-bold text-neutral-900">
                      #{idx + 1}. {formatDateTime(p.date)}
                    </span>
                    <span className="text-neutral-600 block uppercase">
                      {p.paymentMethod} {p.referenceNumber ? `· Ref: ${p.referenceNumber}` : ''}
                    </span>
                    {p.note && <span className="text-neutral-500 italic block">{p.note}</span>}
                  </div>
                  <span className="font-bold text-neutral-900 shrink-0 ml-2">
                    {formatCurrency(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QR Code Placeholder & Footer */}
      <div className="pt-2 text-center text-[9px] space-y-1 text-neutral-600">
        {bill.pendingAmount > 0 && (
          <div className="p-2 border border-dashed border-neutral-300 rounded mx-auto max-w-[160px] my-1">
            <div className="w-20 h-20 bg-neutral-100 mx-auto border border-neutral-300 flex items-center justify-center text-center p-1 text-[8px] font-bold">
              [ SCAN & PAY UPI QR: ₹{bill.pendingAmount} ]
            </div>
            <p className="font-bold text-black mt-1">UPI: goldenfeather@upi</p>
          </div>
        )}
        <p className="font-medium text-black">
          {bill.notes ? `Note: ${bill.notes}` : 'Thank you for your business!'}
        </p>
        <p className="text-[8px] text-neutral-500">
          Fresh Poultry & Quality Eggs Guaranteed · No Returns after dispatch
        </p>
        <p className="text-[8px] font-bold text-neutral-400">
          *** FEATHERBILL POS SYSTEM ***
        </p>
      </div>
    </div>
  );
};
