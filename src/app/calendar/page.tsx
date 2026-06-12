'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, ChevronRight, Sparkles, User, MapPin, 
  Clock, Plus, Calendar as CalendarIcon, Eye, Trash2, Edit3 
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { db } from '@/lib/mock-db';
import { Booking, Customer, Venue, SlotType } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function VisualCalendar() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 11)); // June 11, 2026 (month index 5 is June)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  
  // Detail Drawer State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    setBookings(db.getBookings());
    setCustomers(db.getCustomers());
    setVenues(db.getVenues());
  }, []);

  // Helper: Get color class based on status/VIP status
  const getEventColors = (booking: Booking, customer: Customer | undefined) => {
    // VIP condition: guest count >= 2000 or customer notes contain VIP
    const isVip = booking.guestCount >= 2000 || (customer?.notes?.toLowerCase().includes('vip') ?? false);
    if (isVip) {
      return {
        bg: 'bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-900',
        dot: 'bg-purple-700',
        label: 'VIP Event'
      };
    }
    switch (booking.status) {
      case 'Confirmed':
        return { bg: 'bg-green-100 hover:bg-green-200 border-green-300 text-green-900', dot: 'bg-green-600', label: 'Confirmed' };
      case 'Advance Paid':
        return { bg: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-800', dot: 'bg-gold-primary', label: 'Advance Paid' };
      case 'Pending':
      default:
        return { bg: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-900', dot: 'bg-red-500', label: 'Pending' };
    }
  };

  // Generate calendar days for monthly view (June 2026)
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of June 2026 starts on Monday
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Prev month pad cells
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false
      });
    }
    // Current month cells
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    // Next month pad cells
    const totalCells = 42; // 6 rows
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    return days;
  };

  const calendarDays = getDaysInMonth(currentDate);

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDrawerOpen(true);
  };

  const handleDrawerCancelBooking = () => {
    if (!selectedBooking) return;
    const confirmCancel = window.confirm(`Are you sure you want to cancel booking ${selectedBooking.bookingNumber}?`);
    if (confirmCancel) {
      try {
        const updated = db.updateBooking(selectedBooking.id, { status: 'Cancelled' });
        setBookings(db.getBookings());
        setSelectedBooking(updated);
        alert(`Booking ${selectedBooking.bookingNumber} successfully cancelled.`);
        setIsDrawerOpen(false);
      } catch (err: any) {
        alert(err.message || 'Error occurred during cancellation.');
      }
    }
  };

  // Drag and drop simulation: Shifting booking date
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);

  const handleDragStart = (e: React.DragEvent, bkg: Booking) => {
    setDraggedBooking(bkg);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (!draggedBooking) return;
    
    const dateStr = targetDate.toISOString().split('T')[0];
    
    try {
      // Check if venue has slot overlap on target date
      const updated = db.updateBooking(draggedBooking.id, { eventDate: dateStr });
      setBookings(db.getBookings());
      
      // Update drawer if opened
      if (selectedBooking && selectedBooking.id === draggedBooking.id) {
        setSelectedBooking(updated);
      }
      
      // Success indicator
      db.addAuditLog(db.getCurrentUser().id, `Rescheduled Event ${draggedBooking.bookingNumber} to ${dateStr}`, 'bookings');
      alert(`Event ${draggedBooking.bookingNumber} successfully rescheduled to ${formatDate(dateStr)}!`);
    } catch (err: any) {
      alert(err.message || 'Double booking collision occurred.');
    } finally {
      setDraggedBooking(null);
    }
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Detailed Customer & Venue for Drawer
  const activeCustomer = customers.find(c => c.id === selectedBooking?.customerId);
  const activeVenue = venues.find(v => v.id === selectedBooking?.venueId);
  const eventStyles = selectedBooking ? getEventColors(selectedBooking, activeCustomer) : null;

  return (
    <DashboardLayout>
      {/* Calendar Header Control */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-5 rounded-2xl border border-border-light shadow-luxury mb-8">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-purple-primary/10 rounded-lg flex items-center justify-center text-purple-primary border border-purple-primary/20">
            <CalendarIcon className="h-5 w-5 text-gold-primary" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-purple-dark">
              {currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Bhagyalaxmi Lawn scheduling timelines. Drag events to reschedule dates.
            </p>
          </div>
        </div>

        {/* View Selection & Next/Prev Controls */}
        <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
          {/* View Mode Buttons */}
          <div className="flex bg-ivory p-1 rounded-lg border border-border-light">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-md transition-colors capitalize",
                  viewMode === mode 
                    ? "bg-purple-primary text-white shadow-sm" 
                    : "text-gray-500 hover:text-purple-primary"
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Month Steppers */}
          <div className="flex items-center space-x-1.5">
            <button 
              onClick={prevMonth}
              className="p-2 bg-ivory border border-border-light hover:border-gold-primary rounded-lg text-purple-primary hover:bg-white transition-all shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date(2026, 5, 11))}
              className="px-3 py-1.5 bg-ivory border border-border-light hover:border-gold-primary rounded-lg text-xs font-bold text-purple-primary transition-all shadow-sm"
            >
              Today
            </button>
            <button 
              onClick={nextMonth}
              className="p-2 bg-ivory border border-border-light hover:border-gold-primary rounded-lg text-purple-primary hover:bg-white transition-all shadow-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Calendar Views */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-border-light shadow-luxury overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-border-light bg-purple-dark text-white font-heading text-xs font-bold tracking-wider py-3.5 text-center">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 grid-rows-6 h-[720px] bg-border-light gap-[1px]">
            {calendarDays.map((cell, idx) => {
              const dateStr = cell.date.toISOString().split('T')[0];
              const cellBookings = bookings.filter(b => b.eventDate === dateStr && b.status !== 'Cancelled');
              const isToday = cell.date.getDate() === 11 && cell.date.getMonth() === 5 && cell.date.getFullYear() === 2026;

              return (
                <div
                  key={idx}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, cell.date)}
                  className={cn(
                    "bg-white p-2.5 flex flex-col justify-between transition-colors relative group min-w-0 min-h-0",
                    !cell.isCurrentMonth && "bg-gray-50/50 text-gray-400",
                    isToday && "bg-gold-light/40"
                  )}
                >
                  {/* Date Number */}
                  <div className="flex justify-between items-center mb-1">
                    <span className={cn(
                      "text-xs font-bold font-heading h-6 w-6 rounded-full flex items-center justify-center",
                      isToday ? "bg-gold-primary text-purple-dark border border-gold-dark" : "text-purple-dark"
                    )}>
                      {cell.date.getDate()}
                    </span>
                    {cellBookings.length > 0 && (
                      <span className="text-[9px] font-bold text-purple-primary/80 bg-purple-light/30 px-1 rounded">
                        {cellBookings.length} event{cellBookings.length > 1 && 's'}
                      </span>
                    )}
                  </div>

                  {/* List of event chips in this day */}
                  <div className="flex-1 overflow-y-auto space-y-1.5 mt-1 scrollbar-none">
                    {cellBookings.map((b) => {
                      const cust = customers.find(c => c.id === b.customerId);
                      const style = getEventColors(b, cust);

                      return (
                        <div
                          key={b.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, b)}
                          onClick={() => handleBookingClick(b)}
                          className={cn(
                            "p-1.5 rounded-lg border text-[10px] font-bold tracking-wide cursor-pointer select-none transition-all flex items-center shadow-xs",
                            style.bg
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5 shrink-0", style.dot)}></span>
                          <span className="truncate flex-1">{b.eventType} • {cust?.fullName.split(' ')[0]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week & Day views simulated nicely */}
      {viewMode !== 'month' && (
        <div className="bg-white rounded-2xl border border-border-light shadow-luxury p-8 text-center flex flex-col items-center justify-center h-96">
          <Sparkles className="h-12 w-12 text-gold-primary mb-4 animate-pulse" />
          <h4 className="font-heading text-lg font-bold text-purple-dark">Advanced Schedule Layout</h4>
          <p className="text-sm text-gray-500 max-w-md mt-1">
            The {viewMode} view displays all detailed vendor hours, slot alignments, and room schedules. Shift to <b>Month view</b> to drag bookings.
          </p>
          <button 
            onClick={() => setViewMode('month')} 
            className="mt-6 px-4 py-2 bg-purple-primary text-white text-xs font-bold rounded-lg border border-gold-primary/30 hover:bg-purple-dark shadow-md"
          >
            Go back to Month View
          </button>
        </div>
      )}

      {/* DETAIL DRAWER COMPONENT */}
      {isDrawerOpen && selectedBooking && activeCustomer && activeVenue && eventStyles && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay backdrop */}
          <div 
            className="absolute inset-0 bg-black/55 backdrop-blur-xs" 
            onClick={() => setIsDrawerOpen(false)}
          ></div>

          {/* Drawer Body */}
          <div className="relative w-full max-w-md bg-white h-full shadow-luxury-lg flex flex-col justify-between z-10 border-l border-border-light animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-border-light bg-purple-dark text-white relative">
              <div className="absolute top-0 right-0 left-0 h-1 gold-shimmer"></div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gold-primary">
                    Booking Detail Panel
                  </span>
                  <h4 className="font-heading text-xl font-bold text-white mt-1">
                    {selectedBooking.bookingNumber}
                  </h4>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-md text-purple-light hover:text-white hover:bg-purple-primary/40 text-sm font-bold"
                >
                  Close
                </button>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center space-x-2 mt-4">
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  eventStyles.dot
                )}></span>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-light">
                  {selectedBooking.status} ({eventStyles.label})
                </span>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer Info Card */}
              <div className="bg-ivory/50 p-4 rounded-xl border border-border-light space-y-3">
                <h5 className="font-heading text-xs font-extrabold text-purple-dark uppercase tracking-wider flex items-center">
                  <User className="h-4 w-4 mr-1.5 text-gold-primary" />
                  Customer Profile
                </h5>
                <div className="text-xs space-y-1.5">
                  <p className="font-bold text-dark text-sm">{activeCustomer.fullName}</p>
                  <p className="text-gray-500">Phone: <span className="font-semibold text-dark">{activeCustomer.phone}</span></p>
                  {activeCustomer.email && <p className="text-gray-500">Email: <span className="font-semibold text-dark">{activeCustomer.email}</span></p>}
                  {activeCustomer.address && <p className="text-gray-500">Address: <span className="font-semibold text-dark">{activeCustomer.address}</span></p>}
                  {activeCustomer.notes && (
                    <p className="text-purple-primary bg-purple-primary/5 p-2 rounded border border-purple-primary/10 mt-2 italic">
                      "{activeCustomer.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Booking Specifications */}
              <div className="space-y-4">
                <h5 className="font-heading text-xs font-extrabold text-purple-dark uppercase tracking-wider">
                  Event Settings
                </h5>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-border-light">
                    <p className="text-gray-400 font-medium">Event Type</p>
                    <p className="font-bold text-purple-primary text-sm mt-1">{selectedBooking.eventType}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-border-light">
                    <p className="text-gray-400 font-medium">Guest Count</p>
                    <p className="font-bold text-dark text-sm mt-1">{selectedBooking.guestCount} Pax</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-border-light">
                    <p className="text-gray-400 font-medium flex items-center">
                      <MapPin className="h-3 w-3 mr-1 text-gold-primary" /> Venue Space
                    </p>
                    <p className="font-bold text-dark mt-1">{activeVenue.name}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-border-light">
                    <p className="text-gray-400 font-medium flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-gold-primary" /> Selected Slot
                    </p>
                    <p className="font-bold text-dark mt-1">{selectedBooking.slotType}</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-border-light text-xs space-y-2.5">
                  <div>
                    <p className="text-gray-400 font-medium">Decoration Style Theme</p>
                    <p className="font-semibold text-dark">{selectedBooking.decorationTheme || 'Standard Decor Theme'}</p>
                  </div>
                  {selectedBooking.specialRequests && (
                    <div>
                      <p className="text-gray-400 font-medium">Special Coordinator Requests</p>
                      <p className="font-semibold text-dark">{selectedBooking.specialRequests}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Status Summary */}
              <div className="space-y-3">
                <h5 className="font-heading text-xs font-extrabold text-purple-dark uppercase tracking-wider">
                  Financial Settlement
                </h5>
                <div className="bg-white p-4 rounded-xl border border-border-light text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Event Grand Total:</span>
                    <span className="font-bold text-dark">{formatCurrency(selectedBooking.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Advance Cleared:</span>
                    <span className="font-bold text-green-700">{formatCurrency(selectedBooking.advancePaid)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border-light pt-2 font-bold">
                    <span className="text-purple-dark">Balance Due:</span>
                    <span className={selectedBooking.balanceAmount === 0 ? "text-green-700" : "text-red-600"}>
                      {formatCurrency(selectedBooking.balanceAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="p-6 border-t border-border-light bg-ivory flex flex-col space-y-2.5">
              <div className="flex space-x-3">
                <Link 
                  href="/finance" 
                  className="flex-1 py-2.5 bg-purple-primary text-white font-bold rounded-lg border border-gold-primary/30 text-xs text-center shadow-md hover:bg-purple-dark"
                >
                  Invoicing & Payments
                </Link>
                <Link
                  href="/operations"
                  className="flex-1 py-2.5 bg-white text-purple-primary font-bold rounded-lg border border-border-light text-xs text-center shadow-sm hover:border-gold-primary"
                >
                  Launch Checklists
                </Link>
              </div>
              {selectedBooking.status !== 'Cancelled' && selectedBooking.status !== 'Completed' && (
                <button
                  onClick={handleDrawerCancelBooking}
                  className="w-full py-2.5 bg-red-50 text-red-750 hover:bg-red-100 hover:text-red-800 font-bold rounded-lg border border-red-200 text-xs text-center transition-all cursor-pointer shadow-xs"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
