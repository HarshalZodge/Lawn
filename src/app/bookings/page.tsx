'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, FileText, User, MapPin, 
  Clock, IndianRupee, Eye, CheckCircle2, ChevronRight, X 
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { db } from '@/lib/mock-db';
import { Booking, Customer, Venue, Package, Service, Vendor, SlotType, BookingStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function BookingsManager() {
  // DB States
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [venueFilter, setVenueFilter] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for New Booking wizard
  const [customerId, setCustomerId] = useState('');
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  
  const [venueId, setVenueId] = useState('');
  const [eventType, setEventType] = useState('Wedding');
  const [eventDate, setEventDate] = useState('');
  const [slotType, setSlotType] = useState<SlotType>('Full Day Slot');
  const [guestCount, setGuestCount] = useState(500);
  const [packageId, setPackageId] = useState('');
  
  // Package additions toggles
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [decorationTheme, setDecorationTheme] = useState('');
  const [cateringVendorId, setCateringVendorId] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [advancePaid, setAdvancePaid] = useState(0);

  // Active calculator pricing variables
  const [calculatedBase, setCalculatedBase] = useState(0);
  const [calculatedAddons, setCalculatedAddons] = useState(0);
  const [calculatedGST, setCalculatedGST] = useState(0);
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [minAdvance, setMinAdvance] = useState(0);

  useEffect(() => {
    setBookings(db.getBookings());
    setCustomers(db.getCustomers());
    setVenues(db.getVenues());
    setPackages(db.getPackages());
    setServices(db.getServices());
    setVendors(db.getVendors());
  }, []);

  // Reset slot selection if Full Day is active and venue changes to Open Lawn (v2)
  useEffect(() => {
    if (venueId === 'v2' && slotType === 'Full Day Slot') {
      setSlotType('Evening Slot');
    }
  }, [venueId, slotType]);

  // Update prices on dependencies changes
  useEffect(() => {
    let base = 0;
    
    // 1. Get base venue price or package base price
    if (packageId && packageId !== 'custom') {
      const pkg = packages.find(p => p.id === packageId);
      base = pkg ? Number(pkg.basePrice) : 0;
    } else if (venueId) {
      if (venueId === 'v1') {
        base = 90000;
      } else if (venueId === 'v3') {
        base = 120000;
      } else if (venueId === 'v2') {
        if (slotType === 'Evening Slot') {
          base = 90000; // 90k night rate
        } else if (slotType === 'Full Day Slot') {
          base = 120000;
        } else {
          base = 60000; // 60k daytime
        }
      } else {
        const ven = venues.find(v => v.id === venueId);
        base = ven ? Number(ven.basePrice) : 0;
      }
    }

    // 2. Add selected addon services
    let addonsTotal = 0;
    selectedServices.forEach(srvId => {
      const srv = services.find(s => s.id === srvId);
      if (srv) {
        if (srv.category === 'Catering') {
          // Catering charges scale per guest
          addonsTotal += (Number(srv.defaultPrice) * guestCount);
        } else {
          addonsTotal += Number(srv.defaultPrice);
        }
      }
    });

    const grand = base + addonsTotal;
    const subtotal = Number((grand / 1.18).toFixed(2));
    const gst = Number((grand - subtotal).toFixed(2));
    const minAdv = Number((grand * 0.30).toFixed(2)); // 30% advance deposit required

    setCalculatedBase(base);
    setCalculatedAddons(addonsTotal);
    setCalculatedGST(gst);
    setCalculatedTotal(grand);
    setMinAdvance(minAdv);
  }, [packageId, venueId, slotType, selectedServices, guestCount, packages, venues, services]);

  const toggleServiceAddon = (srvId: string) => {
    if (selectedServices.includes(srvId)) {
      setSelectedServices(selectedServices.filter(id => id !== srvId));
    } else {
      setSelectedServices([...selectedServices, srvId]);
    }
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!venueId || !eventDate || !slotType) {
      alert('Please fill out all required fields.');
      return;
    }

    let finalCustId = customerId;

    try {
      // 1. Create customer if new toggled
      if (isNewCustomer) {
        if (!newCustName || !newCustPhone) {
          alert('New customer name and phone are required.');
          return;
        }
        const createdCust = db.addCustomer({
          fullName: newCustName,
          phone: newCustPhone,
          email: newCustEmail || undefined,
          address: newCustAddress || undefined
        });
        finalCustId = createdCust.id;
      }

      if (!finalCustId) {
        alert('Please select or register a customer.');
        return;
      }

      // 2. Submit booking (checks overlaps automatically inside mock-db!)
      const createdBkg = db.addBooking({
        customerId: finalCustId,
        venueId,
        packageId: packageId || undefined,
        eventType,
        eventDate,
        slotType,
        guestCount,
        decorationTheme: decorationTheme || undefined,
        cateringVendorId: cateringVendorId || undefined,
        specialRequests: specialRequests || undefined,
        totalAmount: calculatedTotal,
        advancePaid: Number(advancePaid),
        status: Number(advancePaid) === 0 ? 'Pending' : (Number(advancePaid) >= calculatedTotal ? 'Confirmed' : 'Advance Paid')
      });

      // Update state
      setBookings(db.getBookings());
      setCustomers(db.getCustomers());
      
      // Reset form & close modal
      setIsModalOpen(false);
      resetForm();
      alert(`Booking ${createdBkg.bookingNumber} successfully created! Invoice and operations checklists have been auto-generated.`);
    } catch (err: any) {
      alert(err.message || 'Double booking collision occurred.');
    }
  };

  const resetForm = () => {
    setCustomerId('');
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewCustAddress('');
    setIsNewCustomer(false);
    setVenueId('');
    setEventType('Wedding');
    setEventDate('');
    setSlotType('Full Day Slot');
    setGuestCount(500);
    setPackageId('');
    setSelectedServices([]);
    setDecorationTheme('');
    setCateringVendorId('');
    setSpecialRequests('');
    setAdvancePaid(0);
  };

  // Filter Bookings list
  const filteredBookings = bookings.filter((b) => {
    const cust = customers.find(c => c.id === b.customerId);
    const ven = venues.find(v => v.id === b.venueId);
    
    const matchesSearch = 
      b.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust?.phone.includes(searchQuery) ||
      b.eventType.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchesVenue = venueFilter === 'All' || b.venueId === venueFilter;

    return matchesSearch && matchesStatus && matchesVenue;
  });

  return (
    <DashboardLayout>
      {/* Bookings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h3 className="font-heading text-2xl font-bold text-purple-dark">Ceremony Bookings Registry</h3>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Register and schedule events, build custom packages, and verify double-booking prevention timelines.
          </p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-2.5 bg-purple-primary text-white text-xs font-bold rounded-lg border border-gold-primary/30 hover:bg-purple-dark shadow-md"
        >
          <Plus className="mr-1.5 h-4.5 w-4.5 text-gold-primary" />
          Schedule Event
        </button>
      </div>

      {/* Searching and Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-border-light shadow-luxury mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search by ID, customer name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-ivory/50 border border-border-light focus:outline-none focus:border-gold-primary rounded-lg text-xs"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-ivory/50 border border-border-light focus:outline-none focus:border-gold-primary rounded-lg text-xs text-dark"
          >
            <option value="All">All Booking Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Advance Paid">Advance Paid</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Venue Filter */}
        <div className="relative">
          <select
            value={venueFilter}
            onChange={(e) => setVenueFilter(e.target.value)}
            className="w-full px-3 py-2 bg-ivory/50 border border-border-light focus:outline-none focus:border-gold-primary rounded-lg text-xs text-dark"
          >
            <option value="All">All Venue Zones</option>
            {venues.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookings Ledger Table */}
      <div className="bg-white rounded-2xl border border-border-light shadow-luxury overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-dark border-collapse">
            <thead>
              <tr className="bg-purple-dark text-white font-heading font-semibold tracking-wider border-b border-border-light">
                <th className="p-4">Booking ID</th>
                <th className="p-4">Date & Slot</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Venue & Package</th>
                <th className="p-4">Guests</th>
                <th className="p-4 text-right">Total Price</th>
                <th className="p-4 text-right">Paid Balance</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500 italic">
                    No bookings found matching query.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const cust = customers.find(c => c.id === b.customerId);
                  const ven = venues.find(v => v.id === b.venueId);
                  const pkg = packages.find(p => p.id === b.packageId);

                  return (
                    <tr key={b.id} className="border-b border-border-light hover:bg-ivory/30 transition-colors">
                      <td className="p-4 font-bold text-purple-primary">{b.bookingNumber}</td>
                      <td className="p-4">
                        <p className="font-semibold">{formatDate(b.eventDate)}</p>
                        <span className="text-[10px] text-gray-400">{b.slotType}</span>
                      </td>
                      <td className="p-4">
                        <p className="font-bold">{cust?.fullName}</p>
                        <p className="text-[10px] text-gray-400">{cust?.phone}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-purple-dark">{ven?.name}</p>
                        <span className="text-[10px] bg-purple-light/40 text-purple-primary px-1.5 py-0.5 rounded font-medium">
                          {b.eventType} ({pkg?.name || 'Custom Package'})
                        </span>
                      </td>
                      <td className="p-4 font-medium">{b.guestCount} Pax</td>
                      <td className="p-4 text-right font-extrabold text-purple-dark">
                        {formatCurrency(b.totalAmount)}
                      </td>
                      <td className="p-4 text-right font-medium text-gray-500">
                        <p className="text-green-700 font-bold">{formatCurrency(b.advancePaid)}</p>
                        <p className="text-[10px] text-red-500">Due: {formatCurrency(b.balanceAmount)}</p>
                      </td>
                      <td className="p-4 text-center">
                        <span className={cn(
                          "inline-block px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase",
                          b.status === 'Confirmed' ? "bg-green-100 text-green-800" :
                          b.status === 'Advance Paid' ? "bg-amber-100 text-amber-800" :
                          b.status === 'Completed' ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                        )}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW BOOKING WIZARD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-4xl bg-white rounded-2xl border border-border-light shadow-luxury-lg overflow-hidden max-h-[90vh] flex flex-col justify-between animate-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="p-5 border-b border-border-light bg-purple-dark text-white flex justify-between items-center">
              <div>
                <h4 className="font-heading text-lg font-bold">Bhagyalaxmi Ceremony Scheduler</h4>
                <p className="text-[10px] text-purple-light uppercase mt-0.5">Operates package billing calculator and slot conflicts checker</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-purple-light hover:text-white hover:bg-purple-primary/40">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateBooking} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Customer Registration & Venue Details */}
              <div className="space-y-5">
                <h5 className="font-heading text-xs font-bold text-purple-primary uppercase tracking-wider">Step 1: Customer Profile</h5>
                
                {/* Toggle New / Existing customer */}
                <div className="flex bg-ivory p-1 rounded-lg border border-border-light text-xs font-bold">
                  <button 
                    type="button" 
                    onClick={() => setIsNewCustomer(false)}
                    className={cn("flex-1 py-1.5 rounded-md", !isNewCustomer ? "bg-purple-primary text-white" : "text-gray-500")}
                  >
                    Select Registered Customer
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsNewCustomer(true)}
                    className={cn("flex-1 py-1.5 rounded-md", isNewCustomer ? "bg-purple-primary text-white" : "text-gray-500")}
                  >
                    Register New Customer
                  </button>
                </div>

                {!isNewCustomer ? (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Select Customer</label>
                    <select
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      className="w-full px-3 py-2 bg-ivory/30 border border-border-light rounded-lg text-xs"
                      required={!isNewCustomer}
                    >
                      <option value="">-- Choose Registered Contact --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 bg-ivory/30 border border-border-light rounded-xl">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Full Name *</label>
                      <input 
                        type="text" 
                        required 
                        value={newCustName}
                        onChange={(e) => setNewCustName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-border-light focus:outline-none focus:border-gold-primary rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Phone *</label>
                      <input 
                        type="tel" 
                        required 
                        value={newCustPhone}
                        onChange={(e) => setNewCustPhone(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-border-light focus:outline-none focus:border-gold-primary rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email</label>
                      <input 
                        type="email" 
                        value={newCustEmail}
                        onChange={(e) => setNewCustEmail(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-border-light focus:outline-none focus:border-gold-primary rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Address</label>
                      <textarea 
                        rows={2} 
                        value={newCustAddress}
                        onChange={(e) => setNewCustAddress(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-border-light focus:outline-none focus:border-gold-primary rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}

                <h5 className="font-heading text-xs font-bold text-purple-primary uppercase tracking-wider pt-2">Step 2: Ceremony Timeline</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Ceremony Category</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-xs"
                    >
                      <option value="Wedding">Wedding</option>
                      <option value="Reception">Reception</option>
                      <option value="Engagement">Engagement</option>
                      <option value="Haldi">Haldi</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Corporate">Corporate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Event Date *</label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-border-light rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Venue Zone *</label>
                    <select
                      value={venueId}
                      onChange={(e) => setVenueId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-xs"
                      required
                    >
                      <option value="">-- Choose Venue Area --</option>
                      {venues.map(v => (
                        <option key={v.id} value={v.id}>{v.name} (Max {v.capacity} Pax)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Time Slot *</label>
                    <select
                      value={slotType}
                      onChange={(e) => setSlotType(e.target.value as SlotType)}
                      className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-xs"
                    >
                      {venueId !== 'v2' && <option value="Full Day Slot">Full Day Slot</option>}
                      <option value="Morning Slot">Morning Slot</option>
                      <option value="Evening Slot">Evening Slot</option>
                      <option value="Afternoon Slot">Afternoon Slot</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Guest Scale Count</label>
                    <input
                      type="number"
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-border-light rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Decor Theme Choice</label>
                    <input
                      type="text"
                      placeholder="e.g. Royal Marigold"
                      value={decorationTheme}
                      onChange={(e) => setDecorationTheme(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-border-light rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Package Builder & Dynamic Estimator */}
              <div className="space-y-5 border-l border-border-light pl-0 md:pl-6">
                <h5 className="font-heading text-xs font-bold text-purple-primary uppercase tracking-wider">Step 3: Heritage Package & Addons</h5>
                
                {/* Select Base Package */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Heritage Package Choice</label>
                  <select
                    value={packageId}
                    onChange={(e) => {
                      setPackageId(e.target.value);
                      if (e.target.value !== 'custom') {
                        // Pre-populate package services
                        const pkg = packages.find(p => p.id === e.target.value);
                        setSelectedServices(pkg ? pkg.includedServices : []);
                      } else {
                        setSelectedServices([]);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-border-light focus:outline-none focus:border-gold-primary rounded-lg text-xs"
                  >
                    <option value="">-- Choose Package (Or custom venue base) --</option>
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.basePrice)})</option>
                    ))}
                    <option value="custom">Custom Build (Individual Services)</option>
                  </select>
                </div>

                {/* Additional services selection checklist */}
                <div className="bg-ivory/50 p-4 rounded-xl border border-border-light space-y-3">
                  <p className="text-[10px] font-bold text-purple-dark uppercase tracking-wider">Configure Auxiliary Services</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {services.map((srv) => {
                      const isChecked = selectedServices.includes(srv.id);
                      return (
                        <button
                          type="button"
                          key={srv.id}
                          onClick={() => toggleServiceAddon(srv.id)}
                          className={cn(
                            "p-2 text-left rounded-lg border transition-all flex items-center justify-between",
                            isChecked 
                              ? "bg-purple-light/20 border-purple-primary font-bold text-purple-primary" 
                              : "bg-white border-border-light text-gray-600 hover:border-gold-primary"
                          )}
                        >
                          <span className="truncate max-w-[120px]">{srv.name}</span>
                          <span className="text-[9px] font-semibold text-gold-dark">
                            {srv.category === 'Catering' ? `${formatCurrency(srv.defaultPrice)}/head` : formatCurrency(srv.defaultPrice)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pricing Live Matrix Output */}
                <div className="bg-purple-dark text-white p-5 rounded-xl border border-gold-primary/20 space-y-3 shadow-luxury relative overflow-hidden">
                  <div className="absolute top-0 right-0 left-0 h-0.5 gold-shimmer"></div>
                  <h6 className="font-heading text-xs font-bold text-gold-primary uppercase tracking-wider">Estimated Invoice Breakdown</h6>
                  
                  <div className="text-xs space-y-1.5">
                    <div className="flex justify-between text-purple-light">
                      <span>Venue/Package Base Rate:</span>
                      <span>{formatCurrency(calculatedBase)}</span>
                    </div>
                    <div className="flex justify-between text-purple-light">
                      <span>Auxiliary Addons Total:</span>
                      <span>{formatCurrency(calculatedAddons)}</span>
                    </div>
                    <div className="flex justify-between text-purple-light">
                      <span>GST (18% inclusive):</span>
                      <span>{formatCurrency(calculatedGST)}</span>
                    </div>
                    <div className="flex justify-between text-gold-primary font-bold border-t border-purple-primary pt-2 text-sm">
                      <span>Estimated Grand Total:</span>
                      <span>{formatCurrency(calculatedTotal)}</span>
                    </div>
                  </div>

                  <div className="border-t border-purple-primary pt-2.5 space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] text-yellow-100 font-semibold bg-white/5 p-2 rounded">
                      <span>Min. 30% Booking Deposit:</span>
                      <span className="font-bold text-xs text-gold-primary">{formatCurrency(minAdvance)}</span>
                    </div>
                    
                    <div>
                      <label className="block text-[9px] font-bold text-purple-light uppercase mb-1">Advance Amount Received (Rs.)</label>
                      <input
                        type="number"
                        min="0"
                        value={advancePaid}
                        onChange={(e) => setAdvancePaid(Number(e.target.value))}
                        className="w-full px-3 py-1 bg-white text-dark rounded-lg text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </form>

            {/* Modal Actions */}
            <div className="p-5 border-t border-border-light bg-ivory flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-white text-gray-500 text-xs font-bold border border-border-light rounded-lg hover:border-purple-primary transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateBooking}
                className="px-5 py-2 bg-purple-primary text-white text-xs font-bold rounded-lg border border-gold-primary/30 hover:bg-purple-dark shadow-md"
              >
                Confirm Ceremony Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
