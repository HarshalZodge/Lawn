'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Search, Plus, User, Phone, Mail, Calendar, 
  IndianRupee, Briefcase, ShieldCheck, CheckSquare, X 
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { db } from '@/lib/mock-db';
import { StaffMember, AttendanceRecord, UserRole } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function StaffManager() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [sName, setSName] = useState('');
  const [sRole, setSRole] = useState<UserRole>('Staff');
  const [sDesignation, setSDesignation] = useState('');
  const [sSalary, setSSalary] = useState(15000);
  const [sPhone, setSPhone] = useState('');

  useEffect(() => {
    setStaff(db.getStaff());
    setAttendance(db.getAttendance());
  }, []);

  const handleHireSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName || !sPhone) return;

    try {
      db.addStaff({
        fullName: sName,
        profileId: `u_staff_${Date.now()}`,
        role: sRole,
        designation: sDesignation || 'Assistant',
        salary: Number(sSalary),
        contactNumber: sPhone
      });

      setStaff(db.getStaff());
      setIsModalOpen(false);
      
      // Reset
      setSName('');
      setSRole('Staff');
      setSDesignation('');
      setSSalary(15000);
      setSPhone('');
      alert(`Staff member hired successfully! Login credentials generated.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMarkAttendance = (staffId: string, status: AttendanceRecord['status']) => {
    try {
      db.logAttendance(staffId, status);
      setAttendance(db.getAttendance());
      alert(`Attendance updated successfully!`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const roles: UserRole[] = [
    'Owner', 'Manager', 'Accountant', 'Reception Staff', 'Event Coordinator', 'Staff'
  ];

  const filteredStaff = staff.filter(member => 
    member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.contactNumber.includes(searchQuery)
  );

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <DashboardLayout>
      {/* Staff Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h3 className="font-heading text-2xl font-bold text-purple-dark">Staff & Shifts Registry</h3>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Track daily attendance shift logs, allocate role-based dashboard permissions, and manage salaries ledger.
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-2.5 bg-purple-primary text-white text-xs font-bold rounded-lg border border-gold-primary/30 hover:bg-purple-dark shadow-md"
        >
          <Plus className="mr-1.5 h-4.5 w-4.5 text-gold-primary" />
          Hire Staff
        </button>
      </div>

      {/* Grid Layout: Left Side Roster table | Right Side Today's Attendance logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Staff Roster list (Takes 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-border-light shadow-luxury">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
              <h4 className="font-heading text-base font-bold text-purple-dark flex items-center">
                <Briefcase className="h-5 w-5 mr-1.5 text-gold-primary" />
                Staff Roster Details
              </h4>

              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </span>
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-ivory/50 border border-border-light focus:outline-none focus:border-gold-primary rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left text-dark border-collapse">
                <thead>
                  <tr className="bg-purple-dark text-white font-heading font-semibold tracking-wider border-b border-border-light">
                    <th className="p-3">Staff Details</th>
                    <th className="p-3">Designation</th>
                    <th className="p-3">System Role</th>
                    <th className="p-3 text-right">Base Salary</th>
                    <th className="p-3 text-center">Date Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((member) => (
                    <tr key={member.id} className="border-b border-border-light hover:bg-ivory/30 transition-colors">
                      <td className="p-3">
                        <p className="font-bold">{member.fullName}</p>
                        <span className="text-[10px] text-gray-400">{member.contactNumber}</span>
                      </td>
                      <td className="p-3 font-semibold text-purple-primary">{member.designation}</td>
                      <td className="p-3 font-medium text-gray-600">
                        <span className="inline-block bg-purple-light/40 text-purple-primary border border-purple-primary/10 px-2 py-0.5 rounded font-bold text-[9px]">
                          {member.role}
                        </span>
                      </td>
                      <td className="p-3 text-right font-extrabold text-purple-dark">
                        {member.salary ? formatCurrency(member.salary) : 'Hourly basis'}
                      </td>
                      <td className="p-3 text-center text-gray-500 font-medium">{formatDate(member.joiningDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Shift Log checker */}
        <div className="bg-white p-5 rounded-2xl border border-border-light shadow-luxury space-y-4">
          <h4 className="font-heading text-sm font-bold text-purple-dark flex items-center">
            <UserCheck className="h-4.5 w-4.5 mr-1.5 text-gold-primary" />
            Today's Attendance Logs
          </h4>
          <p className="text-[10px] text-gray-400">
            Log shift checkpoints for employees. Dates set: {formatDate(todayStr)}.
          </p>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {staff.map((member) => {
              // Find today's attendance log
              const log = attendance.find(a => a.staffId === member.id && a.logDate === todayStr);

              return (
                <div 
                  key={member.id} 
                  className={cn(
                    "p-3 rounded-xl border text-xs space-y-2.5 transition-all",
                    log?.status === 'Present' ? "bg-green-50/20 border-green-200" :
                    log?.status === 'Absent' ? "bg-red-50/20 border-red-200" : "bg-ivory/30 border-border-light"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-purple-dark">{member.fullName}</p>
                      <span className="text-[10px] text-gray-400 font-medium">{member.designation}</span>
                    </div>
                    {log ? (
                      <span className={cn(
                        "text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase",
                        log.status === 'Present' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      )}>
                        {log.status}
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">
                        Unmarked
                      </span>
                    )}
                  </div>

                  {/* Log Stepper buttons */}
                  <div className="flex gap-1.5 pt-2 border-t border-dashed border-border-light">
                    <button
                      onClick={() => handleMarkAttendance(member.id, 'Present')}
                      className="flex-1 py-1 bg-green-50 hover:bg-green-150 text-green-700 rounded border border-green-200 text-[9px] font-bold transition-colors"
                    >
                      Present
                    </button>
                    <button
                      onClick={() => handleMarkAttendance(member.id, 'Absent')}
                      className="flex-1 py-1 bg-red-50 hover:bg-red-150 text-red-700 rounded border border-red-200 text-[9px] font-bold transition-colors"
                    >
                      Absent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* HIRE STAFF MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-border-light shadow-luxury-lg overflow-hidden animate-in zoom-in duration-300">
            <div className="p-5 border-b border-border-light bg-purple-dark text-white flex justify-between items-center">
              <div>
                <h4 className="font-heading text-sm font-bold">Onboard Staff Member</h4>
                <p className="text-[9px] text-purple-light uppercase">Authorizes profile permissions and logs salary details</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-purple-light hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleHireSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Employee Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={sName}
                  onChange={(e) => setSName(e.target.value)}
                  className="w-full px-3 py-2 bg-ivory/30 border border-border-light rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">System Access Permission *</label>
                  <select
                    value={sRole}
                    onChange={(e) => setSRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-xs font-semibold text-purple-primary"
                  >
                    {roles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Job Designation *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Valet Lead"
                    required
                    value={sDesignation}
                    onChange={(e) => setSDesignation(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-border-light rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Base Monthly Salary (Rs.)</label>
                  <input 
                    type="number" 
                    value={sSalary}
                    onChange={(e) => setSSalary(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-ivory/30 border border-border-light rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Contact Phone *</label>
                  <input 
                    type="text" 
                    required
                    value={sPhone}
                    onChange={(e) => setSPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-border-light rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border-light flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white text-gray-500 border border-border-light rounded hover:border-purple-primary text-[10px] font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-purple-primary text-white font-bold rounded border border-gold-primary/30 hover:bg-purple-dark text-[10px] shadow-sm"
                >
                  Confirm Hiring
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
