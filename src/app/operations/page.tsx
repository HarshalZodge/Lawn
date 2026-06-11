'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckSquare, Activity, User, Clock, CheckCircle2, 
  MapPin, Play, AlertCircle, RefreshCw, BarChart2, ShieldAlert
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { db } from '@/lib/mock-db';
import { Booking, Customer, Venue, ChecklistTask, Profile } from '@/types';
import { cn } from '@/lib/utils';

export default function OperationsCenter() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [checklist, setChecklist] = useState<ChecklistTask[]>([]);
  const [staff, setStaff] = useState<Profile[]>([]);
  
  // Active selected booking for tracking
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');

  useEffect(() => {
    const bkgs = db.getBookings().filter(b => b.status !== 'Cancelled' && b.status !== 'Completed');
    setBookings(bkgs);
    setCustomers(db.getCustomers());
    setVenues(db.getVenues());
    setChecklist(db.getChecklist());
    setStaff(db.getProfiles().filter(p => p.role === 'Event Coordinator' || p.role === 'Staff' || p.role === 'Manager'));
    
    // Choose tomorrow's grand wedding as default if available
    const seedBkg = bkgs.find(b => b.bookingNumber === 'BL-202606-0001');
    if (seedBkg) {
      setSelectedBookingId(seedBkg.id);
    } else if (bkgs.length > 0) {
      setSelectedBookingId(bkgs[0].id);
    }
  }, []);

  const activeBooking = bookings.find(b => b.id === selectedBookingId);
  const activeCustomer = activeBooking ? customers.find(c => c.id === activeBooking.customerId) : null;
  const activeVenue = activeBooking ? venues.find(v => v.id === activeBooking.venueId) : null;

  // Filter tasks for selected booking
  const activeTasks = checklist.filter(task => task.bookingId === selectedBookingId);

  // Math completion calculations
  const totalTasks = activeTasks.length;
  const completedTasks = activeTasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = activeTasks.filter(t => t.status === 'In Progress').length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Group tasks by category
  const categories = Array.from(new Set(activeTasks.map(t => t.category)));

  // Handle task status update
  const handleTaskStatusChange = (taskId: string, newStatus: ChecklistTask['status']) => {
    try {
      db.updateChecklistTask(taskId, { status: newStatus });
      setChecklist(db.getChecklist());
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle staff allocation
  const handleAssignStaff = (taskId: string, staffId: string) => {
    try {
      db.updateChecklistTask(taskId, { assignedStaffId: staffId || undefined });
      setChecklist(db.getChecklist());
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <DashboardLayout>
      {/* Operations Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h3 className="font-heading text-2xl font-bold text-purple-dark">Operations Control Center</h3>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Wedding Day execution dashboard. Track checklists, allocate staff resources, and manage live backup utilities.
          </p>
        </div>
        
        {/* Active Ceremony Selector Dropdown */}
        <div className="mt-4 sm:mt-0 flex gap-2">
          <select
            value={selectedBookingId}
            onChange={(e) => setSelectedBookingId(e.target.value)}
            className="px-3 py-2 bg-white border border-border-light rounded-lg text-xs font-bold text-purple-primary shadow-sm focus:outline-none focus:border-gold-primary"
          >
            <option value="">-- Select Event Check-sheet --</option>
            {bookings.map(b => {
              const cust = customers.find(c => c.id === b.customerId);
              return (
                <option key={b.id} value={b.id}>
                  {b.bookingNumber} - {cust?.fullName} ({b.eventType})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {activeBooking && activeCustomer && activeVenue ? (
        <>
          {/* Live Progress Banner */}
          <div className="bg-white p-6 rounded-2xl border border-border-light shadow-luxury mb-8 grid grid-cols-1 md:grid-cols-4 gap-6 items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-purple-primary via-gold-primary to-green-primary"></div>
            
            {/* Ceremony Info */}
            <div className="md:col-span-2 space-y-1.5">
              <span className="text-[10px] bg-purple-primary/15 text-purple-primary border border-purple-primary/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                {activeBooking.eventType} Ceremony
              </span>
              <h4 className="font-heading text-xl font-bold text-purple-dark">
                {activeCustomer.fullName}'s Celebration
              </h4>
              <p className="text-xs text-gray-500 font-medium flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1 text-gold-primary" />
                {activeVenue.name} • {activeBooking.slotType} • Date: {activeBooking.eventDate}
              </p>
            </div>

            {/* Metrics */}
            <div className="text-center md:border-l border-border-light py-2">
              <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">Operational Status</span>
              <div className="flex items-center justify-center space-x-1.5 mt-2">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-ping"></div>
                <span className="text-sm font-bold text-purple-dark uppercase tracking-wider">
                  Live Setup Active
                </span>
              </div>
            </div>

            {/* Progress Circular/Bar */}
            <div className="md:border-l border-border-light pl-0 md:pl-6">
              <div className="flex justify-between items-center text-xs font-bold text-purple-dark mb-2">
                <span>Checklist Ready</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-ivory h-2.5 rounded-full overflow-hidden border border-border-light">
                <div 
                  className="bg-green-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-gray-400 mt-1 block">
                {completedTasks} of {totalTasks} parameters verified complete
              </span>
            </div>
          </div>

          {/* Checklist Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checklist Tasks Ledger (Takes 2 columns) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-border-light shadow-luxury space-y-6">
                <div className="flex justify-between items-center border-b border-border-light pb-4">
                  <h4 className="font-heading text-base font-bold text-purple-dark flex items-center">
                    <CheckSquare className="h-5 w-5 mr-1.5 text-gold-primary" />
                    Setup Verification List
                  </h4>
                  
                  {/* Quick summary metrics */}
                  <div className="flex space-x-4 text-xs font-semibold">
                    <span className="text-red-500">{totalTasks - completedTasks - inProgressTasks} Pending</span>
                    <span className="text-amber-600">{inProgressTasks} In Progress</span>
                    <span className="text-green-700">{completedTasks} Verified</span>
                  </div>
                </div>

                {/* Categorized Tasks mapping */}
                <div className="space-y-6">
                  {categories.map((cat) => {
                    const catTasks = activeTasks.filter(t => t.category === cat);
                    return (
                      <div key={cat} className="space-y-3">
                        <span className="text-[10px] font-bold text-purple-primary uppercase tracking-wider bg-purple-light/30 px-2 py-0.5 rounded-md">
                          {cat} Parameters
                        </span>

                        <div className="space-y-2.5">
                          {catTasks.map((task) => {
                            const isDone = task.status === 'Completed';
                            const isProgress = task.status === 'In Progress';
                            
                            return (
                              <div 
                                key={task.id}
                                className={cn(
                                  "p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between text-xs transition-colors",
                                  isDone ? "bg-green-50/20 border-green-200" :
                                  isProgress ? "bg-amber-50/20 border-amber-200" : "bg-white border-border-light"
                                )}
                              >
                                <div className="flex items-start space-x-3 flex-1 min-w-0">
                                  <div className="pt-0.5">
                                    <button 
                                      onClick={() => handleTaskStatusChange(task.id, isDone ? 'Pending' : 'Completed')}
                                      className={cn(
                                        "h-4.5 w-4.5 rounded flex items-center justify-center border transition-all",
                                        isDone 
                                          ? "bg-green-primary border-green-primary text-white" 
                                          : "border-gray-300 hover:border-gold-primary"
                                      )}
                                    >
                                      {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                                    </button>
                                  </div>
                                  
                                  <div className="min-w-0">
                                    <p className={cn(
                                      "font-bold text-dark truncate",
                                      isDone && "line-through text-gray-400"
                                    )}>
                                      {task.taskName}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                      Last update: {new Date(task.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>

                                {/* Controls: Assigned Staff & Status stepper */}
                                <div className="mt-3 sm:mt-0 flex items-center space-x-3.5 self-end sm:self-center">
                                  {/* Staff Dropdown */}
                                  <div>
                                    <select
                                      value={task.assignedStaffId || ''}
                                      onChange={(e) => handleAssignStaff(task.id, e.target.value)}
                                      className="px-2 py-1 bg-ivory/50 border border-border-light rounded text-[10px] text-gray-600 focus:outline-none"
                                    >
                                      <option value="">-- Allocate Staff --</option>
                                      {staff.map(s => (
                                        <option key={s.id} value={s.id}>{s.fullName} ({s.role})</option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Quick status stepper toggle */}
                                  <div className="flex gap-1.5">
                                    <button
                                      onClick={() => handleTaskStatusChange(task.id, 'In Progress')}
                                      className={cn(
                                        "px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border transition-colors",
                                        isProgress 
                                          ? "bg-amber-100 border-amber-300 text-amber-800" 
                                          : "bg-white border-border-light text-gray-500 hover:border-gold-primary"
                                      )}
                                    >
                                      Run
                                    </button>
                                    <button
                                      onClick={() => handleTaskStatusChange(task.id, 'Completed')}
                                      className={cn(
                                        "px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border transition-colors",
                                        isDone 
                                          ? "bg-green-100 border-green-300 text-green-800" 
                                          : "bg-white border-border-light text-gray-500 hover:border-gold-primary"
                                      )}
                                    >
                                      Clear
                                    </button>
                                  </div>
                                </div>

                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Quick utility status links & alerts */}
            <div className="space-y-6">
              {/* Utility Checks Quick Links */}
              <div className="bg-white p-5 rounded-2xl border border-border-light shadow-luxury space-y-4">
                <h4 className="font-heading text-sm font-bold text-purple-dark flex items-center">
                  <Activity className="h-4.5 w-4.5 mr-1.5 text-gold-primary" />
                  Live Utility Logs
                </h4>
                <p className="text-xs text-gray-500">
                  Ensure dual gensets (70 kVA & 25 kVA) fuel, runtime, and load balances are logged and verified in real-time.
                </p>

                <div className="space-y-2.5">
                  <Link 
                    href="/operations/utility"
                    className="flex justify-between items-center p-3.5 bg-ivory/50 hover:bg-white rounded-xl border border-border-light hover:border-gold-primary transition-all text-xs font-bold text-purple-primary"
                  >
                    <span>Manage Dual Gensets</span>
                    <span className="text-[10px] text-gold-dark font-sans flex items-center">
                      70kVA & 25kVA <Play className="h-3 w-3 ml-1 text-green-primary" />
                    </span>
                  </Link>

                  <Link 
                    href="/map"
                    className="flex justify-between items-center p-3.5 bg-ivory/50 hover:bg-white rounded-xl border border-border-light hover:border-gold-primary transition-all text-xs font-bold text-purple-primary"
                  >
                    <span>Venue Seat & Table Planner</span>
                    <span className="text-[10px] text-purple-light bg-purple-primary px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      Interactive Map
                    </span>
                  </Link>
                </div>

              </div>

              {/* Coordinator Brief Card */}
              <div className="bg-purple-dark text-white p-5 rounded-2xl border border-gold-primary/20 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-0.5 gold-shimmer"></div>
                <h5 className="font-heading text-xs font-bold text-gold-primary uppercase tracking-wider">Coordinator Directives</h5>
                <p className="text-xs text-purple-light leading-relaxed">
                  1. Double-check diesel fuel reserves at least 4 hours before the event slot starts.<br />
                  2. Clear all dining room washrooms and sanitization logs every 2 hours during the wedding.<br />
                  3. Verify DJ sound limit levels meet municipal rules (no high bass after 10:00 PM).
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-16 rounded-2xl border border-border-light shadow-luxury text-center flex flex-col items-center justify-center">
          <ShieldAlert className="h-12 w-12 text-purple-primary mb-3" />
          <h4 className="font-heading text-base font-bold text-purple-dark">No Active Scheduled Ceremonies</h4>
          <p className="text-xs text-gray-500 max-w-sm mt-1">
            There are no confirmed or advance-paid wedding schedules registered in the system. Go to Bookings to register an event.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
