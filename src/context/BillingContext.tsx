import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Bill,
  BillPaperSize,
  BillTemplateType,
  CustomerSeller,
  Operator,
  PaymentMethod,
  PaymentRecord,
  ProductItem,
} from '../types/billing';
import {
  INITIAL_BILLS,
  INITIAL_CUSTOMERS,
  INITIAL_OPERATORS,
  INITIAL_PRODUCTS,
} from '../data/initialData';

interface BillingContextType {
  bills: Bill[];
  customers: CustomerSeller[];
  products: ProductItem[];
  operators: Operator[];
  currentOperator: Operator;
  currentOperatorId: 'user1' | 'user2' | 'admin';
  setCurrentOperatorId: (id: 'user1' | 'user2' | 'admin') => void;
  
  // Receipt modal state
  selectedBillForReceipt: Bill | null;
  setSelectedBillForReceipt: (bill: Bill | null) => void;
  billTemplate: BillTemplateType;
  setBillTemplate: (t: BillTemplateType) => void;
  billPaperSize: BillPaperSize;
  setBillPaperSize: (s: BillPaperSize) => void;
  billZoom: number;
  setBillZoom: (z: number) => void;

  // Actions
  createBill: (newBill: Omit<Bill, 'id' | 'billNumber' | 'payments' | 'paidAmount' | 'pendingAmount' | 'paymentStatus'>, initialPayment?: { amount: number; method: PaymentMethod; note?: string; ref?: string }) => Bill;
  addPaymentToBill: (billId: string, amount: number, method: PaymentMethod, note?: string, ref?: string) => void;
  deleteBill: (billId: string) => void;
  updateProductPrice: (productId: string, newPrice: number) => void;
  addNewProduct: (product: Omit<ProductItem, 'id'>) => void;
  addNewCustomer: (customer: Omit<CustomerSeller, 'id'>) => CustomerSeller;
  resetToDemoData: () => void;

  // Analytical helpers
  getCustomerPendingBalance: (customerId: string) => number;
  getCustomerBills: (customerId: string) => Bill[];
  getOperatorStats: (operatorId: 'user1' | 'user2' | 'admin') => {
    totalBills: number;
    totalSales: number;
    collectedAmount: number;
    pendingAmount: number;
  };
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BILLS: 'featherbill_bills_v2',
  CUSTOMERS: 'featherbill_customers_v2',
  PRODUCTS: 'featherbill_products_v2',
  OPERATOR: 'featherbill_active_operator_v2',
  TEMPLATE: 'featherbill_active_template_v2',
  PAPER_SIZE: 'featherbill_active_papersize_v2',
};

export const BillingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bills, setBills] = useState<Bill[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BILLS);
      return saved ? JSON.parse(saved) : INITIAL_BILLS;
    } catch {
      return INITIAL_BILLS;
    }
  });

  const [customers, setCustomers] = useState<CustomerSeller[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [products, setProducts] = useState<ProductItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [currentOperatorId, setCurrentOperatorId] = useState<'user1' | 'user2' | 'admin'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OPERATOR);
      return (saved as 'user1' | 'user2' | 'admin') || 'user1';
    } catch {
      return 'user1';
    }
  });

  const [billTemplate, setBillTemplate] = useState<BillTemplateType>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATE);
      return (saved as BillTemplateType) || 'thermal';
    } catch {
      return 'thermal';
    }
  });

  const [billPaperSize, setBillPaperSize] = useState<BillPaperSize>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PAPER_SIZE);
      return (saved as BillPaperSize) || '80mm';
    } catch {
      return '80mm';
    }
  });

  const [billZoom, setBillZoom] = useState<number>(100);
  const [selectedBillForReceipt, setSelectedBillForReceipt] = useState<Bill | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
    } catch (e) {
      console.error('Failed to save bills', e);
    }
  }, [bills]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch (e) {
      console.error('Failed to save customers', e);
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products', e);
    }
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OPERATOR, currentOperatorId);
  }, [currentOperatorId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEMPLATE, billTemplate);
  }, [billTemplate]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAPER_SIZE, billPaperSize);
  }, [billPaperSize]);

  // If a bill is selected and updated, keep the selected view in sync
  useEffect(() => {
    if (selectedBillForReceipt) {
      const updated = bills.find((b) => b.id === selectedBillForReceipt.id);
      if (updated) {
        setSelectedBillForReceipt(updated);
      }
    }
  }, [bills]);

  const currentOperator = INITIAL_OPERATORS.find((op) => op.id === currentOperatorId) || INITIAL_OPERATORS[0];

  const createBill = (
    billData: Omit<Bill, 'id' | 'billNumber' | 'payments' | 'paidAmount' | 'pendingAmount' | 'paymentStatus'>,
    initialPayment?: { amount: number; method: PaymentMethod; note?: string; ref?: string }
  ): Bill => {
    const nextNum = bills.length + 1001;
    const billId = `bill-${Date.now()}`;
    const billNumber = `FB-${new Date().getFullYear()}-${nextNum}`;
    
    let paidAmount = 0;
    const payments: PaymentRecord[] = [];

    if (initialPayment && initialPayment.amount > 0) {
      paidAmount = Math.min(billData.grandTotal, Math.max(0, initialPayment.amount));
      payments.push({
        id: `pay-${Date.now()}`,
        billId,
        date: new Date().toISOString(),
        amount: paidAmount,
        paymentMethod: initialPayment.method,
        referenceNumber: initialPayment.ref,
        note: initialPayment.note || 'Initial payment upon bill creation',
        collectedBy: currentOperator.name,
      });
    }

    const pendingAmount = Math.max(0, billData.grandTotal - paidAmount);
    const paymentStatus = pendingAmount <= 0 ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'PENDING';

    const newBill: Bill = {
      ...billData,
      id: billId,
      billNumber,
      payments,
      paidAmount,
      pendingAmount,
      paymentStatus,
    };

    setBills((prev) => [newBill, ...prev]);
    setSelectedBillForReceipt(newBill);
    return newBill;
  };

  /**
   * CRITICAL REQUIREMENT:
   * "and there maybe pending payments for the same bill which should be covered on next payment in the same bill"
   * This adds a payment installment directly into the existing bill's payment history,
   * recalculates paid and pending amounts, and updates the bill's status in place.
   */
  const addPaymentToBill = (
    billId: string,
    amount: number,
    method: PaymentMethod,
    note?: string,
    ref?: string
  ) => {
    setBills((prevBills) =>
      prevBills.map((bill) => {
        if (bill.id !== billId) return bill;

        const effectiveAmount = Math.min(bill.pendingAmount, Math.max(0, amount));
        if (effectiveAmount <= 0) return bill;

        const newPayment: PaymentRecord = {
          id: `pay-${Date.now()}`,
          billId: bill.id,
          date: new Date().toISOString(),
          amount: effectiveAmount,
          paymentMethod: method,
          referenceNumber: ref,
          note: note || 'Next installment payment for this bill',
          collectedBy: currentOperator.name,
        };

        const updatedPayments = [...bill.payments, newPayment];
        const newPaidAmount = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
        const newPendingAmount = Math.max(0, bill.grandTotal - newPaidAmount);
        const newStatus = newPendingAmount <= 0 ? 'PAID' : 'PARTIAL';

        return {
          ...bill,
          payments: updatedPayments,
          paidAmount: newPaidAmount,
          pendingAmount: newPendingAmount,
          paymentStatus: newStatus,
        };
      })
    );
  };

  const deleteBill = (billId: string) => {
    setBills((prev) => prev.filter((b) => b.id !== billId));
    if (selectedBillForReceipt?.id === billId) {
      setSelectedBillForReceipt(null);
    }
  };

  const updateProductPrice = (productId: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, defaultPrice: Math.max(0, newPrice) } : p))
    );
  };

  const addNewProduct = (product: Omit<ProductItem, 'id'>) => {
    const newProd: ProductItem = {
      ...product,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [...prev, newProd]);
  };

  const addNewCustomer = (customer: Omit<CustomerSeller, 'id'>): CustomerSeller => {
    const newCust: CustomerSeller = {
      ...customer,
      id: `cust-${Date.now()}`,
    };
    setCustomers((prev) => [newCust, ...prev]);
    return newCust;
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.BILLS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    setBills(INITIAL_BILLS);
    setCustomers(INITIAL_CUSTOMERS);
    setProducts(INITIAL_PRODUCTS);
    setSelectedBillForReceipt(null);
  };

  const getCustomerPendingBalance = (customerId: string): number => {
    return bills
      .filter((b) => b.customerId === customerId)
      .reduce((sum, b) => sum + b.pendingAmount, 0);
  };

  const getCustomerBills = (customerId: string): Bill[] => {
    return bills.filter((b) => b.customerId === customerId);
  };

  const getOperatorStats = (operatorId: 'user1' | 'user2' | 'admin') => {
    const opBills = operatorId === 'admin' ? bills : bills.filter((b) => b.operatorId === operatorId);
    const totalSales = opBills.reduce((sum, b) => sum + b.grandTotal, 0);
    const collectedAmount = opBills.reduce((sum, b) => sum + b.paidAmount, 0);
    const pendingAmount = opBills.reduce((sum, b) => sum + b.pendingAmount, 0);

    return {
      totalBills: opBills.length,
      totalSales,
      collectedAmount,
      pendingAmount,
    };
  };

  return (
    <BillingContext.Provider
      value={{
        bills,
        customers,
        products,
        operators: INITIAL_OPERATORS,
        currentOperator,
        currentOperatorId,
        setCurrentOperatorId,
        selectedBillForReceipt,
        setSelectedBillForReceipt,
        billTemplate,
        setBillTemplate,
        billPaperSize,
        setBillPaperSize,
        billZoom,
        setBillZoom,
        createBill,
        addPaymentToBill,
        deleteBill,
        updateProductPrice,
        addNewProduct,
        addNewCustomer,
        resetToDemoData,
        getCustomerPendingBalance,
        getCustomerBills,
        getOperatorStats,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
};
