'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, User, Phone, Mail, MapPin, Calendar, 
  IndianRupee, ShieldCheck, History, Clock, BookOpen, FileText, ChevronRight 
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { db } from '@/lib/mock-db';
import { Customer, Booking, Payment, Document } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function CustomersCRM() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  // Selection details
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const custs = db.getCustomers();
    setCustomers(custs);
    setBookings(db.getBookings());
    setPayments(db.getPayments());
    setDocuments(db.getDocuments());
    
    if (custs.length > 0) {
      setSelectedCustomerId(custs[0].id);
    }
  }, []);

  const activeCustomer = customers.find(c => c.id === selectedCustomerId);
  
  // Calculations for active customer
  const customerBookings = bookings.filter(b => b.customerId === selectedCustomerId);
  const customerPayments = payments.filter(p => customerBookings.some(b => b.id === p.bookingId));
  const customerDocs = documents.filter(d => d.customerId === selectedCustomerId);

  const totalSpent = customerPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const activeDues = customerBookings
    .filter(b => b.status !== 'Cancelled' && b.status !== 'Completed')
    .reduce((sum, b) => sum + Number(b.balanceAmount), 0);

  // Search filter
  const filteredCustomers = customers.filter(c => 
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    (c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  return (
    <DashboardLayout>
      {/* CRM Header */}
      <div className="mb-8">
        <h3 className="font-heading text-2xl font-bold text-purple-dark">Customer CRM Directory</h3>
        <p className="text-xs text-gray-500 font-medium mt-1">
          Maintain profiles, track individual payment ledger histories, verify Aadhaar/PAN documentation, and audit operational timelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Search & Customer list */}
        <div className="bg-white p-5 rounded-2xl border border-border-light shadow-luxury flex flex-col h-[650px]">
          <div className="relative mb-4">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-ivory/50 border border-border-light focus:outline-none focus:border-gold-primary rounded-lg text-xs"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 scrollbar-thin">
            {filteredCustomers.length === 0 ? (
              <p className="text-xs text-gray-500 italic text-center py-8">No customers found.</p>
            ) : (
              filteredCustomers.map((c) => {
                const isSelected = c.id === selectedCustomerId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCustomerId(c.id)}
                    className={cn(
                      "w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between",
                      isSelected 
                        ? "bg-purple-light/30 border-purple-primary shadow-sm scale-[1.01]" 
                        : "bg-white border-border-light hover:border-gold-primary/30"
                    )}
                  >
                    <div>
                      <h4 className="font-heading text-xs font-bold text-purple-dark">{c.fullName}</h4>
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5">{c.phone}</p>
                    </div>
                    <ChevronRight className={cn("h-4 w-4 transition-transform", isSelected ? "text-purple-primary translate-x-0.5" : "text-gray-400")} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Columns: Profile details (Takes 2 grid spans) */}
        <div className="lg:col-span-2 space-y-6 overflow-y-auto max-h-[650px] pr-1.5 scrollbar-thin">
          {activeCustomer ? (
            <>
              {/* Profile Card Header */}
              <div className="bg-white p-6 rounded-2xl border border-border-light shadow-luxury relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-purple-primary to-gold-primary"></div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex items-center space-x-4">
                    <div className="h-14 w-14 bg-purple-primary text-white rounded-full flex items-center justify-center font-bold text-lg border-2 border-gold-primary/30 shadow-md">
                      {activeCustomer.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-purple-dark">{activeCustomer.fullName}</h3>
                      <p className="text-xs text-gray-400">Registered on {formatDate(activeCustomer.createdAt.split('T')[0])}</p>
                    </div>
                  </div>

                  {/* Financial Quick Glance */}
                  <div className="mt-4 sm:mt-0 flex gap-4 text-xs">
                    <div className="bg-green-50 p-2.5 rounded-lg border border-green-200">
                      <span className="text-gray-500 block">Total Payments</span>
                      <span className="font-bold text-green-700">{formatCurrency(totalSpent)}</span>
                    </div>
                    <div className="bg-red-50 p-2.5 rounded-lg border border-red-200">
                      <span className="text-gray-500 block">Current Dues</span>
                      <span className="font-bold text-red-600">{formatCurrency(activeDues)}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Specifics */}
                <div className="mt-6 pt-6 border-t border-border-light grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-purple-primary shrink-0" />
                    <span className="truncate">{activeCustomer.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-purple-primary shrink-0" />
                    <span className="truncate">{activeCustomer.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-purple-primary shrink-0" />
                    <span className="truncate">{activeCustomer.address || 'No address provided'}</span>
                  </div>
                </div>
              </div>

              {/* CRM Tabs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Booking History */}
                <div className="bg-white p-5 rounded-2xl border border-border-light shadow-luxury">
                  <h4 className="font-heading text-sm font-bold text-purple-dark mb-4 flex items-center">
                    <BookOpen className="h-4.5 w-4.5 mr-1.5 text-gold-primary" />
                    Ceremony History
                  </h4>

                  <div className="space-y-3">
                    {customerBookings.length === 0 ? (
                      <p className="text-xs text-gray-500 italic py-2">No bookings registered for this customer.</p>
                    ) : (
                      customerBookings.map((b) => (
                        <div key={b.id} className="p-3 bg-ivory/40 border border-border-light rounded-xl text-xs space-y-1.5">
                          <div className="flex justify-between font-bold">
                            <span className="text-purple-primary">{b.bookingNumber}</span>
                            <span>{b.eventType}</span>
                          </div>
                          <div className="text-[10px] text-gray-500 flex justify-between">
                            <span>Date: {formatDate(b.eventDate)}</span>
                            <span>Status: {b.status}</span>
                          </div>
                          <div className="text-[10px] flex justify-between pt-1 border-t border-dashed border-border-light font-semibold">
                            <span>Total Price:</span>
                            <span>{formatCurrency(b.totalAmount)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. Customer Documents */}
                <div className="bg-white p-5 rounded-2xl border border-border-light shadow-luxury">
                  <h4 className="font-heading text-sm font-bold text-purple-dark mb-4 flex items-center">
                    <ShieldCheck className="h-4.5 w-4.5 mr-1.5 text-gold-primary" />
                    Government ID & Contracts
                  </h4>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-ivory/40 border border-border-light rounded-xl">
                        <span className="text-[10px] text-gray-400 block">Aadhaar (UIDAI)</span>
                        <span className="font-bold text-dark">{activeCustomer.aadhaarNumber || 'Not Uploaded'}</span>
                      </div>
                      <div className="p-3 bg-ivory/40 border border-border-light rounded-xl">
                        <span className="text-[10px] text-gray-400 block">PAN (IT Dept)</span>
                        <span className="font-bold text-dark">{activeCustomer.panNumber || 'Not Uploaded'}</span>
                      </div>
                    </div>

                    {customerDocs.length > 0 && (
                      <div className="border-t border-border-light pt-3 space-y-2">
                        <p className="text-[10px] font-bold text-purple-dark uppercase tracking-wider mb-1">Attached Files</p>
                        {customerDocs.map(doc => (
                          <div key={doc.id} className="flex justify-between items-center p-2 bg-ivory/20 rounded border border-border-light text-[10px]">
                            <span className="truncate font-semibold text-gray-700">{doc.name}</span>
                            <span className="text-purple-primary font-bold uppercase shrink-0">{doc.category}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Customer Lifecycle Timeline */}
              <div className="bg-white p-6 rounded-2xl border border-border-light shadow-luxury">
                <h4 className="font-heading text-sm font-bold text-purple-dark mb-6 flex items-center">
                  <History className="h-4.5 w-4.5 mr-1.5 text-gold-primary" />
                  Lifecycle CRM Timeline
                </h4>

                <div className="relative border-l-2 border-purple-light ml-4 space-y-6">
                  {/* Item 1: Registration */}
                  <div className="relative pl-6">
                    <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-purple-primary border-2 border-white flex items-center justify-center shadow"></span>
                    <h5 className="text-xs font-bold text-purple-dark">Registered Account</h5>
                    <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(activeCustomer.createdAt.split('T')[0])}</p>
                    <p className="text-xs text-gray-600 mt-1">Profile record successfully logged in Bhagyalaxmi database registry.</p>
                  </div>

                  {/* Item 2: Booking actions */}
                  {customerBookings.map((b, i) => (
                    <div key={b.id} className="relative pl-6">
                      <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-gold-primary border-2 border-white flex items-center justify-center shadow"></span>
                      <h5 className="text-xs font-bold text-purple-dark">Initiated Booking: {b.bookingNumber}</h5>
                      <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(b.createdAt.split('T')[0])}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Scheduled venue slot for a <b>{b.eventType}</b> ceremony on <b>{formatDate(b.eventDate)}</b>. Total invoice price set to {formatCurrency(b.totalAmount)}.
                      </p>
                      
                      {/* Sub-timeline: Payment clears */}
                      {b.advancePaid > 0 && (
                        <div className="mt-3 bg-green-50/50 p-2.5 rounded-lg border border-green-200/50 text-xs">
                          <p className="font-semibold text-green-800">Payment Cleared: {formatCurrency(b.advancePaid)}</p>
                          <p className="text-[9px] text-gray-400">Advance deposit successfully registered to invoice.</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-border-light shadow-luxury text-center italic text-gray-500">
              Select a customer from the left sidebar to view details.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
