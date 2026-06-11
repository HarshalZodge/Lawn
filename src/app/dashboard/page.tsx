'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  IndianRupee, Calendar, FileText, CheckCircle2, TrendingUp, 
  Users, MapPin, ArrowUpRight, Zap, Play, PlusCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { db } from '@/lib/mock-db';
import { Booking, Payment, Profile } from '@/types';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

export default function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setBookings(db.getBookings());
    setPayments(db.getPayments());
    setCurrentUser(db.getCurrentUser());
    setMounted(true);
  }, []);

  if (!mounted || !currentUser) return null;

  // ----------------------------------------------------
  // METRICS CALCULATIONS
  // ----------------------------------------------------
  const activeBookings = bookings.filter(b => b.status !== 'Cancelled');
  
  // Total Revenue: sum of all payments
  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  
  // Pending Amount: balance on active bookings
  const pendingAmount = activeBookings.reduce((sum, b) => sum + Number(b.balanceAmount), 0);
  
  // Occupancy rate calculation (mock: active bookings / days in June 2026)
  const totalDaysInMonth = 30;
  const bookedDays = new Set(activeBookings.map(b => b.eventDate)).size;
  const occupancyRate = Math.round((bookedDays / totalDaysInMonth) * 100);

  // Venue Utilizations
  const hallBookings = activeBookings.filter(b => b.venueId === 'v1' || b.venueId === 'v3').length;
  const lawnBookings = activeBookings.filter(b => b.venueId === 'v2' || b.venueId === 'v3').length;
  const hallUtil = Math.round((hallBookings / totalDaysInMonth) * 100);
  const lawnUtil = Math.round((lawnBookings / totalDaysInMonth) * 100);

  // Today's Date is June 11, 2026
  const todayStr = '2026-06-11';
  const tomorrowStr = '2026-06-12';
  
  const todayEvents = bookings.filter(b => b.eventDate === todayStr && b.status !== 'Cancelled');
  const upcomingEvents = bookings
    .filter(b => b.eventDate > todayStr && b.status !== 'Cancelled')
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
    .slice(0, 4);

  const recentPayments = [...payments]
    .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))
    .slice(0, 4);

  // ----------------------------------------------------
  // CHARTS DATA
  // ----------------------------------------------------
  const revenueChartData = [
    { name: 'Jan', Revenue: 150000 },
    { name: 'Feb', Revenue: 220000 },
    { name: 'Mar', Revenue: 310000 },
    { name: 'Apr', Revenue: 180000 },
    { name: 'May', Revenue: 430000 }, // Seed payments sum here + past events
    { name: 'Jun (Est)', Revenue: totalRevenue },
  ];

  const venueChartData = [
    { name: 'Wedding Hall Only', value: activeBookings.filter(b => b.venueId === 'v1').length, color: '#5B2C6F' },
    { name: 'Open Lawn Only', value: activeBookings.filter(b => b.venueId === 'v2').length, color: '#0E6251' },
    { name: 'Combined Venue', value: activeBookings.filter(b => b.venueId === 'v3').length, color: '#C9A227' },
  ];

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between bg-white p-6 rounded-2xl border border-border-light shadow-luxury relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1 gold-shimmer"></div>
        <div>
          <h3 className="font-heading text-2xl font-bold text-purple-dark">
            Namaskar, {currentUser.fullName}!
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Bhagyalaxmi Lawns operational cockpit. Simulated Session: <span className="font-semibold text-purple-primary">{currentUser.role}</span>. Today is June 11, 2026.
          </p>
        </div>
        
        {/* Quick actions wrapper */}
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          {['Owner', 'Manager', 'Reception Staff', 'Super Admin'].includes(currentUser.role) && (
            <Link 
              href="/bookings" 
              className="inline-flex items-center px-4 py-2 bg-purple-primary text-white text-xs font-semibold rounded-lg hover:bg-purple-dark transition-all shadow-md border border-gold-primary/30"
            >
              <PlusCircle className="mr-1.5 h-4 w-4 text-gold-primary" />
              New Booking
            </Link>
          )}
          {['Owner', 'Accountant', 'Super Admin'].includes(currentUser.role) && (
            <Link 
              href="/finance" 
              className="inline-flex items-center px-4 py-2 bg-white text-purple-primary border border-border-light text-xs font-semibold rounded-lg hover:border-gold-primary transition-all shadow-sm"
            >
              <IndianRupee className="mr-1.5 h-4 w-4 text-gold-primary" />
              Collect Payment
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* 1. Total Revenue */}
        <div className="bg-white p-5 rounded-xl border border-border-light shadow-luxury hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-purple-primary"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</p>
              <h4 className="font-heading text-xl font-extrabold text-purple-dark mt-2">
                {formatCurrency(totalRevenue)}
              </h4>
            </div>
            <div className="p-2 bg-purple-primary/10 rounded-lg text-purple-primary">
              <IndianRupee className="h-5 w-5 text-gold-primary" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-[10px] text-green-primary font-semibold">
            <TrendingUp className="h-3.5 w-3.5 mr-1" />
            <span>+12.4% from last month</span>
          </div>
        </div>

        {/* 2. Total Bookings */}
        <div className="bg-white p-5 rounded-xl border border-border-light shadow-luxury hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-gold-primary"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Bookings</p>
              <h4 className="font-heading text-xl font-extrabold text-purple-dark mt-2">
                {activeBookings.length} Events
              </h4>
            </div>
            <div className="p-2 bg-gold-primary/10 rounded-lg text-gold-primary">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-[10px] text-gray-500">
            <span>Current Year Schedule</span>
          </div>
        </div>

        {/* 3. Pending Balance */}
        <div className="bg-white p-5 rounded-xl border border-border-light shadow-luxury hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-red-400"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Amount</p>
              <h4 className="font-heading text-xl font-extrabold text-purple-dark mt-2">
                {formatCurrency(pendingAmount)}
              </h4>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-500">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-[10px] text-red-500 font-semibold">
            <span>Dues verification required</span>
          </div>
        </div>

        {/* 4. Hall Utilization */}
        <div className="bg-white p-5 rounded-xl border border-border-light shadow-luxury hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-green-primary"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hall Utilization</p>
              <h4 className="font-heading text-xl font-extrabold text-purple-dark mt-2">
                {hallUtil}%
              </h4>
            </div>
            <div className="p-2 bg-green-55 rounded-lg text-green-primary">
              <MapPin className="h-5 w-5 text-gold-primary" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-[10px] text-green-primary">
            <span>Average: {bookedDays} booked dates</span>
          </div>
        </div>

        {/* 5. Lawn Utilization */}
        <div className="bg-white p-5 rounded-xl border border-border-light shadow-luxury hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-purple-primary"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lawn Utilization</p>
              <h4 className="font-heading text-xl font-extrabold text-purple-dark mt-2">
                {lawnUtil}%
              </h4>
            </div>
            <div className="p-2 bg-purple-light/50 rounded-lg text-purple-primary">
              <MapPin className="h-5 w-5 text-purple-primary" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-[10px] text-purple-primary">
            <span>Including combined venue bookings</span>
          </div>
        </div>
      </div>

      {/* Today's Operational Alerts */}
      {todayEvents.length > 0 && (
        <div className="bg-gold-light border border-gold-primary/30 p-5 rounded-xl mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gold-primary rounded-lg flex items-center justify-center text-purple-dark font-extrabold animate-bounce">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-purple-dark">Today's Live Events Alert</h4>
              <p className="text-xs text-gray-600">
                You have {todayEvents.length} events scheduled for today. Track setup status in the Event Operations center.
              </p>
            </div>
          </div>
          <Link 
            href="/operations"
            className="px-4 py-2 bg-purple-primary text-white text-xs font-bold rounded-lg hover:bg-purple-dark shadow-sm flex items-center"
          >
            <Play className="h-3 w-3 mr-1 text-gold-primary" />
            Launch Checklist
          </Link>
        </div>
      )}

      {/* Main Graphs Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Graph */}
        <div className="bg-white p-6 rounded-xl border border-border-light shadow-luxury lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-heading text-base font-bold text-purple-dark">Revenue Cash Flow Matrix</h4>
              <p className="text-xs text-gray-400">Monthly invoice aggregates and payouts</p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6DCC8" />
                <XAxis dataKey="name" stroke="#2C2C2C" fontSize={11} tickLine={false} />
                <YAxis stroke="#2C2C2C" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E6DCC8', fontFamily: 'Inter' }}
                  formatter={(value) => [`Rs. ${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Bar dataKey="Revenue" fill="#5B2C6F" radius={[4, 4, 0, 0]} maxBarSize={45}>
                  {revenueChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === revenueChartData.length - 1 ? '#C9A227' : '#5B2C6F'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Space Utilization Chart */}
        <div className="bg-white p-6 rounded-xl border border-border-light shadow-luxury">
          <h4 className="font-heading text-base font-bold text-purple-dark mb-1">Space Preferences</h4>
          <p className="text-xs text-gray-400 mb-6">Aggregate distribution of booking types</p>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={venueChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {venueChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Bookings`, 'Total']} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={10} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Tomorrow & Upcoming Events */}
        <div className="bg-white p-6 rounded-xl border border-border-light shadow-luxury">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-heading text-base font-bold text-purple-dark">Upcoming Ceremonies</h4>
            <Link href="/calendar" className="text-xs font-semibold text-purple-primary hover:text-purple-dark flex items-center">
              View Calendar
              <ArrowUpRight className="h-3.5 w-3.5 ml-1 text-gold-primary" />
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-4">No upcoming events scheduled.</p>
            ) : (
              upcomingEvents.map((evt) => {
                const customer = db.getCustomers().find(c => c.id === evt.customerId);
                const venue = db.getVenues().find(v => v.id === evt.venueId);
                const isTomorrow = evt.eventDate === tomorrowStr;

                return (
                  <div 
                    key={evt.id} 
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-colors",
                      isTomorrow ? "bg-purple-light/20 border-purple-primary/30" : "bg-ivory/30 border-border-light hover:border-gold-primary/30"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "h-12 w-12 rounded-lg flex flex-col items-center justify-center font-bold text-xs shadow-sm border",
                        isTomorrow ? "bg-purple-primary text-white border-gold-primary/30" : "bg-white text-purple-primary border-border-light"
                      )}>
                        <span className="text-[10px] uppercase font-sans">
                          {new Date(evt.eventDate).toLocaleDateString('en-IN', { month: 'short' })}
                        </span>
                        <span className="text-sm font-bold">
                          {new Date(evt.eventDate).toLocaleDateString('en-IN', { day: '2-digit' })}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-heading text-sm font-bold text-purple-dark">{evt.eventType}</span>
                          {isTomorrow && (
                            <span className="bg-gold-primary text-purple-dark text-[8px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">
                              Tomorrow
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Cust: {customer?.fullName || 'N/A'}</p>
                        <span className="text-[10px] text-gray-400 mt-1 inline-flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-gold-primary" />
                          {venue?.name} • {evt.slotType}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs font-bold text-dark">{formatCurrency(evt.totalAmount)}</p>
                      <span className={cn(
                        "inline-block text-[9px] px-2 py-0.5 rounded-full font-bold mt-1.5 tracking-wide",
                        evt.status === 'Confirmed' ? "bg-green-100 text-green-800" :
                        evt.status === 'Advance Paid' ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                      )}>
                        {evt.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Recent Payments ledger */}
        <div className="bg-white p-6 rounded-xl border border-border-light shadow-luxury">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-heading text-base font-bold text-purple-dark">Recent Audit Payments</h4>
            <Link href="/finance" className="text-xs font-semibold text-purple-primary hover:text-purple-dark flex items-center">
              All Invoices
              <ArrowUpRight className="h-3.5 w-3.5 ml-1 text-gold-primary" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentPayments.map((pay) => {
              const booking = bookings.find(b => b.id === pay.bookingId);
              const customer = booking ? db.getCustomers().find(c => c.id === booking.customerId) : null;

              return (
                <div 
                  key={pay.id} 
                  className="flex items-center justify-between p-4 bg-ivory/30 border border-border-light hover:border-gold-primary/30 rounded-xl transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center font-bold">
                      <CheckCircle2 className="h-5 w-5 text-green-primary" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-purple-dark">{pay.paymentNumber}</h5>
                      <p className="text-xs text-gray-500 font-medium">
                        {customer?.fullName || 'Walk-in Customer'}
                      </p>
                      <span className="text-[10px] text-gray-400">
                        {formatDate(pay.paymentDate.split('T')[0])} • {pay.paymentMethod}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-green-700">+{formatCurrency(pay.amount)}</p>
                    <p className="text-[10px] text-gray-400 italic truncate max-w-[120px]">{pay.notes}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
