import React from 'react';
import { Bill } from '../../types/billing';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

interface StandardInvoiceProps {
  bill: Bill;
}

export const StandardInvoice: React.FC<StandardInvoiceProps> = ({ bill }) => {
  return (
    <div className="font-sans text-neutral-900 bg-white p-6 sm:p-8 text-xs select-text leading-normal">
      {/* Top Banner */}
      <div className="flex justify-between items-start border-b-2 border-neutral-900 pb-4 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-950 uppercase">
            GOLDEN FEATHER TRADERS
          </h1>
          <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
            Wholesale Eggs & Fresh Chicken Mandi Distributor
          </p>
          <p className="text-[11px] text-neutral-500 mt-1 max-w-sm">
            Plot 12, APMC Poultry Yard, Gate #2, Ring Road Mandi<br />
            GSTIN: 27AABCG1290K1Z5 · Phone: +91 98000 12345 · Email: accounts@goldenfeather.in
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block bg-neutral-900 text-white font-bold text-xs uppercase px-3 py-1 rounded">
            TAX INVOICE
          </span>
          <p className="text-sm font-bold text-neutral-900 mt-2 font-mono">
            {bill.billNumber}
          </p>
          <p className="text-[11px] text-neutral-600">
            Date: {formatDateTime(bill.invoiceDate)}
          </p>
          <p className="text-[11px] text-neutral-600">
            Billed By: <span className="font-medium text-neutral-900">{bill.operatorName}</span>
          </p>
        </div>
      </div>

      {/* Parties Info */}
      <div className="grid grid-cols-2 gap-4 p-3 bg-neutral-50 rounded border border-neutral-200 mb-5">
        <div>
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
            {bill.customerType === 'seller' ? 'SELLER / SUPPLIER DETAILS' : 'BILLED TO (BUYER / CUSTOMER)'}
          </span>
          <p className="text-sm font-bold text-neutral-950">{bill.customerName}</p>
          {bill.customerPhone && (
            <p className="text-xs text-neutral-700">Phone: {bill.customerPhone}</p>
          )}
          {bill.customerAddress && (
            <p className="text-[11px] text-neutral-600 mt-0.5">{bill.customerAddress}</p>
          )}
        </div>
        <div className="text-right flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
              DISPATCH & COUNTER INFO
            </span>
            <p className="text-xs text-neutral-800">
              Counter: <span className="font-semibold">{bill.counterName}</span>
            </p>
            {bill.vehicleNumber && (
              <p className="text-xs text-neutral-700">Vehicle No: <span className="font-mono font-medium">{bill.vehicleNumber}</span></p>
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-500 uppercase">Payment Status:</span>{' '}
            <span
              className={`inline-block font-bold text-xs uppercase px-2 py-0.5 rounded ${
                bill.paymentStatus === 'PAID'
                  ? 'bg-emerald-100 text-emerald-800'
                  : bill.paymentStatus === 'PARTIAL'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}
            >
              {bill.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-left border-collapse mb-5">
        <thead>
          <tr className="border-b-2 border-neutral-900 text-[11px] font-bold uppercase text-neutral-700 bg-neutral-100">
            <th className="py-2 px-2 w-10 text-center">#</th>
            <th className="py-2 px-2">Description of Goods</th>
            <th className="py-2 px-2 text-right">Qty</th>
            <th className="py-2 px-2 text-center">Unit</th>
            <th className="py-2 px-2 text-right">Rate (₹)</th>
            <th className="py-2 px-2 text-right">Amount (₹)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {bill.items.map((item, idx) => (
            <tr key={item.id || idx} className="hover:bg-neutral-50/50">
              <td className="py-2.5 px-2 text-center text-neutral-500 font-mono">{idx + 1}</td>
              <td className="py-2.5 px-2">
                <span className="font-semibold text-neutral-950 block">{item.productName}</span>
                {(item.eggSheetsCount || item.totalEggsCount) && (
                  <span className="text-[10px] text-neutral-800 block font-mono font-medium">
                    {item.eggSheetsCount ? `Sheets Given: ${item.eggSheetsCount} sheets · ` : ''}
                    {item.totalEggsCount ? `Total Count: ${item.totalEggsCount} eggs` : ''}
                    {item.eggsPerSheet ? ` (${item.eggsPerSheet} eggs/sheet)` : ''}
                  </span>
                )}
                {(item.grossWeightKg || item.tareWeightKg || item.birdCount) && (
                  <span className="text-[10px] text-neutral-500 block font-mono">
                    {item.birdCount ? `${item.birdCount} birds · ` : ''}
                    {item.grossWeightKg ? `Gross: ${item.grossWeightKg}kg - Tare: ${item.tareWeightKg}kg = ` : ''}
                    Net: {item.quantity}kg
                  </span>
                )}
              </td>
              <td className="py-2.5 px-2 text-right font-mono font-medium">{item.quantity}</td>
              <td className="py-2.5 px-2 text-center text-neutral-600 uppercase text-[10px]">{item.unit}</td>
              <td className="py-2.5 px-2 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
              <td className="py-2.5 px-2 text-right font-mono font-bold text-neutral-950">
                {formatCurrency(item.subtotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals & Payment Reconcile Split */}
      <div className="grid grid-cols-12 gap-6 pt-2 border-t-2 border-neutral-200">
        {/* Left Side: Payment Installment Audit Log & Bank Details */}
        <div className="col-span-7 space-y-3">
          <div className="bg-neutral-50 p-3 rounded border border-neutral-200">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-800 mb-1.5 flex justify-between">
              <span>Payment Installment Ledger (Same Bill)</span>
              <span className="text-neutral-500 font-normal">
                {bill.payments.length} installment{bill.payments.length === 1 ? '' : 's'} recorded
              </span>
            </h4>
            {bill.payments.length === 0 ? (
              <p className="text-[11px] text-neutral-500 italic py-1">
                No payments collected yet. Balance remains pending.
              </p>
            ) : (
              <div className="space-y-1.5">
                {bill.payments.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="flex justify-between items-center text-[11px] pb-1 border-b border-neutral-200 last:border-b-0"
                  >
                    <div>
                      <span className="font-semibold text-neutral-900">
                        #{idx + 1}. {formatDateTime(p.date)}
                      </span>
                      <span className="text-neutral-600 ml-1.5 text-[10px] uppercase">
                        ({p.paymentMethod})
                      </span>
                      {p.referenceNumber && (
                        <span className="text-neutral-500 text-[10px] block">
                          Ref: {p.referenceNumber}
                        </span>
                      )}
                    </div>
                    <span className="font-bold font-mono text-emerald-800">
                      {formatCurrency(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-[10px] text-neutral-500 space-y-0.5">
            <p className="font-bold text-neutral-700">Bank Transfer / UPI Details:</p>
            <p>Account: Golden Feather Poultry · A/C: 50200049281901 · IFSC: HDFC0001892</p>
            <p>UPI VPA: goldenfeather@upi (Scan QR on POS or transfer via PhonePe/GPay)</p>
          </div>
        </div>

        {/* Right Side: Totals Summary */}
        <div className="col-span-5 space-y-1.5 text-xs font-mono">
          <div className="flex justify-between py-1 text-neutral-600">
            <span>Subtotal:</span>
            <span>{formatCurrency(bill.subtotal)}</span>
          </div>
          {bill.discountTotal > 0 && (
            <div className="flex justify-between py-1 text-neutral-600">
              <span>Discount:</span>
              <span>- {formatCurrency(bill.discountTotal)}</span>
            </div>
          )}
          {bill.transportOrCrateFee > 0 && (
            <div className="flex justify-between py-1 text-neutral-600">
              <span>Transport/Crate:</span>
              <span>+ {formatCurrency(bill.transportOrCrateFee)}</span>
            </div>
          )}
          {bill.roundOff !== 0 && (
            <div className="flex justify-between py-1 text-neutral-500 text-[11px]">
              <span>Round Off:</span>
              <span>{bill.roundOff > 0 ? `+${bill.roundOff}` : bill.roundOff}</span>
            </div>
          )}

          <div className="flex justify-between py-2 border-t-2 border-neutral-900 font-extrabold text-sm text-neutral-950">
            <span>INVOICE TOTAL:</span>
            <span>{formatCurrency(bill.grandTotal)}</span>
          </div>

          <div className="flex justify-between py-1 text-emerald-700 font-semibold">
            <span>Total Paid:</span>
            <span>{formatCurrency(bill.paidAmount)}</span>
          </div>

          <div className="flex justify-between py-1.5 px-2 bg-amber-50 border border-amber-300 rounded font-bold text-amber-950 text-xs">
            <span>PENDING DUE:</span>
            <span>{formatCurrency(bill.pendingAmount)}</span>
          </div>
        </div>
      </div>

      {/* Signature & Disclaimer */}
      <div className="mt-8 pt-4 border-t border-neutral-300 flex justify-between items-end text-[10px] text-neutral-500">
        <div>
          <p className="font-semibold text-neutral-700">Terms & Conditions:</p>
          <p>1. Weight & count must be verified at the time of delivery/dispatch.</p>
          <p>2. Crates must be returned within 48 hours or deposit charged.</p>
          <p>3. Subject to local mandi jurisdiction.</p>
        </div>
        <div className="text-center w-48">
          <div className="h-12 border-b border-neutral-400"></div>
          <p className="font-bold text-neutral-800 mt-1 uppercase">Authorized Signatory</p>
          <p className="text-[9px]">For Golden Feather Traders</p>
        </div>
      </div>
    </div>
  );
};
