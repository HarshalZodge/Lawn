'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home, MapPin, Users, IndianRupee, Sparkles, CheckCircle2, 
  AlertTriangle, Settings, Calendar, Plus, Trash2, Clock
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { db } from '@/lib/mock-db';
import { Venue, Booking, SlotType } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface MaintenanceLog {
  id: string;
  venueId: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export default function VenueSlotManager() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // Date selector for slots timeline
  const [checkDate, setCheckDate] = useState('2026-06-12'); // Tomorrow by default
  const [selectedVenueId, setSelectedVenueId] = useState('v1');
  
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([
    { id: 'm1', venueId: 'v2', startDate: '2026-07-01', endDate: '2026-07-03', reason: 'Annual grass sodding & lawn aeration' },
    { id: 'm2', venueId: 'v1', startDate: '2026-07-10', endDate: '2026-07-11', reason: 'Central ventilation system duct servicing' }
  ]);
  const [newMaintReason, setNewMaintReason] = useState('');
  const [newMaintStart, setNewMaintStart] = useState('');
  const [newMaintEnd, setNewMaintEnd] = useState('');

  useEffect(() => {
    setVenues(db.getVenues());
    setBookings(db.getBookings());
  }, []);

  // Handle Venue Status update
  const handleToggleStatus = (venueId: string, newStatus: Venue['status']) => {
    try {
      db.updateVenue(venueId, { status: newStatus });
      setVenues(db.getVenues());
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaintStart || !newMaintEnd || !newMaintReason) return;
    
    const newLog: MaintenanceLog = {
      id: `m_${Date.now()}`,
      venueId: selectedVenueId,
      startDate: newMaintStart,
      endDate: newMaintEnd,
      reason: newMaintReason
    };

    setMaintenanceLogs([...maintenanceLogs, newLog]);
    
    // Also toggle venue status to maintenance if dates encompass checkDate
    db.updateVenue(selectedVenueId, { status: 'Maintenance' });
    setVenues(db.getVenues());

    setNewMaintReason('');
    setNewMaintStart('');
    setNewMaintEnd('');
  };

  const activeVenue = venues.find(v => v.id === selectedVenueId) || venues[0];

  // Gather bookings on target date for active venue
  const targetDateBookings = bookings.filter(b => 
    b.venueId === selectedVenueId && 
    b.eventDate === checkDate && 
    b.status !== 'Cancelled'
  );

  // Map slots layout status
  const slotList: { name: SlotType; time: string }[] = [
    { name: 'Morning Slot', time: '07:00 AM - 01:00 PM' },
    { name: 'Afternoon Slot', time: '01:00 PM - 05:00 PM' },
    { name: 'Evening Slot', time: '05:00 PM - 11:00 PM' },
    { name: 'Full Day Slot', time: '06:00 AM - Midnight' }
  ];

  return (
    <DashboardLayout>
      {/* Venues Header */}
      <div className="mb-8">
        <h3 className="font-heading text-2xl font-bold text-purple-dark">Venue Spaces & Slots Cockpit</h3>
        <p className="text-xs text-gray-500 font-medium mt-1">
          Configure physical halls, schedule operational closures, and verify slot occupancy timelines.
        </p>
      </div>

      {/* Grid: Left Column - Venue Details Cards | Right Column - Slots conflict checker & maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Venue Details Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {venues.map((venue) => {
              const isActive = venue.id === selectedVenueId;
              return (
                <div 
                  key={venue.id}
                  onClick={() => setSelectedVenueId(venue.id)}
                  className={cn(
                    "bg-white rounded-2xl border transition-all cursor-pointer relative overflow-hidden shadow-luxury hover:shadow-luxury-lg",
                    isActive ? "border-gold-primary ring-2 ring-gold-primary/20 scale-[1.01]" : "border-border-light"
                  )}
                >
                  {/* Status Indicator Badge */}
                  <span className={cn(
                    "absolute top-4 right-4 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider z-10 shadow-sm",
                    venue.status === 'Available' ? "bg-green-100 text-green-800" :
                    venue.status === 'Maintenance' ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                  )}>
                    {venue.status}
                  </span>

                  {/* Body details */}
                  <div className="p-6">
                    <h4 className="font-heading text-lg font-bold text-purple-dark mb-1">{venue.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2 min-h-[32px]">{venue.description}</p>
                    
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs border-t border-border-light pt-4">
                      <div>
                        <span className="text-gray-400 block font-medium">Max Capacity</span>
                        <span className="font-bold text-dark flex items-center mt-0.5">
                          <Users className="h-3.5 w-3.5 mr-1 text-gold-primary" />
                          {venue.capacity} Pax
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-medium">Base Slot Rate</span>
                        <span className="font-bold text-purple-primary flex items-center mt-0.5">
                          <IndianRupee className="h-3.5 w-3.5 mr-0.5 text-gold-primary" />
                          {formatCurrency(venue.basePrice)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1">
                      <span className="text-[10px] font-bold text-purple-dark uppercase tracking-wider">Amenities Included</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {venue.amenities.slice(0, 3).map((am, i) => (
                          <span key={i} className="bg-ivory text-gray-600 border border-border-light text-[9px] font-semibold px-2 py-0.5 rounded">
                            {am}
                          </span>
                        ))}
                        {venue.amenities.length > 3 && (
                          <span className="text-[9px] text-gray-400 italic font-semibold self-center">
                            +{venue.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Operational Toggles */}
                    <div className="mt-6 pt-4 border-t border-border-light flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(venue.id, 'Available'); }}
                        className="flex-1 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-[10px] font-bold border border-green-200 transition-colors"
                      >
                        Make Available
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(venue.id, 'Maintenance'); }}
                        className="flex-1 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold border border-amber-200 transition-colors"
                      >
                        Put Service Log
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Venue Detailed View */}
          {activeVenue && (
            <div className="bg-white p-6 rounded-2xl border border-border-light shadow-luxury">
              <h4 className="font-heading text-base font-bold text-purple-dark mb-4 flex items-center">
                <Settings className="h-4.5 w-4.5 mr-1.5 text-gold-primary" />
                Detailed Specs: {activeVenue.name}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div>
                  <h5 className="font-bold text-purple-primary mb-2">Included Amenities Checklist</h5>
                  <ul className="space-y-1.5">
                    {activeVenue.amenities.map((am, idx) => (
                      <li key={idx} className="flex items-center text-gray-600 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-green-primary mr-2" />
                        {am}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-ivory/50 p-4 rounded-xl border border-border-light space-y-2.5">
                  <h5 className="font-bold text-purple-dark">Operational Pricing Rules</h5>
                  <p className="text-gray-500">
                    Base rates cover standard 6-hour morning/evening blocks. Full-day slot selections trigger a 1.8x multiplier automatically on the Package Builder.
                  </p>
                  <p className="text-gold-dark font-bold">
                    Additional cleanup overhead fee (Rs. 10,000) applied on double-bookings.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Slots timeline check & maintenance registry */}
        <div className="space-y-8">
          {/* Slots Availability Timeline */}
          <div className="bg-white p-5 rounded-2xl border border-border-light shadow-luxury space-y-4">
            <h4 className="font-heading text-sm font-bold text-purple-dark flex items-center">
              <Clock className="h-4.5 w-4.5 mr-1.5 text-gold-primary" />
              Slot Timeline Visualizer
            </h4>
            
            {/* Pick Date & Venue */}
            <div className="space-y-2.5">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Check Date</label>
                <input
                  type="date"
                  value={checkDate}
                  onChange={(e) => setCheckDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-ivory/30 border border-border-light rounded-lg text-xs"
                />
              </div>
            </div>

            {/* List Slots */}
            <div className="space-y-2 border-t border-border-light pt-4">
              <p className="text-[10px] font-bold text-purple-primary uppercase tracking-wider mb-2">Slot Registry</p>
              {slotList.map((slot, i) => {
                // Find if slot is booked
                const booking = targetDateBookings.find(b => 
                  b.slotType === slot.name || b.slotType === 'Full Day Slot' || slot.name === 'Full Day Slot'
                );

                return (
                  <div 
                    key={i}
                    className={cn(
                      "p-3 rounded-lg border text-xs flex justify-between items-center transition-all",
                      booking 
                        ? "bg-red-50 border-red-200 text-red-950 font-bold" 
                        : "bg-green-50/50 border-green-200 text-green-950 font-medium"
                    )}
                  >
                    <div>
                      <p className="font-bold">{slot.name}</p>
                      <span className="text-[9px] opacity-75">{slot.time}</span>
                    </div>

                    <div>
                      {booking ? (
                        <span className="bg-red-100 text-red-800 text-[8px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                          Booked: {booking.bookingNumber}
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-800 text-[8px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                          Available
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Maintenance Logs Register */}
          <div className="bg-white p-5 rounded-2xl border border-border-light shadow-luxury space-y-4">
            <h4 className="font-heading text-sm font-bold text-purple-dark flex items-center">
              <Calendar className="h-4.5 w-4.5 mr-1.5 text-gold-primary" />
              Maintenance Schedules
            </h4>

            {/* Add Maintenance form */}
            <form onSubmit={handleAddMaintenance} className="space-y-3 p-3 bg-ivory/30 border border-border-light rounded-xl text-xs">
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Service Start Date</label>
                <input 
                  type="date" 
                  required
                  value={newMaintStart}
                  onChange={(e) => setNewMaintStart(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-border-light rounded"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Service End Date</label>
                <input 
                  type="date" 
                  required
                  value={newMaintEnd}
                  onChange={(e) => setNewMaintEnd(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-border-light rounded"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Maintenance Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Ventilation system cleaning"
                  required
                  value={newMaintReason}
                  onChange={(e) => setNewMaintReason(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-border-light rounded"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-1.5 bg-purple-primary text-white font-bold rounded hover:bg-purple-dark shadow-sm text-[10px]"
              >
                Log Closure Schedule
              </button>
            </form>

            {/* List Logs */}
            <div className="space-y-2 border-t border-border-light pt-4 max-h-[200px] overflow-y-auto pr-1">
              <p className="text-[10px] font-bold text-purple-dark uppercase tracking-wider mb-2">Logged Blocks</p>
              {maintenanceLogs.filter(log => log.venueId === selectedVenueId).map((log) => (
                <div key={log.id} className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between items-start font-semibold text-amber-900">
                    <span className="truncate max-w-[150px]">{log.reason}</span>
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  </div>
                  <p className="text-[9px] text-gray-400">
                    Closed: {formatDate(log.startDate)} to {formatDate(log.endDate)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
