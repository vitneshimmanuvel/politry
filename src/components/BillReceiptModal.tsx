import React, { useState } from 'react';
import { useBilling } from '../context/BillingContext';
import { BillPaperSize, BillTemplateType } from '../types/billing';
import { ThermalReceipt } from './receipts/ThermalReceipt';
import { StandardInvoice } from './receipts/StandardInvoice';
import { WholesaleBilti } from './receipts/WholesaleBilti';
import { MinimalSlip } from './receipts/MinimalSlip';
import { PaymentCollectModal } from './PaymentCollectModal';
import { formatCurrency } from '../utils/formatters';
import {
  Printer,
  X,
  CreditCard,
  Share2,
  FileText,
  Sliders,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';

export const BillReceiptModal: React.FC = () => {
  const {
    selectedBillForReceipt,
    setSelectedBillForReceipt,
    billTemplate,
    setBillTemplate,
    billPaperSize,
    setBillPaperSize,
    billZoom,
    setBillZoom,
  } = useBilling();

  const [showCollectPayment, setShowCollectPayment] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!selectedBillForReceipt) return null;

  const bill = selectedBillForReceipt;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*GOLDEN FEATHER POULTRY & EGG TRADERS*\nInvoice: ${bill.billNumber}\nParty: ${bill.customerName}\nDate: ${new Date(bill.invoiceDate).toLocaleDateString()}\nTotal Amount: ${formatCurrency(bill.grandTotal)}\nPaid Amount: ${formatCurrency(bill.paidAmount)}\n*Pending Due: ${formatCurrency(bill.pendingAmount)}*\n\nPlease clear the pending balance via UPI: goldenfeather@upi\nThank you!`;
    const encoded = encodeURIComponent(text);
    const phone = bill.customerPhone ? bill.customerPhone.replace(/[^0-9]/g, '') : '';
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  // Determine width based on paper size
  const getContainerWidth = (size: BillPaperSize) => {
    switch (size) {
      case '58mm':
        return 'w-[230px]';
      case '80mm':
        return 'w-[340px]';
      case 'a5':
        return 'w-[520px]';
      case 'a4':
        return 'w-[740px]';
      default:
        return 'w-[340px]';
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xs no-print">
        <div className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden">
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-neutral-800 bg-neutral-950/80">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-[11px] font-mono text-neutral-400">INVOICE PREVIEW</span>
                <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                  <span>{bill.billNumber}</span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      bill.paymentStatus === 'PAID'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : bill.paymentStatus === 'PARTIAL'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-red-950 text-red-400 border border-red-800'
                    }`}
                  >
                    {bill.paymentStatus === 'PARTIAL'
                      ? `Partial (Due ${formatCurrency(bill.pendingAmount)})`
                      : bill.paymentStatus}
                  </span>
                </h3>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {bill.pendingAmount > 0 && (
                <button
                  onClick={() => setShowCollectPayment(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                  title="Record the next installment for this bill"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Collect Payment (Due {formatCurrency(bill.pendingAmount)})</span>
                </button>
              )}

              <button
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#131d36] hover:bg-[#1a2744] text-slate-200 text-xs font-medium rounded-lg transition-colors border border-[#243354]"
                title="Send WhatsApp invoice summary"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>

              <button
                onClick={() => setSelectedBillForReceipt(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Settings Ribbon: Templates & Bill Size Adjustment */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-[#131d36] border-b border-[#243354] text-xs">
            {/* Template Selector */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                Template:
              </span>
              <div className="flex bg-[#0b1120] p-1 rounded-lg border border-[#243354] gap-1">
                {(
                  [
                    { id: 'thermal', label: 'Thermal POS' },
                    { id: 'standard', label: 'Tax Invoice' },
                    { id: 'wholesale', label: 'Mandi Bilti' },
                    { id: 'minimal', label: 'Minimal' },
                  ] as { id: BillTemplateType; label: string }[]
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setBillTemplate(t.id)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      billTemplate === t.id
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bill Size Adjustment (Paper Size) */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                Bill Paper Size:
              </span>
              <div className="flex bg-[#0b1120] p-1 rounded-lg border border-[#243354] gap-1">
                {(
                  [
                    { id: '58mm', label: '58mm (2")' },
                    { id: '80mm', label: '80mm (3")' },
                    { id: 'a5', label: 'A5' },
                    { id: 'a4', label: 'A4' },
                  ] as { id: BillPaperSize; label: string }[]
                ).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setBillPaperSize(s.id)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      billPaperSize === s.id
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom / Scale adjustment */}
            <div className="hidden md:flex items-center gap-2 text-neutral-400 text-xs">
              <button
                onClick={() => setBillZoom(Math.max(70, billZoom - 10))}
                className="p-1 hover:text-neutral-200 hover:bg-neutral-800 rounded"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] w-9 text-center text-neutral-300">
                {billZoom}%
              </span>
              <button
                onClick={() => setBillZoom(Math.min(130, billZoom + 10))}
                className="p-1 hover:text-neutral-200 hover:bg-neutral-800 rounded"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setBillZoom(100)}
                className="p-1 text-[10px] text-neutral-400 hover:text-neutral-200"
                title="Reset zoom"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Preview Workspace Area */}
          <div className="flex-1 overflow-auto p-4 sm:p-8 bg-neutral-950 flex justify-center items-start">
            <div
              style={{ transform: `scale(${billZoom / 100})`, transformOrigin: 'top center' }}
              className={`transition-transform duration-150 ease-out printable-container ${getContainerWidth(
                billPaperSize
              )} shadow-2xl rounded-sm my-2 bg-white`}
            >
              {billTemplate === 'thermal' && <ThermalReceipt bill={bill} />}
              {billTemplate === 'standard' && <StandardInvoice bill={bill} />}
              {billTemplate === 'wholesale' && <WholesaleBilti bill={bill} />}
              {billTemplate === 'minimal' && <MinimalSlip bill={bill} />}
            </div>
          </div>

          {/* Quick Info Footer in Modal */}
          <div className="px-5 py-2.5 border-t border-neutral-800 bg-neutral-900/90 text-[11px] text-neutral-400 flex flex-wrap justify-between items-center gap-2">
            <div>
              <span>Party: <strong className="text-neutral-200">{bill.customerName}</strong></span>
              <span className="mx-2 text-neutral-600">·</span>
              <span>Total: <strong className="font-mono text-neutral-200">{formatCurrency(bill.grandTotal)}</strong></span>
              <span className="mx-2 text-neutral-600">·</span>
              <span>Paid: <strong className="font-mono text-emerald-400">{formatCurrency(bill.paidAmount)}</strong></span>
              {bill.pendingAmount > 0 && (
                <>
                  <span className="mx-2 text-neutral-600">·</span>
                  <span className="text-amber-400 font-bold">
                    Pending Due: <strong className="font-mono">{formatCurrency(bill.pendingAmount)}</strong>
                  </span>
                </>
              )}
            </div>
            <div className="text-neutral-500 text-[10px]">
              Paper preview: {billPaperSize.toUpperCase()} · Template: {billTemplate.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Collect Next Payment Modal if triggered */}
      {showCollectPayment && (
        <PaymentCollectModal
          bill={bill}
          onClose={() => setShowCollectPayment(false)}
        />
      )}
    </>
  );
};
