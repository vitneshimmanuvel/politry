import React, { useState, useMemo } from 'react';
import { useBilling } from '../context/BillingContext';
import {
  Bill,
  BillItem,
  BillPaperSize,
  BillTemplateType,
  CustomerSeller,
  ProductItem,
} from '../types/billing';
import { formatCurrency } from '../utils/formatters';
import { ThermalReceipt } from './receipts/ThermalReceipt';
import { StandardInvoice } from './receipts/StandardInvoice';
import { WholesaleBilti } from './receipts/WholesaleBilti';
import { MinimalSlip } from './receipts/MinimalSlip';
import {
  Plus,
  Trash2,
  Printer,
  Scale,
  Egg,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  Sliders,
  UserPlus,
  Search,
  Check,
  X,
  Phone,
  Layers,
  Sparkles,
} from 'lucide-react';

export const POSBillingView: React.FC = () => {
  const {
    products,
    customers,
    currentOperator,
    createBill,
    getCustomerPendingBalance,
    addNewCustomer,
    billTemplate,
    setBillTemplate,
    billPaperSize,
    setBillPaperSize,
  } = useBilling();

  // --- 1. Party / Seller Search & Add State ---
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [partySearchTerm, setPartySearchTerm] = useState('');
  const [isPartySearchOpen, setIsPartySearchOpen] = useState(false);
  const [showInlineAddParty, setShowInlineAddParty] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyPhone, setNewPartyPhone] = useState('');
  const [newPartyType, setNewPartyType] = useState<'buyer' | 'seller'>('buyer');
  const [newPartyAddress, setNewPartyAddress] = useState('');

  // Selected customer object & pending due
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];
  const customerPendingDues = selectedCustomer ? getCustomerPendingBalance(selectedCustomer.id) : 0;

  // Filter parties by search
  const filteredParties = useMemo(() => {
    if (!partySearchTerm.trim()) return customers;
    const term = partySearchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.phone && c.phone.includes(term)) ||
        (c.address && c.address.toLowerCase().includes(term))
    );
  }, [customers, partySearchTerm]);

  // --- 2. Item Entry Mode: EGGS (First & Default) vs CHICKEN ---
  const [itemCategoryMode, setItemCategoryMode] = useState<'egg' | 'chicken'>('egg');

  // Egg Form State (Sheets, Total Counts, Rate)
  const eggProducts = useMemo(() => products.filter((p) => p.category === 'egg'), [products]);
  const [selectedEggProductId, setSelectedEggProductId] = useState<string>(eggProducts[0]?.id || 'egg-01');
  const [eggSheetsGiven, setEggSheetsGiven] = useState<string>('10'); // Sheets/Trays given
  const [eggsPerSheet, setEggsPerSheet] = useState<number>(30); // Standard 30 eggs/sheet
  const [eggRatePerSheet, setEggRatePerSheet] = useState<string>(
    eggProducts[0]?.defaultPrice?.toString() || '185'
  );

  // Computed total egg count
  const calculatedTotalEggs = Math.round((Number(eggSheetsGiven) || 0) * (eggsPerSheet || 30));
  const calculatedRatePerEgg = (Number(eggRatePerSheet) || 0) / (eggsPerSheet || 30);
  const calculatedEggSubtotal = Math.round((Number(eggSheetsGiven) || 0) * (Number(eggRatePerSheet) || 0));

  // Chicken Form State (Birds, Gross kg, Tare kg, Net kg)
  const chickenProducts = useMemo(() => products.filter((p) => p.category === 'chicken'), [products]);
  const [selectedChickenProductId, setSelectedChickenProductId] = useState<string>(chickenProducts[0]?.id || 'chk-01');
  const [chickenGrossKg, setChickenGrossKg] = useState<string>('36.5');
  const [chickenTareKg, setChickenTareKg] = useState<string>('4.0');
  const [chickenBirdCount, setChickenBirdCount] = useState<string>('16');
  const [chickenCrateCount, setChickenCrateCount] = useState<string>('2');
  const [chickenRatePerKg, setChickenRatePerKg] = useState<string>(
    chickenProducts[0]?.defaultPrice?.toString() || '145'
  );

  // Computed Net chicken weight
  const calculatedChickenNetKg = Math.max(
    0.1,
    Number(((Number(chickenGrossKg) || 0) - (Number(chickenTareKg) || 0)).toFixed(2))
  );
  const calculatedChickenSubtotal = Math.round(calculatedChickenNetKg * (Number(chickenRatePerKg) || 0));

  // --- 3. Bill Cart Items ---
  const [cartItems, setCartItems] = useState<BillItem[]>([
    {
      id: 'bi-demo-egg-1',
      productId: 'egg-01',
      productName: 'Table White Eggs (Tray of 30)',
      category: 'egg',
      unit: 'tray',
      quantity: 10,
      eggSheetsCount: 10,
      totalEggsCount: 300,
      eggsPerSheet: 30,
      unitPrice: 185,
      discount: 0,
      subtotal: 1850,
    },
  ]);

  // --- 4. Direct Financials & Payment (No payment method clutter) ---
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [transportFee, setTransportFee] = useState<number>(0);
  const [vehicleNumber, setVehicleNumber] = useState<string>('');
  const [billNotes, setBillNotes] = useState<string>('');

  // Cart financial calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalBeforeRound = Math.max(0, subtotal - discountAmount + transportFee);
  const grandTotal = Math.round(totalBeforeRound);
  const roundOff = Number((grandTotal - totalBeforeRound).toFixed(2));

  // Direct Amount Paid (Defaults to full grandTotal, editable directly)
  const [amountPaidInput, setAmountPaidInput] = useState<string>('');
  const effectivePaidAmount =
    amountPaidInput === ''
      ? grandTotal
      : Math.min(grandTotal, Math.max(0, Number(amountPaidInput) || 0));
  const effectivePendingAmount = Math.max(0, grandTotal - effectivePaidAmount);

  // Mobile Tab toggle: 'editor' or 'preview'
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // --- Handlers ---
  const handleSelectEggProduct = (prodId: string) => {
    setSelectedEggProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setEggRatePerSheet(prod.defaultPrice.toString());
      if (prod.unit === 'box') {
        setEggsPerSheet(360);
      } else if (prod.unit === 'crate') {
        setEggsPerSheet(210);
      } else {
        setEggsPerSheet(30);
      }
    }
  };

  const handleSelectChickenProduct = (prodId: string) => {
    setSelectedChickenProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setChickenRatePerKg(prod.defaultPrice.toString());
    }
  };

  // Add Egg item to Bill
  const handleAddEggToBill = () => {
    const prod = products.find((p) => p.id === selectedEggProductId) || eggProducts[0];
    const sheets = Number(eggSheetsGiven) || 1;
    const rate = Number(eggRatePerSheet) || prod.defaultPrice;
    const itemSubtotal = Math.round(sheets * rate);
    const totalCount = Math.round(sheets * (eggsPerSheet || 30));

    const newItem: BillItem = {
      id: `item-egg-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      productId: prod.id,
      productName: prod.name,
      category: 'egg',
      unit: prod.unit,
      quantity: sheets,
      eggSheetsCount: sheets,
      totalEggsCount: totalCount,
      eggsPerSheet: eggsPerSheet || 30,
      unitPrice: rate,
      discount: 0,
      subtotal: itemSubtotal,
    };

    setCartItems((prev) => [...prev, newItem]);
  };

  // Add Chicken item to Bill
  const handleAddChickenToBill = () => {
    const prod = products.find((p) => p.id === selectedChickenProductId) || chickenProducts[0];
    const rate = Number(chickenRatePerKg) || prod.defaultPrice;
    const gross = Number(chickenGrossKg) || 0;
    const tare = Number(chickenTareKg) || 0;
    const netKg = calculatedChickenNetKg;
    const itemSubtotal = Math.round(netKg * rate);

    const newItem: BillItem = {
      id: `item-chk-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      productId: prod.id,
      productName: prod.name,
      category: 'chicken',
      unit: 'kg',
      quantity: netKg,
      grossWeightKg: gross > 0 ? gross : undefined,
      tareWeightKg: tare > 0 ? tare : undefined,
      birdCount: chickenBirdCount ? Number(chickenBirdCount) : undefined,
      crateCount: chickenCrateCount ? Number(chickenCrateCount) : undefined,
      unitPrice: rate,
      discount: 0,
      subtotal: itemSubtotal,
    };

    setCartItems((prev) => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearBill = () => {
    setCartItems([]);
    setDiscountAmount(0);
    setTransportFee(0);
    setVehicleNumber('');
    setBillNotes('');
    setAmountPaidInput('0');
  };

  // Inline Add New Party
  const handleSaveInlineParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartyName.trim()) return;

    const created = addNewCustomer({
      name: newPartyName.trim(),
      phone: newPartyPhone.trim(),
      type: newPartyType,
      address: newPartyAddress.trim(),
    });

    setSelectedCustomerId(created.id);
    setShowInlineAddParty(false);
    setPartySearchTerm('');
    setNewPartyName('');
    setNewPartyPhone('');
    setNewPartyAddress('');
  };

  // Save & Print
  const handleSaveAndPrintBill = () => {
    if (cartItems.length === 0 || !selectedCustomer) return;

    createBill(
      {
        invoiceDate: new Date().toISOString(),
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        customerAddress: selectedCustomer.address,
        customerType: selectedCustomer.type === 'seller' ? 'seller' : 'buyer',
        operatorId: currentOperator.id,
        operatorName: currentOperator.name,
        counterName: currentOperator.counter,
        items: cartItems,
        subtotal,
        discountTotal: discountAmount,
        transportOrCrateFee: transportFee,
        taxRatePercent: 0,
        taxAmount: 0,
        roundOff,
        grandTotal,
        notes: billNotes,
        vehicleNumber: vehicleNumber || undefined,
        previousDueIncluded: customerPendingDues > 0 ? customerPendingDues : undefined,
      },
      effectivePaidAmount > 0
        ? {
            amount: effectivePaidAmount,
            method: 'cash',
            note:
              effectivePendingAmount > 0
                ? `Partial advance paid (${formatCurrency(effectivePaidAmount)})`
                : 'Full bill cleared',
          }
        : undefined
    );
  };

  // Real-time live preview object
  const livePreviewBill: Bill = {
    id: 'live-draft-bill',
    billNumber: `FB-${new Date().getFullYear()}-DRAFT`,
    invoiceDate: new Date().toISOString(),
    customerId: selectedCustomer?.id || 'guest',
    customerName: selectedCustomer?.name || 'Cash Customer',
    customerPhone: selectedCustomer?.phone,
    customerAddress: selectedCustomer?.address,
    customerType: selectedCustomer?.type === 'seller' ? 'seller' : 'buyer',
    operatorId: currentOperator.id,
    operatorName: currentOperator.name,
    counterName: currentOperator.counter,
    items: cartItems.length > 0 ? cartItems : [
      {
        id: 'sample-item-1',
        productId: 'egg-01',
        productName: 'Table White Eggs (Tray of 30)',
        category: 'egg',
        unit: 'tray',
        quantity: 10,
        eggSheetsCount: 10,
        totalEggsCount: 300,
        eggsPerSheet: 30,
        unitPrice: 185,
        discount: 0,
        subtotal: 1850,
      },
    ],
    subtotal: cartItems.length > 0 ? subtotal : 1850,
    discountTotal: discountAmount,
    transportOrCrateFee: transportFee,
    taxRatePercent: 0,
    taxAmount: 0,
    roundOff,
    grandTotal: cartItems.length > 0 ? grandTotal : 1850,
    paidAmount: cartItems.length > 0 ? effectivePaidAmount : 1850,
    pendingAmount: cartItems.length > 0 ? effectivePendingAmount : 0,
    paymentStatus:
      cartItems.length > 0
        ? effectivePendingAmount <= 0
          ? 'PAID'
          : effectivePaidAmount > 0
          ? 'PARTIAL'
          : 'PENDING'
        : 'PAID',
    payments:
      effectivePaidAmount > 0
        ? [
            {
              id: 'draft-p1',
              billId: 'live-draft',
              date: new Date().toISOString(),
              amount: effectivePaidAmount,
              paymentMethod: 'cash',
              note: effectivePendingAmount > 0 ? 'Partial payment' : 'Full settlement',
              collectedBy: currentOperator.name,
            },
          ]
        : [],
    notes: billNotes,
    vehicleNumber: vehicleNumber || undefined,
  };

  const getContainerWidth = (size: BillPaperSize) => {
    switch (size) {
      case '58mm':
        return 'w-[230px]';
      case '80mm':
        return 'w-[320px]';
      case 'a5':
        return 'w-[480px]';
      case 'a4':
        return 'w-[640px]';
      default:
        return 'w-[320px]';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-5 space-y-4">
      {/* Top Banner: Active Counter & Mobile View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#131d36] border border-[#243354] rounded-xl p-3 sm:p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm bg-blue-600 shadow-sm`}
          >
            {currentOperator.name.charAt(0)}
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                Active Counter
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <p className="text-sm font-bold text-white leading-tight">{currentOperator.name}</p>
            <p className="text-[11px] text-slate-400 leading-tight">{currentOperator.counter}</p>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden bg-[#0b1120] p-1 rounded-lg border border-[#243354] gap-1 text-xs">
          <button
            onClick={() => setMobileTab('editor')}
            className={`px-3 py-1 rounded font-semibold transition-colors ${
              mobileTab === 'editor' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Bill Form
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
              mobileTab === 'preview' ? 'bg-blue-600/30 text-blue-300 font-bold border border-blue-500/40' : 'text-slate-400'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>Live Print Preview</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Responsive Workspace: Bill Editor on Left, Live Print Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Clean Bill Creator */}
        <div
          className={`lg:col-span-6 space-y-4 ${
            mobileTab === 'editor' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Section 1: Search Party or Add New Party in this Page */}
          <div className="bg-[#131d36] border border-[#243354] rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                1. Party (Seller / Buyer)
              </span>
              <button
                type="button"
                onClick={() => setShowInlineAddParty(!showInlineAddParty)}
                className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors px-2 py-1 rounded bg-blue-500/10 border border-blue-500/30"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{showInlineAddParty ? 'Close Form' : '+ Add New Party'}</span>
              </button>
            </div>

            {/* Inline Add New Party Form */}
            {showInlineAddParty && (
              <form
                onSubmit={handleSaveInlineParty}
                className="p-3 bg-[#0b1120] border border-blue-500/40 rounded-lg space-y-2.5 animate-in fade-in"
              >
                <div className="flex justify-between items-center pb-1 border-b border-slate-800">
                  <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5" /> Quick Register Party
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowInlineAddParty(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Party Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Biryani Mart"
                      value={newPartyName}
                      onChange={(e) => setNewPartyName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#131d36] border border-[#243354] rounded text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91 98000 00000"
                      value={newPartyPhone}
                      onChange={(e) => setNewPartyPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#131d36] border border-[#243354] rounded text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Category</label>
                    <select
                      value={newPartyType}
                      onChange={(e) => setNewPartyType(e.target.value as 'buyer' | 'seller')}
                      className="w-full px-2 py-1.5 bg-[#131d36] border border-[#243354] rounded text-xs text-white"
                    >
                      <option value="buyer">Buyer (Restaurant/Shop)</option>
                      <option value="seller">Seller (Poultry/Egg Farm Supplier)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Mandi / Stall Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Stall #14, APMC"
                      value={newPartyAddress}
                      onChange={(e) => setNewPartyAddress(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#131d36] border border-[#243354] rounded text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded transition-colors"
                >
                  Save & Select Party
                </button>
              </form>
            )}

            {/* Search Bar for Searching Existing Parties */}
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search party by name or phone..."
                    value={partySearchTerm}
                    onFocus={() => setIsPartySearchOpen(true)}
                    onChange={(e) => {
                      setPartySearchTerm(e.target.value);
                      setIsPartySearchOpen(true);
                    }}
                    className="w-full pl-8 pr-3 py-2 bg-[#0b1120] border border-[#243354] rounded-lg text-xs font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  {partySearchTerm && (
                    <button
                      type="button"
                      onClick={() => setPartySearchTerm('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Instant Search Suggestions Dropdown */}
              {isPartySearchOpen && filteredParties.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-[#0b1120] border border-[#243354] rounded-lg shadow-xl z-20 divide-y divide-slate-800">
                  {filteredParties.map((p) => {
                    const due = getCustomerPendingBalance(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedCustomerId(p.id);
                          setIsPartySearchOpen(false);
                          setPartySearchTerm('');
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-[#131d36] flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{p.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({p.type === 'seller' ? 'Supplier' : 'Buyer'})
                            </span>
                          </div>
                          {p.phone && <p className="text-[10px] text-slate-400 font-mono">{p.phone}</p>}
                        </div>
                        <div className="text-right">
                          {due > 0 ? (
                            <span className="text-[11px] font-mono font-bold text-rose-400">
                              {formatCurrency(due)} Due
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-semibold">Clean</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Currently Selected Party Card */}
            {selectedCustomer && (
              <div className="p-3 bg-[#0b1120] rounded-lg border border-[#243354] flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white">{selectedCustomer.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                      {selectedCustomer.type === 'seller' ? 'Poultry Farm' : 'Buyer'}
                    </span>
                  </div>
                  {selectedCustomer.phone && (
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      {selectedCustomer.phone}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Balance:</span>
                  {customerPendingDues > 0 ? (
                    <span className="font-mono font-bold text-xs text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/60 inline-block">
                      ⚠ {formatCurrency(customerPendingDues)} Due
                    </span>
                  ) : (
                    <span className="font-mono font-bold text-xs text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/60 inline-block">
                      ✓ Clean Account
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: EGGS AND EGG COUNTS, TOTAL SHEETS GIVEN (FIRST!) & CHICKEN */}
          <div className="bg-[#131d36] border border-[#243354] rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                2. Add Products to Bill
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {cartItems.length} item{cartItems.length === 1 ? '' : 's'} added
              </span>
            </div>

            {/* Mode Switcher: EGGS IS FIRST! */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#0b1120] rounded-lg border border-[#243354]">
              <button
                type="button"
                onClick={() => setItemCategoryMode('egg')}
                className={`py-2 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  itemCategoryMode === 'egg'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Egg className="w-4 h-4 text-white" />
                <span>🥚 Eggs (Sheets & Total Count)</span>
              </button>

              <button
                type="button"
                onClick={() => setItemCategoryMode('chicken')}
                className={`py-2 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  itemCategoryMode === 'chicken'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Scale className="w-4 h-4 text-white" />
                <span>🍗 Chicken (Tare & Birds)</span>
              </button>
            </div>

            {/* A. EGG CALCULATION FORM (FIRST & DETAILED: SHEETS GIVEN, TOTAL COUNT) */}
            {itemCategoryMode === 'egg' && (
              <div className="p-3 bg-[#0b1120] rounded-lg border border-blue-500/30 space-y-3 animate-in fade-in">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-400" />
                    Egg Sheet & Total Count Calculator
                  </span>
                  <span className="text-[10px] text-slate-400">1 Sheet = 30 Eggs</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  {/* Egg Type */}
                  <div className="sm:col-span-6">
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                      Egg Variety
                    </label>
                    <select
                      value={selectedEggProductId}
                      onChange={(e) => handleSelectEggProduct(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#131d36] border border-[#243354] rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
                    >
                      {eggProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Total Sheets Given */}
                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-semibold text-blue-300 block mb-1">
                      Sheets Given (Trays) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={eggSheetsGiven}
                      onChange={(e) => setEggSheetsGiven(e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#131d36] border border-blue-500 rounded-lg text-xs font-mono font-extrabold text-white text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Rate per Sheet */}
                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                      Rate/Sheet (₹)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={eggRatePerSheet}
                      onChange={(e) => setEggRatePerSheet(e.target.value)}
                      className="w-full px-2 py-1.5 bg-[#131d36] border border-[#243354] rounded-lg text-xs font-mono font-bold text-white text-right focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Highlights: Total Egg Count and Rate per Egg */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 bg-[#131d36] rounded-lg border border-[#243354] font-mono text-xs">
                  <div>
                    <span className="text-[9px] font-sans text-slate-400 block">Total Sheets Given</span>
                    <span className="font-extrabold text-white text-sm">
                      {eggSheetsGiven || 0} sheets
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-sans text-blue-300 block font-bold">TOTAL EGGS COUNT</span>
                    <span className="font-extrabold text-blue-400 text-base">
                      {calculatedTotalEggs} eggs
                    </span>
                  </div>
                  <div className="text-right sm:text-left">
                    <span className="text-[9px] font-sans text-slate-400 block">Effective Per Egg</span>
                    <span className="font-bold text-slate-200">
                      ₹{calculatedRatePerEgg.toFixed(2)}/egg
                    </span>
                  </div>
                </div>

                {/* Add Egg Line Button */}
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    Lot Total: {formatCurrency(calculatedEggSubtotal)}
                  </span>
                  <button
                    type="button"
                    onClick={handleAddEggToBill}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add {eggSheetsGiven || 0} Sheets ({calculatedTotalEggs} Eggs)</span>
                  </button>
                </div>
              </div>
            )}

            {/* B. CHICKEN CALCULATION FORM (GROSS, TARE, NET, BIRDS) */}
            {itemCategoryMode === 'chicken' && (
              <div className="p-3 bg-[#0b1120] rounded-lg border border-blue-500/30 space-y-3 animate-in fade-in">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-blue-400" />
                    Chicken Weighing & Tare Calculator
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Gross kg − Tare kg = Net kg</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-8">
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                      Chicken Cut / Bird Type
                    </label>
                    <select
                      value={selectedChickenProductId}
                      onChange={(e) => handleSelectChickenProduct(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#131d36] border border-[#243354] rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
                    >
                      {chickenProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                      Rate / kg (₹)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={chickenRatePerKg}
                      onChange={(e) => setChickenRatePerKg(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#131d36] border border-[#243354] rounded-lg text-xs font-mono font-bold text-white text-right focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Tare Inputs */}
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-0.5">Gross kg</label>
                    <input
                      type="number"
                      step="any"
                      value={chickenGrossKg}
                      onChange={(e) => setChickenGrossKg(e.target.value)}
                      className="w-full px-1.5 py-1 bg-[#131d36] border border-[#243354] rounded text-xs font-mono text-white text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-0.5">Tare Crate kg</label>
                    <input
                      type="number"
                      step="any"
                      value={chickenTareKg}
                      onChange={(e) => setChickenTareKg(e.target.value)}
                      className="w-full px-1.5 py-1 bg-[#131d36] border border-[#243354] rounded text-xs font-mono text-white text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-0.5">Birds Count</label>
                    <input
                      type="number"
                      value={chickenBirdCount}
                      onChange={(e) => setChickenBirdCount(e.target.value)}
                      className="w-full px-1.5 py-1 bg-[#131d36] border border-[#243354] rounded text-xs font-mono text-white text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-0.5">Crates</label>
                    <input
                      type="number"
                      value={chickenCrateCount}
                      onChange={(e) => setChickenCrateCount(e.target.value)}
                      className="w-full px-1.5 py-1 bg-[#131d36] border border-[#243354] rounded text-xs font-mono text-white text-center"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <div className="text-xs font-mono font-bold text-slate-200">
                    Net Billed: <span className="text-blue-400 text-sm">{calculatedChickenNetKg} kg</span>{' '}
                    = <span className="text-emerald-400">{formatCurrency(calculatedChickenSubtotal)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddChickenToBill}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Chicken ({calculatedChickenNetKg} kg)</span>
                  </button>
                </div>
              </div>
            )}

            {/* List of Current Bill Items */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 pt-1">
              {cartItems.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex justify-between items-center p-2 rounded-lg bg-[#0b1120] border border-[#243354] text-xs"
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{item.productName}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-normal font-mono">
                        {item.quantity} {item.unit} @ ₹{item.unitPrice}
                      </span>
                    </div>

                    {/* Egg details */}
                    {(item.eggSheetsCount || item.totalEggsCount) && (
                      <p className="text-[10px] text-blue-300 font-mono font-medium">
                        Sheets: {item.eggSheetsCount} · Total: {item.totalEggsCount} eggs
                      </p>
                    )}

                    {/* Chicken Tare details */}
                    {(item.grossWeightKg || item.tareWeightKg || item.birdCount) && (
                      <p className="text-[10px] text-slate-400 font-mono">
                        {item.birdCount ? `${item.birdCount} birds · ` : ''}
                        Gross: {item.grossWeightKg}kg - Tare: {item.tareWeightKg}kg = Net: {item.quantity}kg
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">
                      {formatCurrency(item.subtotal)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: DIRECT FINANCIALS & AMOUNT PAID (NO PAYMENT METHOD HASSLE) */}
          <div className="bg-[#131d36] border border-[#243354] rounded-xl p-4 shadow-sm space-y-3">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide block">
              3. Total & Payment Collection (Direct)
            </span>

            {/* Adjustments: Discount & Freight */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={discountAmount || ''}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2 py-1 bg-[#0b1120] border border-[#243354] rounded text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Crates / Freight (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={transportFee || ''}
                  onChange={(e) => setTransportFee(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2 py-1 bg-[#0b1120] border border-[#243354] rounded text-xs font-mono text-white"
                />
              </div>
            </div>

            {/* Subtotal & Grand Total Display */}
            <div className="p-3 bg-[#0b1120] rounded-lg border border-[#243354] font-mono text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>Discount:</span>
                  <span>- {formatCurrency(discountAmount)}</span>
                </div>
              )}
              {transportFee > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>Freight/Crates:</span>
                  <span>+ {formatCurrency(transportFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-slate-800">
                <span>BILL GRAND TOTAL:</span>
                <span className="text-blue-400 text-base">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Direct Amount Paid Input & Quick Settlement (Directly as requested) */}
            <div className="p-3 bg-[#0b1120] rounded-lg border border-blue-500/40 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-white">
                  Amount Paid Now (₹)
                </label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setAmountPaidInput(String(grandTotal))}
                    className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold"
                  >
                    Full Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmountPaidInput(String(Math.round(grandTotal * 0.5)))}
                    className="px-2 py-0.5 bg-[#131d36] hover:bg-[#1a2744] text-slate-300 rounded text-[10px] font-semibold border border-[#243354]"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmountPaidInput('0')}
                    className="px-2 py-0.5 bg-[#131d36] hover:bg-[#1a2744] text-slate-300 rounded text-[10px] font-semibold border border-[#243354]"
                  >
                    Full Due (₹0)
                  </button>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1.5 text-slate-400 font-bold font-mono">₹</span>
                  <input
                    type="number"
                    min="0"
                    max={grandTotal}
                    value={amountPaidInput === '' ? grandTotal : amountPaidInput}
                    onChange={(e) => setAmountPaidInput(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 bg-[#131d36] border border-blue-500 rounded text-sm font-mono font-extrabold text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block font-semibold">Remaining Pending:</span>
                  <span
                    className={`font-mono font-extrabold text-sm ${
                      effectivePendingAmount > 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {effectivePendingAmount > 0
                      ? formatCurrency(effectivePendingAmount)
                      : '✓ FULLY SETTLED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-2 pt-2 border-t border-[#243354]">
              <button
                type="button"
                onClick={handleClearBill}
                className="py-2.5 px-3 rounded-lg border border-[#243354] hover:bg-[#0b1120] text-xs text-slate-400 hover:text-white transition-colors"
                title="Clear current bill form"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleSaveAndPrintBill}
                disabled={cartItems.length === 0}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Save Bill & Open Receipt ({formatCurrency(grandTotal)})</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE PRINT PREVIEW */}
        <div
          className={`lg:col-span-6 space-y-3 ${
            mobileTab === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Header of Live Preview */}
          <div className="bg-[#131d36] border border-[#243354] rounded-xl p-3 shadow-sm space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                Live Print Preview:
              </span>

              {/* Template Buttons */}
              <div className="flex bg-[#0b1120] p-0.5 rounded-lg border border-[#243354] gap-0.5">
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
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
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

            {/* Paper Size selector */}
            <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-[#243354]">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Sliders className="w-3 h-3 text-blue-400" /> Paper Size:
              </span>
              <div className="flex bg-[#0b1120] p-0.5 rounded-lg border border-[#243354] gap-0.5">
                {(
                  [
                    { id: '58mm', label: '58mm' },
                    { id: '80mm', label: '80mm' },
                    { id: 'a5', label: 'A5' },
                    { id: 'a4', label: 'A4' },
                  ] as { id: BillPaperSize; label: string }[]
                ).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setBillPaperSize(s.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      billPaperSize === s.id
                        ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
              >
                <Printer className="w-3 h-3" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Paper Canvas Container (Scales to selected paper width) */}
          <div className="p-4 sm:p-6 bg-[#0b1120] border border-[#243354] rounded-xl overflow-x-auto min-h-[500px] flex justify-center items-start shadow-inner">
            <div
              className={`printable-container ${getContainerWidth(
                billPaperSize
              )} shadow-2xl rounded-xs bg-white text-black transition-all duration-150`}
            >
              {billTemplate === 'thermal' && <ThermalReceipt bill={livePreviewBill} />}
              {billTemplate === 'standard' && <StandardInvoice bill={livePreviewBill} />}
              {billTemplate === 'wholesale' && <WholesaleBilti bill={livePreviewBill} />}
              {billTemplate === 'minimal' && <MinimalSlip bill={livePreviewBill} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
