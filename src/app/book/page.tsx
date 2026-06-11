'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, MapPin, Phone, Mail, Clock, 
  Users, CheckCircle2, IndianRupee, ArrowRight, Star, 
  Map, Sparkles, ChevronLeft, ChevronRight, Check
} from 'lucide-react';
import { db } from '@/lib/mock-db';
import { Booking, Venue, Customer, SlotType } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function ClientBookingPortal() {
  // DB States
  const [venues, setVenues] = useState<Venue[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Selection States
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<SlotType>('Full Day Slot');

  // Client Details Form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [eventType, setEventType] = useState('Wedding');
  const [guestCount, setGuestCount] = useState(500);
  const [specialRequests, setSpecialRequests] = useState('');

  // Calendar Navigation
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 5, 1)); // Default June 2026

  // Submission Status
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  useEffect(() => {
    setVenues(db.getVenues());
    setBookings(db.getBookings());
    // Auto select first venue
    const vList = db.getVenues();
    if (vList.length > 0) {
      setSelectedVenueId(vList[0].id);
    }
  }, []);

  // Reset slot selection if Full Day is selected and venue changes to Open Lawn (v2)
  useEffect(() => {
    if (selectedVenueId === 'v2' && selectedSlot === 'Full Day Slot') {
      setSelectedSlot('Evening Slot');
    }
  }, [selectedVenueId, selectedSlot]);

  const selectedVenue = venues.find(v => v.id === selectedVenueId);

  // Month navigation helpers
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Generate calendar days for currentMonth
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Add empty slots for days before start of month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
      const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      days.push({
        day,
        dateString,
      });
    }
    
    return days;
  };

  // Check booking status for a specific date and slot
  const getDateBookingStatus = (dateString: string) => {
    if (!selectedVenueId) return { isAvailable: true, slotBooked: null };
    
    const dateBookings = bookings.filter(b => 
      b.venueId === selectedVenueId && 
      b.eventDate === dateString && 
      b.status !== 'Cancelled'
    );
    
    if (dateBookings.length === 0) {
      return { isAvailable: true, slotBooked: null };
    }
    
    const hasFullDay = dateBookings.some(b => b.slotType === 'Full Day Slot');
    if (hasFullDay) {
      return { isAvailable: false, slotBooked: 'Full Day' };
    }
    
    // If user has selected a specific slot, see if that slot is taken
    const isSlotTaken = dateBookings.some(b => b.slotType === selectedSlot);
    if (isSlotTaken) {
      return { isAvailable: false, slotBooked: selectedSlot };
    }

    return { isAvailable: true, slotBooked: 'Partial' };
  };

  // Price Calculation
  const calculateTotal = () => {
    if (!selectedVenue) return 0;
    
    // Custom pricing rules based on user requirements:
    // 1. Wedding Hall (v1): 90k flat base rate
    // 2. Combined Venue (v3): 120k flat base rate
    // 3. Open Lawn (v2): 90k ONLY at night (Evening Slot). Rented at 60k for daytime half-day slots, and 120k for full day slots.
    
    if (selectedVenue.id === 'v1') {
      return 90000;
    } else if (selectedVenue.id === 'v3') {
      return 120000;
    } else if (selectedVenue.id === 'v2') {
      if (selectedSlot === 'Evening Slot') {
        return 90000; // 90k night rate
      } else if (selectedSlot === 'Full Day Slot') {
        return 120000; // Full day lawn rate
      } else {
        return 60000; // Daytime half-day rate (60k)
      }
    }
    
    return selectedVenue.basePrice;
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVenueId || !selectedDate || !fullName || !phone) {
      alert('Please select a venue, an available date, and fill in your contact details.');
      return;
    }

    try {
      // 1. Add Customer (or find existing)
      const newCust = db.addCustomer({
        fullName,
        phone,
        email: email || undefined
      });

      // 2. Create Booking
      const totalAmount = calculateTotal();
      const newBooking = db.addBooking({
        customerId: newCust.id,
        venueId: selectedVenueId,
        eventType,
        eventDate: selectedDate,
        slotType: selectedSlot,
        guestCount: Number(guestCount),
        totalAmount,
        advancePaid: 50000, // standard advance
        status: 'Advance Paid', // simulating booking confirmation with advance deposit
        specialRequests: specialRequests || undefined
      });

      setBookings(db.getBookings());
      setBookingSuccess(newBooking.bookingNumber);
      
      // Reset selections
      setSelectedDate('');
      setFullName('');
      setPhone('');
      setEmail('');
      setSpecialRequests('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D2A26] font-sans">
      {/* Premium Luxury Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#EBE6DD] px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Bhagyalaxmi Logo" className="h-10 w-10 rounded-xl object-cover border border-[#EBE6DD]" />
          <div>
            <h1 className="font-heading text-base font-bold text-[#5C2D91] tracking-wide leading-none">Bhagyalaxmi Lawns</h1>
            <p className="text-[9px] text-gray-500 font-semibold uppercase tracking-widest leading-none mt-1">Bhingar, Ahilyanagar</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <a 
            href="https://maps.app.goo.gl/FHANGjMdyxaFv8Qm7" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center space-x-1.5 text-xs font-bold text-[#5C2D91] bg-[#5C2D91]/10 px-3 py-1.5 rounded-lg border border-[#5C2D91]/20 hover:bg-[#5C2D91] hover:text-white transition-all shadow-sm"
          >
            <MapPin className="h-3.5 w-3.5 text-[#E8C86C]" />
            <span className="hidden sm:inline">Venue Location Map</span>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 px-6 bg-gradient-to-b from-[#5C2D91]/5 to-transparent text-center border-b border-[#EBE6DD]">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-1 bg-[#E8C86C]/10 border border-[#E8C86C]/30 px-3 py-1 rounded-full text-xs font-bold text-[#8C6B2D]">
            <Sparkles className="h-3.5 w-3.5 text-[#E8C86C]" />
            <span>Book Your Auspicious Date</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#3d1a66]">
            Bhagyalaxmi Lawns & Banquet Hall
          </h2>
          <p className="text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
            Experience premium Maharashtrian wedding luxury. Select your venue, view live date availability, calculate total package pricing, and request your booking slot instantly.
          </p>
        </div>
      </section>

      {/* Booking Workspace */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {bookingSuccess ? (
          /* Success Screen */
          <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-[#EBE6DD] shadow-luxury text-center space-y-6 animate-in zoom-in duration-300">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center border-2 border-green-300 mx-auto">
              <CheckCircle2 className="h-10 w-10 text-green-600 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="font-heading text-xl font-bold text-[#5C2D91]">Booking Request Initiated!</h3>
              <p className="text-xs text-gray-500 font-medium">
                Your booking ID is <span className="font-bold text-[#2D2A26]">{bookingSuccess}</span>. An invoice and booking confirmation has been logged to our administrator cockpit.
              </p>
            </div>
            <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#EBE6DD] text-xs space-y-2 text-left">
              <p>• <b>Status:</b> Advance Payment Pending Verification</p>
              <p>• <b>Advance Amount:</b> {formatCurrency(50000)} (Standard Deposit)</p>
              <p>• <b>Representative:</b> Harshal Zodge / Kiran Zodge will contact you within 2 hours to verify details and finalize agreements.</p>
            </div>
            <button 
              onClick={() => setBookingSuccess(null)}
              className="w-full py-3 bg-[#5C2D91] text-white font-bold rounded-xl border border-[#E8C86C]/30 hover:bg-[#3d1a66] text-xs shadow-md"
            >
              Book Another Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: VENUE & CALENDAR AVAILABILITY (8 COLUMNS) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Venue Selector Cards */}
              <div className="space-y-4">
                <h3 className="font-heading text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center">
                  <Star className="h-4 w-4 mr-1.5 text-[#E8C86C] fill-[#E8C86C]" />
                  Step 1: Choose Your Celebration Venue
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {venues.map((venue) => {
                    const isSelected = venue.id === selectedVenueId;
                    return (
                      <button
                        key={venue.id}
                        onClick={() => {
                          setSelectedVenueId(venue.id);
                          setSelectedDate(''); // Reset selected date on venue change
                        }}
                        className={cn(
                          "bg-white p-5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 relative shadow-sm hover:shadow-md hover:scale-[1.01]",
                          isSelected 
                            ? "border-[#5C2D91] ring-2 ring-[#5C2D91]/25 bg-[#5C2D91]/5" 
                            : "border-[#EBE6DD] hover:border-gray-400"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 bg-[#5C2D91] text-white p-0.5 rounded-full">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        )}
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold text-[#8C6B2D] uppercase tracking-wider bg-[#E8C86C]/15 px-2 py-0.5 rounded">
                            Cap: {venue.capacity} guests
                          </span>
                          <h4 className="font-heading text-sm font-extrabold text-[#2D2A26] pt-1">
                            {venue.name}
                          </h4>
                          <p className="text-[10px] text-gray-500 leading-snug line-clamp-2">
                            {venue.description}
                          </p>
                        </div>
                        <div className="border-t border-[#EBE6DD] pt-3 mt-4 w-full flex justify-between items-center text-xs font-bold">
                          <span className="text-gray-400">Base Price</span>
                          <span className="text-[#5C2D91] text-sm">{formatCurrency(venue.basePrice)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slot Config & Polished Calendar Widget */}
              <div className="bg-white p-6 rounded-2xl border border-[#EBE6DD] shadow-luxury space-y-6">
                
                {/* Slot Selection */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#EBE6DD] pb-4 gap-4">
                  <div>
                    <h3 className="font-heading text-sm font-bold text-gray-500 uppercase tracking-widest">
                      Step 2: Config Booking Slot & Live Calendar
                    </h3>
                    <p className="text-[10px] text-gray-400 font-medium">Select your timeline to view matching date availability.</p>
                  </div>
                  
                  <div className="flex gap-2">
                    {['Morning Slot', 'Evening Slot', 'Full Day Slot']
                      .filter((slot) => !(selectedVenueId === 'v2' && slot === 'Full Day Slot'))
                      .map((slotOption) => {
                        const isActive = selectedSlot === slotOption;
                        return (
                          <button
                            key={slotOption}
                            type="button"
                            onClick={() => {
                              setSelectedSlot(slotOption as SlotType);
                              setSelectedDate(''); // Reset selected date when slot changes
                            }}
                            className={cn(
                              "px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all",
                              isActive 
                                ? "bg-[#5C2D91] text-white border-[#5C2D91]" 
                                : "bg-white border-[#EBE6DD] text-gray-600 hover:border-gray-400"
                            )}
                          >
                            {slotOption.replace(' Slot', '')}
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Calendar Grid Header */}
                <div className="flex justify-between items-center bg-[#FDFBF7] px-4 py-3 rounded-xl border border-[#EBE6DD]">
                  <button onClick={prevMonth} className="p-1 rounded-md hover:bg-gray-200">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="font-heading text-sm font-bold text-[#5C2D91]">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <button onClick={nextMonth} className="p-1 rounded-md hover:bg-gray-200">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Week Day Labels */}
                <div className="grid grid-cols-7 gap-1 text-center font-bold text-gray-400 text-[10px] uppercase tracking-wider">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {getDaysInMonth().map((dayData, idx) => {
                    if (!dayData) {
                      return <div key={`empty-${idx}`} className="aspect-square bg-transparent"></div>;
                    }
                    
                    const { day, dateString } = dayData;
                    const { isAvailable, slotBooked } = getDateBookingStatus(dateString);
                    const isSelected = selectedDate === dateString;
                    const isToday = new Date().toISOString().split('T')[0] === dateString;

                    return (
                      <button
                        key={dateString}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedDate(dateString)}
                        className={cn(
                          "aspect-square p-1 rounded-xl flex flex-col justify-between items-center transition-all relative border border-transparent text-xs",
                          !isAvailable 
                            ? "bg-red-50/50 border-red-100 text-red-400 cursor-not-allowed" 
                            : isSelected
                            ? "bg-[#5C2D91] text-white border-[#5C2D91] font-bold shadow-md hover:opacity-95"
                            : "bg-[#FDFBF7] hover:bg-white hover:border-[#E8C86C] text-[#2D2A26]",
                          isToday && !isSelected && "ring-1 ring-[#5C2D91]"
                        )}
                      >
                        <span className="font-bold self-start pl-1 text-[10px]">{day}</span>
                        
                        {/* Status Label inside Calendar Day cell */}
                        <span className="w-full text-center text-[7px] font-bold tracking-tight uppercase leading-none pb-1">
                          {!isAvailable ? (
                            <span className="text-red-500 font-extrabold block">Booked</span>
                          ) : isSelected ? (
                            <span className="text-[#E8C86C] block">Selected</span>
                          ) : (
                            <span className="text-green-700 font-extrabold block">Free</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Calendar Legend */}
                <div className="flex gap-4 text-[10px] font-bold text-gray-500 border-t border-[#EBE6DD] pt-4 justify-center">
                  <span className="flex items-center">
                    <span className="h-3 w-3 rounded bg-[#FDFBF7] border border-[#EBE6DD] mr-1.5"></span>
                    Available Date
                  </span>
                  <span className="flex items-center">
                    <span className="h-3 w-3 rounded bg-red-50 border border-red-100 mr-1.5"></span>
                    Fully Booked
                  </span>
                  <span className="flex items-center">
                    <span className="h-3 w-3 rounded bg-[#5C2D91] mr-1.5"></span>
                    Your Selection
                  </span>
                </div>

              </div>

              {/* Luxury Map Location Widget */}
              <div className="bg-white p-6 rounded-2xl border border-[#EBE6DD] shadow-luxury space-y-4">
                <h4 className="font-heading text-sm font-bold text-purple-dark flex items-center border-b border-[#EBE6DD] pb-3">
                  <Map className="h-4.5 w-4.5 mr-1.5 text-gold-primary" />
                  Venue Map Location Grid
                </h4>
                
                {/* Embed Map Iframe directly */}
                <div className="w-full h-64 bg-gray-100 rounded-xl overflow-hidden border border-[#EBE6DD] relative">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.2112440939527!2d74.77334771489975!3d19.098357087074218!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdcba657b9893d5%3A0xe54e6378e916ea0c!2sBhagyalaxmi%20Lawns!5e0!3m2!1sen!2sin!4v1654999999999!5m2!1sen!2sin" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={false} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center bg-[#FDFBF7] p-3 rounded-lg border border-[#EBE6DD] text-xs gap-3">
                  <div className="text-gray-500 font-medium text-center sm:text-left">
                    <b>Bhagyalaxmi Lawns:</b> Bhingar - Nagardeole road, Ahilyanagar, Maharashtra 414002
                  </div>
                  <a 
                    href="https://maps.app.goo.gl/FHANGjMdyxaFv8Qm7" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#5C2D91] text-white font-bold rounded-lg text-xs hover:bg-[#3d1a66] flex items-center shrink-0"
                  >
                    Open in Maps Application
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: BOOKING FORM CARD (4 COLUMNS) */}
            <div className="lg:col-span-4">
              <div className="bg-white p-6 rounded-2xl border border-[#EBE6DD] shadow-luxury sticky top-24 space-y-6">
                <div>
                  <h3 className="font-heading text-sm font-bold text-gray-500 uppercase tracking-widest">
                    Step 3: Event & Contact Info
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Please provide authentic details for verification checks.</p>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Abhijit Shinde"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 border border-[#EBE6DD] rounded-lg focus:outline-none focus:border-[#5C2D91] text-xs bg-[#FDFBF7]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Mobile Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 98220 12345"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-1.5 border border-[#EBE6DD] rounded-lg focus:outline-none focus:border-[#5C2D91] text-xs bg-[#FDFBF7]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="name@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-1.5 border border-[#EBE6DD] rounded-lg focus:outline-none focus:border-[#5C2D91] text-xs bg-[#FDFBF7]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Ceremony Category</label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="w-full px-3 py-1.5 border border-[#EBE6DD] rounded-lg bg-white focus:outline-none focus:border-[#5C2D91] text-xs"
                      >
                        <option value="Wedding">Wedding</option>
                        <option value="Reception">Reception</option>
                        <option value="Engagement">Engagement</option>
                        <option value="Haldi">Haldi Ceremony</option>
                        <option value="Birthday">Birthday Party</option>
                        <option value="Corporate">Corporate Meeting</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Est. Guest Count</label>
                      <input
                        type="number"
                        min="50"
                        max="5000"
                        value={guestCount}
                        onChange={(e) => setGuestCount(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-[#EBE6DD] rounded-lg focus:outline-none focus:border-[#5C2D91] text-xs bg-[#FDFBF7]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Selected Date & Slot</label>
                    <div className="p-3 bg-[#FDFBF7] border border-[#EBE6DD] rounded-lg space-y-1">
                      <p className="font-bold flex items-center text-purple-primary">
                        <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                        {selectedDate ? formatDate(selectedDate) : <span className="text-gray-400 font-normal italic">No date selected yet</span>}
                      </p>
                      <p className="text-[10px] text-gray-500 font-semibold flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1 text-gold-primary" />
                        Slot: {selectedSlot}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Special Requirements</label>
                    <textarea
                      placeholder="e.g. Specific floral theme, early bride room check-in."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-[#EBE6DD] rounded-lg focus:outline-none focus:border-[#5C2D91] text-xs resize-none bg-[#FDFBF7]"
                    />
                  </div>

                  {/* Price Estimator Card */}
                  <div className="p-4 bg-[#5C2D91]/5 rounded-xl border border-[#E8C86C]/30 space-y-3">
                    <h4 className="font-bold text-[#5C2D91] tracking-wide flex items-center text-xs">
                      <IndianRupee className="h-4 w-4 mr-1 text-[#E8C86C]" />
                      Cost Estimator Ledger
                    </h4>
                    
                    <div className="space-y-1.5 border-b border-dashed border-[#EBE6DD] pb-2 text-[10px] font-semibold text-gray-600">
                      <div className="flex justify-between">
                        <span>Venue Base Price:</span>
                        <span>{selectedVenue ? formatCurrency(selectedVenue.basePrice) : 'Select Venue'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Slot Adjusted Price:</span>
                        <span>{formatCurrency(calculateTotal())}</span>
                      </div>
                      <div className="flex justify-between text-green-700">
                        <span>Min. Advance to Confirm:</span>
                        <span>{formatCurrency(50000)}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center font-extrabold text-sm text-[#2D2A26]">
                      <span>Grand Total:</span>
                      <span className="text-lg text-[#5C2D91]">{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#5C2D91] text-white font-bold rounded-xl border border-[#E8C86C]/30 hover:bg-[#3d1a66] text-xs shadow-md flex items-center justify-center transition-colors"
                  >
                    <span>Request Booking Confirmation</span>
                    <ArrowRight className="h-4 w-4 ml-1 text-[#E8C86C]" />
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Luxury Footer */}
      <footer className="bg-[#2D2A26] text-white/70 py-12 px-6 border-t border-gray-800 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="space-y-2">
            <h5 className="font-heading text-sm font-bold text-white tracking-wide">Bhagyalaxmi Lawns</h5>
            <p className="leading-relaxed">Complete operations venue cockpit OS for banquet booking and logistics workflow control.</p>
          </div>
          <div className="space-y-2">
            <h5 className="font-heading text-sm font-bold text-white tracking-wide">Management Center</h5>
            <p>• Deepak Zodge (Owner & MD)</p>
            <p>• Harshal Zodge (Operations Manager)</p>
            <p>• Kiran Zodge (Finance Lead)</p>
          </div>
          <div className="space-y-2">
            <h5 className="font-heading text-sm font-bold text-white tracking-wide">Contact Details</h5>
            <p>Phone: +91 94222 12345</p>
            <p>Address: Bhingar - Nagardeole road, Ahilyanagar, Maharashtra</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
