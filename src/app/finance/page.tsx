'use client';

import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, Search, Filter, Plus, FileText, CheckCircle2, 
  AlertCircle, Printer, Send, CreditCard, QrCode, Download, X, Eye, Sparkles
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { db } from '@/lib/mock-db';
import { Invoice, Booking, Customer, Payment, Profile } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function FinanceManager() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Invoice Focus View Modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Metered extras editing state
  const [isEditingExtras, setIsEditingExtras] = useState(false);
  const [genHoursInput, setGenHoursInput] = useState('');
  const [genRateInput, setGenRateInput] = useState('');
  const [elecUnitsInput, setElecUnitsInput] = useState('');
  const [elecRateInput, setElecRateInput] = useState('');
  const [miscCostInput, setMiscCostInput] = useState('');
  const [miscDescInput, setMiscDescInput] = useState('');
  
  // Payment Collection dialog
  const [isCollectOpen, setIsCollectOpen] = useState(false);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState<'Razorpay' | 'UPI' | 'Cash' | 'Bank Transfer'>('UPI');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Razorpay / UPI QR overlays
  const [showQr, setShowQr] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);

  // Sharing Dialogue
  const [shareType, setShareType] = useState<'whatsapp' | 'email' | null>(null);

  useEffect(() => {
    setInvoices(db.getInvoices());
    setBookings(db.getBookings());
    setCustomers(db.getCustomers());
    setPayments(db.getPayments());
  }, []);

  // Sync inputs when focused invoice changes
  useEffect(() => {
    if (selectedInvoice) {
      setGenHoursInput(selectedInvoice.generatorHours?.toString() || '');
      setGenRateInput(selectedInvoice.generatorRate?.toString() || '');
      setElecUnitsInput(selectedInvoice.electricityUnits?.toString() || '');
      setElecRateInput(selectedInvoice.electricityRate?.toString() || '');
      setMiscCostInput(selectedInvoice.miscCost?.toString() || '');
      setMiscDescInput(selectedInvoice.miscDescription || '');
      setIsEditingExtras(false);
    }
  }, [selectedInvoice]);

  const handleCollectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || payAmount <= 0) return;

    try {
      // Record payment in stateful DB
      const payRecord = db.addPayment({
        bookingId: selectedInvoice.bookingId,
        amount: Number(payAmount),
        paymentMethod: payMethod,
        transactionId: payRef || `MOCK_TXN_${Date.now()}`,
        notes: payNotes || 'Payment verified by accountant session.'
      });

      // Update state
      setPayments(db.getPayments());
      setBookings(db.getBookings());
      setInvoices(db.getInvoices());
      
      // Update focused invoice stats
      const updatedInvoices = db.getInvoices();
      const match = updatedInvoices.find(i => i.id === selectedInvoice.id);
      if (match) setSelectedInvoice(match);

      setIsCollectOpen(false);
      setPayAmount(0);
      setPayRef('');
      setPayNotes('');
      alert(`Payment of Rs. ${Number(payAmount).toLocaleString('en-IN')} logged. Booking and Invoice balance recalculated.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateInvoiceExtras = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !bookingMatch) return;

    try {
      const genHours = Number(genHoursInput) || 0;
      const genRate = Number(genRateInput) || 0;
      const elecUnits = Number(elecUnitsInput) || 0;
      const elecRate = Number(elecRateInput) || 0;
      const miscCost = Number(miscCostInput) || 0;
      const extraCharges = (genHours * genRate) + (elecUnits * elecRate) + miscCost;

      // GST-inclusive calculation
      const grandTotal = Number((bookingMatch.totalAmount + extraCharges).toFixed(2));
      const subtotal = Number((grandTotal / 1.18).toFixed(2));
      const totalGst = Number((grandTotal - subtotal).toFixed(2));
      const cgstAmount = Number((totalGst / 2).toFixed(2));
      const sgstAmount = Number((totalGst / 2).toFixed(2));
      const balanceDue = Number((grandTotal - selectedInvoice.advanceDeducted).toFixed(2));

      const updated = db.updateInvoice(selectedInvoice.id, {
        generatorHours: genHours || undefined,
        generatorRate: genRate || undefined,
        electricityUnits: elecUnits || undefined,
        electricityRate: elecRate || undefined,
        miscCost: miscCost || undefined,
        miscDescription: miscDescInput || undefined,
        subtotal,
        cgstAmount,
        sgstAmount,
        totalGst,
        grandTotal,
        balanceDue,
        status: selectedInvoice.advanceDeducted === 0 ? 'Unpaid' : (balanceDue <= 0 ? 'Paid' : 'Partially Paid')
      });

      // Update state
      setInvoices(db.getInvoices());
      setSelectedInvoice(updated);
      setIsEditingExtras(false);
      alert('Invoice metered billing & extras updated successfully.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTriggerRazorpay = () => {
    setShowRazorpay(true);
    // Auto populate a transaction ID after 2 seconds simulation
    setTimeout(() => {
      setPayRef(`pay_${Math.random().toString(36).substring(2, 11)}`);
    }, 1500);
  };

  const filteredInvoices = invoices.filter(inv => {
    const booking = bookings.find(b => b.id === inv.bookingId);
    const customer = booking ? customers.find(c => c.id === booking.customerId) : null;

    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking?.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Invoice calculations helper
  const bookingMatch = selectedInvoice ? bookings.find(b => b.id === selectedInvoice.bookingId) : null;
  const customerMatch = bookingMatch ? customers.find(c => c.id === bookingMatch.customerId) : null;
  const paymentsMatch = selectedInvoice ? payments.filter(p => p.bookingId === selectedInvoice.bookingId) : [];

  return (
    <DashboardLayout>
      {/* Finance Header */}
      <div className="mb-8">
        <h3 className="font-heading text-2xl font-bold text-purple-dark">Financial Ledgers & Invoices</h3>
        <p className="text-xs text-gray-500 font-medium mt-1">
          Review GST invoice sheets, verify digital online collections, track outstanding balances, and compile audit receipts.
        </p>
      </div>

      {/* Searching Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-border-light shadow-luxury mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search by Invoice #, Booking # or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-ivory/50 border border-border-light focus:outline-none focus:border-gold-primary rounded-lg text-xs"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-ivory/50 border border-border-light focus:outline-none focus:border-gold-primary rounded-lg text-xs text-dark font-medium"
          >
            <option value="All">All Invoice Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Invoices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInvoices.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-border-light text-center italic text-gray-500">
            No invoices found matching queries.
          </div>
        ) : (
          filteredInvoices.map((inv) => {
            const booking = bookings.find(b => b.id === inv.bookingId);
            const customer = booking ? customers.find(c => c.id === booking.customerId) : null;

            return (
              <div 
                key={inv.id}
                className="bg-white p-5 rounded-2xl border border-border-light shadow-luxury hover:border-gold-primary transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold text-gray-400">
                      Invoice Date: {formatDate(inv.issuedDate)}
                    </span>
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                      inv.status === 'Paid' ? "bg-green-100 text-green-800" :
                      inv.status === 'Partially Paid' ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                    )}>
                      {inv.status}
                    </span>
                  </div>

                  <h4 className="font-heading text-sm font-bold text-purple-dark">
                    {inv.invoiceNumber}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    Booking Ref: <span className="font-semibold">{booking?.bookingNumber}</span>
                  </p>
                  
                  <div className="mt-4 p-3 bg-ivory/30 border border-border-light rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Customer:</span>
                      <span className="font-bold text-dark">{customer?.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Price:</span>
                      <span className="font-bold text-dark">{formatCurrency(inv.grandTotal)}</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-border-light pt-2 font-semibold">
                      <span className="text-purple-dark">Outstanding Dues:</span>
                      <span className={inv.balanceDue === 0 ? "text-green-700" : "text-red-600"}>
                        {formatCurrency(inv.balanceDue)}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedInvoice(inv)}
                  className="mt-6 w-full py-2 bg-purple-primary text-white text-xs font-bold rounded-lg border border-gold-primary/30 hover:bg-purple-dark shadow-sm flex items-center justify-center transition-colors"
                >
                  <Eye className="h-3.5 w-3.5 mr-1 text-gold-primary" />
                  Compile Invoice
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* FULL-SCREEN PRINTABLE INVOICE FOCUS MODAL */}
      {selectedInvoice && customerMatch && bookingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs print:absolute print:inset-0 print:bg-white print:p-0">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl border border-border-light shadow-luxury-lg overflow-hidden max-h-[90vh] flex flex-col justify-between animate-in zoom-in duration-300 print:max-h-none print:border-none print:shadow-none print:rounded-none">
            {/* Modal Actions Header Bar */}
            <div className="p-4 bg-purple-dark text-white flex justify-between items-center no-print">
              <span className="font-heading text-xs font-bold text-gold-primary uppercase tracking-wider">
                Tax Invoice Manager
              </span>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setIsEditingExtras(!isEditingExtras)}
                  className={cn(
                    "px-3.5 py-1.5 text-xs font-bold border rounded-lg flex items-center transition-all",
                    isEditingExtras 
                      ? "bg-gold-primary text-purple-dark border-gold-primary hover:bg-gold-light" 
                      : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                  )}
                >
                  <FileText className="h-4 w-4 mr-1 text-gold-primary" />
                  Metered / Extras
                </button>
                <button 
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs font-bold flex items-center"
                >
                  <Printer className="h-4 w-4 mr-1 text-gold-primary" />
                  Print (PDF)
                </button>
                <button 
                  onClick={() => setShareType('whatsapp')}
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs font-bold flex items-center"
                >
                  <Send className="h-4 w-4 mr-1 text-gold-primary" />
                  WhatsApp
                </button>
                {selectedInvoice.balanceDue > 0 && (
                  <button 
                    onClick={() => { setIsCollectOpen(true); setPayAmount(selectedInvoice.balanceDue); }}
                    className="px-4 py-1.5 bg-gold-primary text-purple-dark font-bold rounded-lg hover:bg-gold-light text-xs flex items-center"
                  >
                    <CreditCard className="h-4 w-4 mr-1 text-purple-primary" />
                    Collect Dues
                  </button>
                )}
                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 rounded text-purple-light hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Extras Editing Panel */}
            {isEditingExtras && (
              <div className="p-6 bg-ivory/80 border-b border-border-light no-print animate-in slide-in-from-top duration-200">
                <h4 className="font-heading text-sm font-bold text-purple-dark mb-4 flex items-center">
                  <Sparkles className="h-4 w-4 mr-1.5 text-gold-primary" />
                  Update Metered Billing & Custom Extras (GST Inclusive)
                </h4>
                
                <form onSubmit={handleUpdateInvoiceExtras} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Generator Hours</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 5" 
                      value={genHoursInput}
                      onChange={(e) => setGenHoursInput(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#EBE6DD] rounded-lg focus:outline-none focus:border-purple-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Generator Rate / Hour (Rs.)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 1500" 
                      value={genRateInput}
                      onChange={(e) => setGenRateInput(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#EBE6DD] rounded-lg focus:outline-none focus:border-purple-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Electricity Consumed (Units)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 250" 
                      value={elecUnitsInput}
                      onChange={(e) => setElecUnitsInput(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#EBE6DD] rounded-lg focus:outline-none focus:border-purple-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Electricity Rate / Unit (Rs.)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 15" 
                      value={elecRateInput}
                      onChange={(e) => setElecRateInput(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#EBE6DD] rounded-lg focus:outline-none focus:border-purple-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Miscellaneous Cost (Rs.)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 5000" 
                      value={miscCostInput}
                      onChange={(e) => setMiscCostInput(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#EBE6DD] rounded-lg focus:outline-none focus:border-purple-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Misc Description</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Stage Flower Extensions" 
                      value={miscDescInput}
                      onChange={(e) => setMiscDescInput(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#EBE6DD] rounded-lg focus:outline-none focus:border-purple-primary"
                    />
                  </div>
                  
                  <div className="sm:col-span-3 pt-3 flex justify-end space-x-2 border-t border-border-light">
                    <button 
                      type="button" 
                      onClick={() => setIsEditingExtras(false)}
                      className="px-4 py-1.5 bg-white text-gray-500 border border-border-light rounded-lg hover:bg-gray-50 text-[10px] font-bold"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-5 py-1.5 bg-purple-primary text-white font-bold rounded-lg border border-gold-primary/30 hover:bg-purple-dark text-[10px] shadow-sm"
                    >
                      Save Extra Charges
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Printable Invoice Page Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-white print-shadow-none" id="printable-invoice">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-purple-primary pb-6">
                <div className="flex items-center space-x-4">
                  <img src="/logo.png" alt="Bhagyalaxmi Lawns Logo" className="h-16 w-16 rounded-xl object-cover border border-purple-primary/20" />
                  <div>
                    <h1 className="font-heading text-3xl font-extrabold text-purple-dark">Bhagyalaxmi Lawns</h1>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Wedding banquet hall & open lawns events management services.<br />
                      Bhingar, Nagardeole, Ahilyanagar, Maharashtra 414002.<br />
                      GSTIN: 27ABCDE1234F1Z5 (MOCK)
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right mt-4 sm:mt-0">
                  <h3 className="font-heading text-lg font-bold text-gold-primary uppercase tracking-widest">Tax Invoice</h3>
                  <p className="text-xs text-gray-500 mt-1 font-medium">
                    Invoice No: <span className="font-bold text-dark">{selectedInvoice.invoiceNumber}</span><br />
                    Dated: <span className="font-semibold text-dark">{formatDate(selectedInvoice.issuedDate)}</span><br />
                    Booking ID: <span className="font-semibold text-dark">{bookingMatch.bookingNumber}</span>
                  </p>
                </div>
              </div>

              {/* Bill To / Event specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 text-xs border-b border-border-light">
                <div>
                  <h5 className="font-bold text-purple-primary uppercase mb-2">Billed To (Customer details):</h5>
                  <p className="text-sm font-bold text-dark">{customerMatch.fullName}</p>
                  <p className="text-gray-500 mt-1">Phone: <span className="font-semibold text-dark">{customerMatch.phone}</span></p>
                  {customerMatch.email && <p className="text-gray-500">Email: <span className="font-semibold text-dark">{customerMatch.email}</span></p>}
                  {customerMatch.address && <p className="text-gray-500">Address: <span className="font-semibold text-dark">{customerMatch.address}</span></p>}
                </div>
                <div>
                  <h5 className="font-bold text-purple-primary uppercase mb-2">Ceremony Specifications:</h5>
                  <div className="space-y-1.5">
                    <p className="text-gray-500">Event Category: <span className="font-bold text-dark">{bookingMatch.eventType}</span></p>
                    <p className="text-gray-500">Scheduled Date: <span className="font-bold text-dark">{formatDate(bookingMatch.eventDate)} ({bookingMatch.slotType})</span></p>
                    <p className="text-gray-500">Expected Guests: <span className="font-semibold text-dark">{bookingMatch.guestCount} Pax</span></p>
                    <p className="text-gray-500">Decor Theme: <span className="font-semibold text-dark">{bookingMatch.decorationTheme || 'Heritage Paithani'}</span></p>
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="py-6">
                <table className="w-full text-left text-xs text-dark border-collapse">
                  <thead>
                    <tr className="bg-purple-light/20 border-b border-purple-primary font-bold">
                      <th className="p-3">Service Details</th>
                      <th className="p-3 text-center">Qty / Scale</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Item 1: Venue booking base */}
                    <tr className="border-b border-border-light">
                      <td className="p-3">
                        <p className="font-bold">Banquet / Lawn Venue Base Rental Charge</p>
                        <p className="text-[10px] text-gray-500">Covers slot timings, standard room accesses, cleanups & backup utility controls.</p>
                      </td>
                      <td className="p-3 text-center">1 Unit</td>
                      <td className="p-3 text-right">{formatCurrency(bookingMatch.totalAmount / 1.18 * 0.7)}</td>
                      <td className="p-3 text-right">{formatCurrency(bookingMatch.totalAmount / 1.18 * 0.7)}</td>
                    </tr>
                    {/* Item 2: Decor & Addons */}
                    <tr className="border-b border-border-light">
                      <td className="p-3">
                        <p className="font-bold">Auxiliary Decorator & Sound System Coordination</p>
                        <p className="text-[10px] text-gray-500">Allocated DJ setup, spot lighting controls, VIP sofa seating & canopy decor.</p>
                      </td>
                      <td className="p-3 text-center">1 Job</td>
                      <td className="p-3 text-right">{formatCurrency(bookingMatch.totalAmount / 1.18 * 0.3)}</td>
                      <td className="p-3 text-right">{formatCurrency(bookingMatch.totalAmount / 1.18 * 0.3)}</td>
                    </tr>
                    {/* Item 3: Generator Backup (Metered) */}
                    {selectedInvoice.generatorHours && selectedInvoice.generatorHours > 0 && selectedInvoice.generatorRate && selectedInvoice.generatorRate > 0 && (
                      <tr className="border-b border-border-light">
                        <td className="p-3">
                          <p className="font-bold">Silent Genset Backup Utility Charge</p>
                          <p className="text-[10px] text-gray-500">Operational generator backup power delivery (dual 70 kVA & 25 kVA units).</p>
                        </td>
                        <td className="p-3 text-center">{selectedInvoice.generatorHours} Hrs</td>
                        <td className="p-3 text-right">{formatCurrency(selectedInvoice.generatorRate / 1.18)}</td>
                        <td className="p-3 text-right">{formatCurrency((selectedInvoice.generatorHours * selectedInvoice.generatorRate) / 1.18)}</td>
                      </tr>
                    )}
                    {/* Item 4: Electricity Consumption (Metered) */}
                    {selectedInvoice.electricityUnits && selectedInvoice.electricityUnits > 0 && selectedInvoice.electricityRate && selectedInvoice.electricityRate > 0 && (
                      <tr className="border-b border-border-light">
                        <td className="p-3">
                          <p className="font-bold">Electricity Consumption Charges</p>
                          <p className="text-[10px] text-gray-500">Utility power consumed from grid meter during preparation and event slot.</p>
                        </td>
                        <td className="p-3 text-center">{selectedInvoice.electricityUnits} Units</td>
                        <td className="p-3 text-right">{formatCurrency(selectedInvoice.electricityRate / 1.18)}</td>
                        <td className="p-3 text-right">{formatCurrency((selectedInvoice.electricityUnits * selectedInvoice.electricityRate) / 1.18)}</td>
                      </tr>
                    )}
                    {/* Item 5: Custom Miscellaneous Cost */}
                    {selectedInvoice.miscCost && selectedInvoice.miscCost > 0 && (
                      <tr className="border-b border-border-light">
                        <td className="p-3">
                          <p className="font-bold">Miscellaneous & Custom Event Extras</p>
                          <p className="text-[10px] text-gray-500">{selectedInvoice.miscDescription || 'Additional miscellaneous charges'}</p>
                        </td>
                        <td className="p-3 text-center">1 Job</td>
                        <td className="p-3 text-right">{formatCurrency(selectedInvoice.miscCost / 1.18)}</td>
                        <td className="p-3 text-right">{formatCurrency(selectedInvoice.miscCost / 1.18)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Math GST summary */}
              <div className="flex flex-col sm:flex-row justify-between pt-6 border-t-2 border-purple-primary text-xs">
                {/* Method declaration */}
                <div className="max-w-xs space-y-1.5 text-gray-500">
                  <p className="font-bold text-dark">Terms & Conditions:</p>
                  <p>1. Payments are subject to 18% GST rules in Ahilyanagar municipality.</p>
                  <p>2. Dues must be settled 2 days prior to the wedding event.</p>
                </div>

                {/* Arithmetic totals list */}
                <div className="w-full sm:w-80 mt-4 sm:mt-0 space-y-2.5">
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Taxable Value (Subtotal):</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>CGST (9.0%):</span>
                    <span>{formatCurrency(selectedInvoice.cgstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>SGST (9.0%):</span>
                    <span>{formatCurrency(selectedInvoice.sgstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-purple-dark font-bold border-t border-border-light pt-2 text-sm">
                    <span>Grand Total (GST Inclusive):</span>
                    <span>{formatCurrency(selectedInvoice.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between text-green-700 font-bold">
                    <span>Advance Payments Deducted:</span>
                    <span>-{formatCurrency(selectedInvoice.advanceDeducted)}</span>
                  </div>
                  <div className="flex justify-between text-red-600 font-extrabold text-base border-t-2 border-purple-primary pt-2">
                    <span>Balance Dues:</span>
                    <span>{formatCurrency(selectedInvoice.balanceDue)}</span>
                  </div>
                </div>
              </div>

              {/* Payments ledger log list */}
              {paymentsMatch.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border-light no-print">
                  <h5 className="font-heading text-xs font-bold text-purple-dark uppercase tracking-wider mb-3">Recorded Transaction Receipts</h5>
                  <div className="space-y-2">
                    {paymentsMatch.map((pay) => (
                      <div key={pay.id} className="flex justify-between items-center p-3 bg-green-50/40 border border-green-200 rounded-lg text-xs">
                        <div>
                          <p className="font-bold text-green-800">{pay.paymentNumber}</p>
                          <span className="text-[10px] text-gray-400">
                            Cleared: {formatDate(pay.paymentDate.split('T')[0])} via {pay.paymentMethod}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-green-800">+{formatCurrency(pay.amount)}</p>
                          <p className="text-[9px] text-gray-500 italic max-w-[150px] truncate">{pay.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* COLLECT PAYMENT MODAL */}
      {isCollectOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-border-light shadow-luxury-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="p-5 border-b border-border-light bg-purple-dark text-white flex justify-between items-center">
              <div>
                <h4 className="font-heading text-sm font-bold">Collect Outstanding Dues</h4>
                <p className="text-[9px] text-purple-light uppercase">Logs receipt ledger immediately to invoice records</p>
              </div>
              <button onClick={() => setIsCollectOpen(false)} className="p-1 rounded-md text-purple-light hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCollectPayment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Dues Balance</label>
                <div className="p-3 bg-red-50 text-red-700 font-extrabold rounded-lg text-sm">
                  {formatCurrency(selectedInvoice.balanceDue)}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Collection Amount (Rs.) *</label>
                <input 
                  type="number" 
                  max={selectedInvoice.balanceDue}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-ivory/30 border border-border-light focus:outline-none focus:border-gold-primary rounded-lg text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Collection Channel *</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-xs"
                >
                  <option value="UPI">UPI (GooglePay / PhonePe)</option>
                  <option value="Razorpay">Razorpay Checkout Online</option>
                  <option value="Cash">Cash Handover</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                </select>
              </div>

              {/* UPI QR Code simulator */}
              {payMethod === 'UPI' && (
                <div className="border border-dashed border-border-light p-4 rounded-xl text-center space-y-3 bg-ivory/20">
                  <p className="text-[10px] font-semibold text-purple-primary">Generated UPI Payment QR Code</p>
                  
                  <button 
                    type="button"
                    onClick={() => setShowQr(!showQr)}
                    className="px-4 py-1.5 bg-white border border-border-light hover:border-gold-primary rounded text-[9px] font-bold flex items-center mx-auto"
                  >
                    <QrCode className="h-4 w-4 mr-1 text-gold-primary" />
                    Toggle QR Screen
                  </button>

                  {showQr && (
                    <div className="bg-white p-3 rounded border border-border-light inline-block shadow-sm">
                      {/* Simulated QR Code Canvas placeholder */}
                      <div className="h-32 w-32 bg-gray-100 flex items-center justify-center border border-dashed border-gray-300 font-semibold text-[10px]">
                        [UPI QR SCANNER]
                      </div>
                      <p className="text-[8px] text-gray-400 mt-2">Scan with GPay/PhonePe to pay Rs. {payAmount.toLocaleString('en-IN')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Razorpay checkout simulator */}
              {payMethod === 'Razorpay' && (
                <div className="border border-dashed border-border-light p-4 rounded-xl text-center space-y-3 bg-ivory/20">
                  <p className="text-[10px] font-semibold text-purple-primary">Razorpay checkout integration</p>
                  <button
                    type="button"
                    onClick={handleTriggerRazorpay}
                    className="px-4 py-1.5 bg-purple-primary text-white hover:bg-purple-dark rounded text-[9px] font-bold flex items-center mx-auto"
                  >
                    <CreditCard className="h-4 w-4 mr-1 text-gold-primary" />
                    Open Checkout Window
                  </button>

                  {showRazorpay && (
                    <div className="p-3 bg-white border border-border-light rounded text-[9px] font-semibold space-y-2">
                      <p className="text-green-700 font-semibold">✓ Razorpay Gateway Connected</p>
                      <p className="text-gray-400">Ref ID: <span className="text-dark font-bold font-sans">{payRef || 'Processing...'}</span></p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Transaction Ref / Cheque #</label>
                <input 
                  type="text" 
                  placeholder="e.g. TXN987654321" 
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3 py-2 bg-ivory/30 border border-border-light rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Collector Notes</label>
                <textarea 
                  rows={2} 
                  placeholder="Notes..."
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-ivory/30 border border-border-light rounded-lg text-xs"
                />
              </div>

              <div className="pt-4 border-t border-border-light flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setIsCollectOpen(false)}
                  className="px-4 py-2 bg-white text-gray-500 border border-border-light rounded hover:border-purple-primary text-[10px] font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-purple-primary text-white font-bold rounded border border-gold-primary/30 hover:bg-purple-dark text-[10px] shadow-sm"
                >
                  Record Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WHATSAPP / SMS SHARE DIALOG OVERLAY */}
      {shareType && selectedInvoice && customerMatch && bookingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-border-light shadow-luxury-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="p-5 border-b border-border-light bg-purple-dark text-white flex justify-between items-center">
              <div>
                <h4 className="font-heading text-sm font-bold capitalize">Share via {shareType}</h4>
                <p className="text-[9px] text-purple-light uppercase">Pre-compiles standard message automation templates</p>
              </div>
              <button onClick={() => setShareType(null)} className="p-1.5 rounded-lg text-purple-light hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-gray-500">
                The system has pre-compiled this template for <b>{customerMatch?.fullName}</b>. Click Send to trigger message dispatch.
              </p>

              <div className="bg-ivory p-4 rounded-xl border border-border-light text-[11px] font-mono whitespace-pre-wrap leading-relaxed text-gray-700">
                {shareType === 'whatsapp' ? (
                  `Namaskar ${customerMatch?.fullName},\n\nFriendly reminder from Bhagyalaxmi Lawns! Your invoice details for booking ${bookingMatch?.bookingNumber} are ready.\n\nGrand Total: Rs. ${selectedInvoice.grandTotal.toLocaleString('en-IN')}\nCleared Advance: Rs. ${selectedInvoice.advanceDeducted.toLocaleString('en-IN')}\nBalance Dues: Rs. ${selectedInvoice.balanceDue.toLocaleString('en-IN')}\n\nKindly clear dues by event date: ${formatDate(bookingMatch?.eventDate)}.\nInvoice URL: https://bhagyalaxmi.in/inv/${selectedInvoice.invoiceNumber}\n\nDhanyawad!\nBhagyalaxmi Lawns Team`
                ) : (
                  `Subject: Tax Invoice - Bhagyalaxmi Lawns [${selectedInvoice.invoiceNumber}]\n\nDear ${customerMatch?.fullName},\n\nPlease find attached the tax invoice details for your scheduled ${bookingMatch?.eventType} ceremony.\n\nSummary:\nSubtotal: Rs. ${selectedInvoice.subtotal.toLocaleString('en-IN')}\nGST (18%): Rs. ${selectedInvoice.totalGst.toLocaleString('en-IN')}\nGrand Total: Rs. ${selectedInvoice.grandTotal.toLocaleString('en-IN')}\nBalance Dues: Rs. ${selectedInvoice.balanceDue.toLocaleString('en-IN')}\n\nSincerely,\nAccountant Dept\nBhagyalaxmi Lawns`
                )}
              </div>

              <div className="pt-4 border-t border-border-light flex justify-end space-x-2">
                <button 
                  onClick={() => setShareType(null)}
                  className="px-4 py-2 bg-white text-gray-500 border border-border-light rounded hover:border-purple-primary text-[10px] font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    alert(`Message successfully dispatched via ${shareType} integration!`);
                    setShareType(null);
                  }}
                  className="px-5 py-2 bg-purple-primary text-white font-bold rounded border border-gold-primary/30 hover:bg-purple-dark text-[10px] shadow-sm flex items-center"
                >
                  <Send className="h-3.5 w-3.5 mr-1 text-gold-primary" />
                  Dispatch Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
