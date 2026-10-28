import React from 'react';
import { Bill } from '../../types/billing';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

interface WholesaleBiltiProps {
  bill: Bill;
}

export const WholesaleBilti: React.FC<WholesaleBiltiProps> = ({ bill }) => {
  return (
    <div className="font-mono text-neutral-900 bg-white p-5 sm:p-6 text-xs select-text border-2 border-neutral-900">
      {/* Mandi Challan Header */}
      <div className="text-center border-b-2 border-neutral-900 pb-3 mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-bold border border-neutral-900 px-1.5 py-0.5">
            WHOLESALE MANDI BILTI
          </span>
          <span className="text-sm font-extrabold">{bill.billNumber}</span>
          <span className="text-[10px] font-bold border border-neutral-900 px-1.5 py-0.5">
            POULTRY & EGG CHALAN
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-black tracking-widest uppercase">
          GOLDEN FEATHER POULTRY & EGG MANDI
        </h2>
        <p className="text-[10px] text-neutral-700">
          APMC Yard Stall 14 · Live Bird Weighbridge & Egg Commission Agent · Ph: +91 98000 12345
        </p>
      </div>

      {/* Dispatch & Party Info Grid */}
      <div className="grid grid-cols-2 gap-2 text-[11px] border border-neutral-900 p-2 mb-3 bg-neutral-50/50">
        <div>
          <p><span className="font-bold">PARTY:</span> <span className="font-bold uppercase text-neutral-950">{bill.customerName}</span></p>
          <p><span className="font-bold">PHONE:</span> {bill.customerPhone || 'N/A'}</p>
          <p><span className="font-bold">ADDRESS:</span> {bill.customerAddress || 'Local Mandi Dispatch'}</p>
        </div>
        <div className="text-right">
          <p><span className="font-bold">DATE/TIME:</span> {formatDateTime(bill.invoiceDate)}</p>
          <p><span className="font-bold">OPERATOR:</span> {bill.operatorName} ({bill.counterName})</p>
          <p><span className="font-bold">VEHICLE NO:</span> {bill.vehicleNumber || 'Tempo / Auto'}</p>
        </div>
      </div>

      {/* Wholesale Tare & Crate Weighing Table */}
      <div className="border border-neutral-900 mb-3">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead>
            <tr className="bg-neutral-900 text-white font-bold text-[10px] uppercase">
              <th className="py-1 px-1.5 border-r border-neutral-700">Particulars</th>
              <th className="py-1 px-1.5 border-r border-neutral-700 text-center">Crates</th>
              <th className="py-1 px-1.5 border-r border-neutral-700 text-center">Birds</th>
              <th className="py-1 px-1.5 border-r border-neutral-700 text-right">Gross Wt</th>
              <th className="py-1 px-1.5 border-r border-neutral-700 text-right">Tare Wt</th>
              <th className="py-1 px-1.5 border-r border-neutral-700 text-right font-extrabold">Net Qty</th>
              <th className="py-1 px-1.5 border-r border-neutral-700 text-right">Rate</th>
              <th className="py-1 px-1.5 text-right font-extrabold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-300">
            {bill.items.map((item, idx) => (
              <tr key={item.id || idx}>
                <td className="py-1.5 px-1.5 font-bold border-r border-neutral-300">
                  <div>{item.productName}</div>
                  {(item.eggSheetsCount || item.totalEggsCount) && (
                    <div className="text-[9px] text-neutral-800 font-normal">
                      Sheets: {item.eggSheetsCount} · Total: {item.totalEggsCount} eggs
                    </div>
                  )}
                </td>
                <td className="py-1.5 px-1.5 text-center border-r border-neutral-300">
                  {item.crateCount || '-'}
                </td>
                <td className="py-1.5 px-1.5 text-center border-r border-neutral-300">
                  {item.birdCount || '-'}
                </td>
                <td className="py-1.5 px-1.5 text-right border-r border-neutral-300">
                  {item.grossWeightKg ? `${item.grossWeightKg} kg` : '-'}
                </td>
                <td className="py-1.5 px-1.5 text-right border-r border-neutral-300">
                  {item.tareWeightKg ? `${item.tareWeightKg} kg` : '-'}
                </td>
                <td className="py-1.5 px-1.5 text-right font-bold border-r border-neutral-300">
                  {item.quantity} {item.unit}
                </td>
                <td className="py-1.5 px-1.5 text-right border-r border-neutral-300">
                  ₹{item.unitPrice}
                </td>
                <td className="py-1.5 px-1.5 text-right font-bold">
                  {formatCurrency(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bill Khata Ledger & Settlement Section */}
      <div className="grid grid-cols-2 gap-4 border border-neutral-900 p-2.5 mb-3 bg-neutral-50/70">
        {/* Payment History Inside This Bill */}
        <div>
          <span className="font-bold text-[10px] uppercase block border-b border-neutral-400 pb-1 mb-1">
            Bill Payment Collection Records:
          </span>
          {bill.payments.length === 0 ? (
            <p className="text-[10px] text-red-700 font-bold">
              [ 0.00 PAID — TOTAL AMOUNT RECORDED ON CREDIT ]
            </p>
          ) : (
            <div className="space-y-1 text-[10px]">
              {bill.payments.map((p, i) => (
                <div key={p.id || i} className="flex justify-between border-b border-neutral-200 pb-0.5">
                  <span>
                    #{i + 1} {formatDateTime(p.date).split(',')[0]} ({p.paymentMethod})
                  </span>
                  <span className="font-bold">{formatCurrency(p.amount)}</span>
                </div>
              ))}
            </div>
          )}
          {bill.notes && (
            <p className="text-[10px] italic text-neutral-600 mt-2">
              Challan Remarks: {bill.notes}
            </p>
          )}
        </div>

        {/* Ledger Summary */}
        <div className="text-right text-[11px] space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(bill.subtotal)}</span>
          </div>
          {bill.transportOrCrateFee > 0 && (
            <div className="flex justify-between text-neutral-700">
              <span>Freight / Crate Handling:</span>
              <span>+{formatCurrency(bill.transportOrCrateFee)}</span>
            </div>
          )}
          {bill.discountTotal > 0 && (
            <div className="flex justify-between text-neutral-700">
              <span>Discount / Mortality Rebate:</span>
              <span>-{formatCurrency(bill.discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-sm border-t border-neutral-900 pt-1">
            <span>CHALLAN TOTAL:</span>
            <span>{formatCurrency(bill.grandTotal)}</span>
          </div>
          <div className="flex justify-between font-bold text-emerald-800">
            <span>Received Amount:</span>
            <span>{formatCurrency(bill.paidAmount)}</span>
          </div>
          <div className="flex justify-between font-black text-sm border-t-2 border-dashed border-neutral-900 pt-1 text-red-900">
            <span>BALANCE DUE:</span>
            <span>{formatCurrency(bill.pendingAmount)}</span>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-3 gap-4 text-center text-[10px] pt-4 mt-2">
        <div>
          <div className="h-8 border-b border-neutral-400"></div>
          <p className="mt-1 font-bold">Driver / Receiver</p>
        </div>
        <div>
          <div className="h-8 border-b border-neutral-400"></div>
          <p className="mt-1 font-bold">Weighbridge Clerk</p>
        </div>
        <div>
          <div className="h-8 border-b border-neutral-400"></div>
          <p className="mt-1 font-bold">Mandi Munshi / Seller</p>
        </div>
      </div>
    </div>
  );
};
