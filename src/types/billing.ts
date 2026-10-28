export type ProductCategory = 'chicken' | 'egg' | 'other';

export type ProductUnit = 'kg' | 'tray' | 'piece' | 'crate' | 'box';

export interface ProductItem {
  id: string;
  name: string;
  category: ProductCategory;
  unit: ProductUnit;
  defaultPrice: number;
  description?: string;
  isPopular?: boolean;
}

export interface BillItem {
  id: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  unit: ProductUnit;
  quantity: number;
  // Specific to poultry weight calculation
  grossWeightKg?: number;
  tareWeightKg?: number; // Crate weight
  crateCount?: number;
  birdCount?: number;
  // Specific to egg calculation (sheets/trays and total egg counts)
  eggSheetsCount?: number;
  totalEggsCount?: number;
  eggsPerSheet?: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'credit';

export interface PaymentRecord {
  id: string;
  billId: string;
  date: string; // ISO string
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  note?: string;
  collectedBy: string; // Operator name
}

export type BillPaymentStatus = 'PAID' | 'PARTIAL' | 'PENDING';

export interface CustomerSeller {
  id: string;
  name: string;
  phone: string;
  type: 'buyer' | 'seller' | 'both';
  address?: string;
  gstOrTradeNo?: string;
  creditLimit?: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  invoiceDate: string; // ISO date
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerType: 'buyer' | 'seller';
  
  // Operator info (User 1 or User 2 or Admin)
  operatorId: 'user1' | 'user2' | 'admin';
  operatorName: string;
  counterName: string;

  items: BillItem[];
  
  // Financial breakdown
  subtotal: number;
  discountTotal: number;
  transportOrCrateFee: number;
  taxRatePercent: number;
  taxAmount: number;
  roundOff: number;
  grandTotal: number;

  // Payments & Pending tracking
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: BillPaymentStatus;
  payments: PaymentRecord[];

  // Previous pending covered or carried
  previousDueIncluded?: number;
  
  notes?: string;
  vehicleNumber?: string;
}

export type BillTemplateType = 'thermal' | 'standard' | 'wholesale' | 'minimal';
export type BillPaperSize = '58mm' | '80mm' | 'a5' | 'a4';

export interface Operator {
  id: 'user1' | 'user2' | 'admin';
  name: string;
  role: 'operator' | 'admin';
  counter: string;
  avatarColor: string;
}
