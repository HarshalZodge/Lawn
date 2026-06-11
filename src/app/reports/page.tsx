'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Calendar, FileText, Download, 
  IndianRupee, ChevronRight, CheckCircle2, Award, Briefcase 
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { db } from '@/lib/mock-db';
import { Booking, Payment, Invoice, Expense, Customer, Package, Vendor } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function ReportsCenter() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    setBookings(db.getBookings());
    setPayments(db.getPayments());
    setInvoices(db.getInvoices());
    setExpenses(db.getExpenses());
    setCustomers(db.getCustomers());
    setPackages(db.getPackages());
    setVendors(db.getVendors());
  }, []);

  // ----------------------------------------------------
  // ARITHMETIC COMPILATION FOR P&L (June 2026 / YTD)
  // ----------------------------------------------------
  const grossRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const netProfit = grossRevenue - totalExpenses;

  // Space stats
  const totalEventsCount = bookings.filter(b => b.status !== 'Cancelled').length;
  
  // Package popular ranking
  const packageStats = packages.map(pkg => {
    const count = bookings.filter(b => b.packageId === pkg.id && b.status !== 'Cancelled').length;
    return { name: pkg.name, count, price: pkg.basePrice };
  }).sort((a, b) => b.count - a.count);

  // Vendor payouts
  const vendorStats = vendors.map(v => {
    const count = bookings.filter(b => b.cateringVendorId === v.id && b.status !== 'Cancelled').length;
    return { name: v.businessName || v.name, category: v.category, count };
  }).sort((a, b) => b.count - a.count);

  // ----------------------------------------------------
  // MOCK CSV EXPORTER UTILITY
  // ----------------------------------------------------
  const triggerCsvExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Header Row
    csvContent += "Booking ID,Customer,Event Type,Date,Status,Total Amount,Advance Paid,Balance Dues\n";
    
    // Data Rows
    bookings.forEach(b => {
      const cust = customers.find(c => c.id === b.customerId);
      const row = `${b.bookingNumber},"${cust?.fullName || 'N/A'}",${b.eventType},${b.eventDate},${b.status},${b.totalAmount},${b.advancePaid},${b.balanceAmount}`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bhagyalaxmi_Bookings_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      {/* Reports Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h3 className="font-heading text-2xl font-bold text-purple-dark">Financial & Analytics Center</h3>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Generate Profit & Loss worksheets, review venue utilization margins, and export reports for tax compliance.
          </p>
        </div>
        
        {/* Export triggers */}
        <div className="mt-4 sm:mt-0 flex gap-2">
          <button 
            onClick={triggerCsvExport}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-purple-primary text-white text-xs font-bold rounded-lg border border-gold-primary/30 hover:bg-purple-dark shadow-md"
          >
            <Download className="mr-1.5 h-4 w-4 text-gold-primary" />
            Export CSV Dataset
          </button>
          <button 
            onClick={() => alert('Exporting visual charts directly to Microsoft Excel format...')}
            className="px-4 py-2.5 bg-white text-purple-primary border border-border-light text-xs font-bold rounded-lg hover:border-gold-primary transition-all shadow-sm"
          >
            Export Excel Sheet
          </button>
        </div>
      </div>

      {/* Grid: Profit & Loss Statement | Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profit & Loss Statement Card (Takes 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-border-light shadow-luxury">
            <h4 className="font-heading text-base font-bold text-purple-dark mb-6 flex items-center">
              <IndianRupee className="h-5 w-5 mr-1.5 text-gold-primary animate-pulse" />
              YTD Profit & Loss Sheet (Compiled June 2026)
            </h4>

            {/* Matrix totals */}
            <div className="grid grid-cols-3 gap-4 text-center text-xs mb-8">
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <span className="text-gray-400 block font-medium">Gross Cash Inflows</span>
                <span className="font-extrabold text-green-700 text-base mt-1 block">
                  {formatCurrency(grossRevenue)}
                </span>
              </div>
              <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                <span className="text-gray-400 block font-medium">Total Cash Outflows</span>
                <span className="font-extrabold text-red-600 text-base mt-1 block">
                  -{formatCurrency(totalExpenses)}
                </span>
              </div>
              <div className="bg-purple-light/20 p-4 rounded-xl border border-purple-primary/25">
                <span className="text-gray-400 block font-medium">Net Profit Margin</span>
                <span className="font-extrabold text-purple-primary text-base mt-1 block">
                  {formatCurrency(netProfit)}
                </span>
              </div>
            </div>

            {/* Details Ledger breakdown */}
            <div className="space-y-4">
              <h5 className="font-heading text-xs font-extrabold text-purple-dark uppercase tracking-wider border-b border-border-light pb-2">
                Cash Flow Audits details
              </h5>

              <div className="text-xs space-y-3">
                <div className="flex justify-between items-center p-3 bg-ivory/30 rounded-lg">
                  <div>
                    <p className="font-bold">Total Booking Invoices Issued</p>
                    <span className="text-[10px] text-gray-400">Excludes cancelled dates</span>
                  </div>
                  <span className="font-extrabold text-dark">{totalEventsCount} Items</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-ivory/30 rounded-lg">
                  <div>
                    <p className="font-bold">Total GST Tax Collected (18% inclusive)</p>
                    <span className="text-[10px] text-gray-400">9% CGST + 9% SGST</span>
                  </div>
                  <span className="font-extrabold text-dark">
                    {formatCurrency(grossRevenue - (grossRevenue / 1.18))}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-ivory/30 rounded-lg">
                  <div>
                    <p className="font-bold">Outstanding Receivables Ledger</p>
                    <span className="text-[10px] text-gray-400">Current dues from pending events</span>
                  </div>
                  <span className="font-extrabold text-red-600">
                    {formatCurrency(invoices.reduce((sum, inv) => sum + Number(inv.balanceDue), 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Popular packages & vendor statistics */}
        <div className="space-y-6">
          {/* Top Packages */}
          <div className="bg-white p-5 rounded-2xl border border-border-light shadow-luxury space-y-4">
            <h4 className="font-heading text-sm font-bold text-purple-dark flex items-center">
              <Award className="h-4.5 w-4.5 mr-1.5 text-gold-primary" />
              Popular Packages Niche
            </h4>

            <div className="space-y-3">
              {packageStats.map((pkg, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-ivory/40 border border-border-light rounded-xl text-xs">
                  <div>
                    <p className="font-bold text-purple-dark">{pkg.name}</p>
                    <span className="text-[10px] text-gray-400">Base rate: {formatCurrency(pkg.price)}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-purple-primary bg-purple-light/40 px-2 py-0.5 rounded text-[10px]">
                      {pkg.count} bookings
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Vendor usage */}
          <div className="bg-white p-5 rounded-2xl border border-border-light shadow-luxury space-y-4">
            <h4 className="font-heading text-sm font-bold text-purple-dark flex items-center">
              <Briefcase className="h-4.5 w-4.5 mr-1.5 text-gold-primary" />
              Top Contractors Allocation
            </h4>

            <div className="space-y-3">
              {vendorStats.map((v, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-ivory/40 border border-border-light rounded-xl text-xs">
                  <div>
                    <p className="font-bold text-purple-dark">{v.name}</p>
                    <span className="text-[10px] text-gray-400">Category: {v.category}</span>
                  </div>
                  <div className="text-right font-bold text-purple-primary">
                    <span>{v.count} assignments</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
