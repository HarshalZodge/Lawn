'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, Star, Search, Plus, Phone, Mail, FileText, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { db } from '@/lib/mock-db';
import { Vendor } from '@/types';
import { cn } from '@/lib/utils';

export default function VendorManager() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [vName, setVName] = useState('');
  const [vBusiness, setVBusiness] = useState('');
  const [vCategory, setVCategory] = useState<Vendor['category']>('Catering');
  const [vPhone, setVPhone] = useState('');
  const [vEmail, setVEmail] = useState('');
  const [vTerms, setVTerms] = useState('');

  useEffect(() => {
    setVendors(db.getVendors());
  }, []);

  const handleRegisterVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName || !vPhone) return;

    try {
      db.addVendor({
        name: vName,
        businessName: vBusiness || undefined,
        category: vCategory,
        phone: vPhone,
        email: vEmail || undefined,
        contractTerms: vTerms || undefined
      });

      setVendors(db.getVendors());
      setIsModalOpen(false);
      
      // Reset
      setVName('');
      setVBusiness('');
      setVPhone('');
      setVEmail('');
      setVTerms('');
      alert(`Vendor successfully registered!`);
    } catch (err: any) {
      alert(err.message || 'Vendor already exists.');
    }
  };

  const categories: Vendor['category'][] = [
    'Catering', 'Decoration', 'DJ', 'Photography', 'Generator', 'Flower', 'Sound', 'Security'
  ];

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      v.phone.includes(searchQuery);
    const matchesCategory = categoryFilter === 'All' || v.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      {/* Vendor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h3 className="font-heading text-2xl font-bold text-purple-dark">Contracted Vendor Registry</h3>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Maintain directories of external caterers, event decorators, dhol-tasha, security forces, and log performance ratings.
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-2.5 bg-purple-primary text-white text-xs font-bold rounded-lg border border-gold-primary/30 hover:bg-purple-dark shadow-md"
        >
          <Plus className="mr-1.5 h-4.5 w-4.5 text-gold-primary" />
          Onboard Vendor
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-border-light shadow-luxury mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search vendors by name, contact, business..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-ivory/50 border border-border-light focus:outline-none focus:border-gold-primary rounded-lg text-xs"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-ivory/50 border border-border-light focus:outline-none focus:border-gold-primary rounded-lg text-xs text-dark font-medium"
          >
            <option value="All">All Category Niches</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Vendor Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <div 
            key={vendor.id} 
            className="bg-white p-5 rounded-2xl border border-border-light shadow-luxury hover:border-gold-primary transition-all flex flex-col justify-between"
          >
            <div>
              {/* Star Rating and Category */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-[9px] font-bold bg-purple-light/40 text-purple-primary border border-purple-primary/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {vendor.category}
                </span>
                
                <div className="flex items-center space-x-1 bg-gold-primary/15 text-gold-dark px-2 py-0.5 rounded border border-gold-primary/25 text-[10px] font-bold">
                  <Star className="h-3.5 w-3.5 fill-gold-primary text-gold-primary shrink-0" />
                  <span>{Number(vendor.rating).toFixed(1)}</span>
                </div>
              </div>

              <h4 className="font-heading text-sm font-bold text-purple-dark">
                {vendor.businessName || vendor.name}
              </h4>
              <p className="text-xs text-gray-500 font-medium">Contractor: {vendor.name}</p>

              {/* Terms Card info */}
              {vendor.contractTerms && (
                <div className="mt-4 p-3 bg-ivory/45 border border-border-light rounded-xl text-xs space-y-1.5">
                  <p className="font-semibold text-purple-primary flex items-center">
                    <FileText className="h-3.5 w-3.5 mr-1 text-gold-primary" />
                    Agreement Terms:
                  </p>
                  <p className="text-gray-500 leading-relaxed italic">
                    "{vendor.contractTerms}"
                  </p>
                </div>
              )}
            </div>

            {/* Contacts details */}
            <div className="mt-6 pt-4 border-t border-border-light text-[10px] text-gray-600 space-y-1.5">
              <div className="flex items-center space-x-2">
                <Phone className="h-3.5 w-3.5 text-gold-primary shrink-0" />
                <span>{vendor.phone}</span>
              </div>
              {vendor.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-3.5 w-3.5 text-gold-primary shrink-0" />
                  <span className="truncate">{vendor.email}</span>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* NEW VENDOR MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-border-light shadow-luxury-lg overflow-hidden animate-in zoom-in duration-300">
            <div className="p-5 border-b border-border-light bg-purple-dark text-white flex justify-between items-center">
              <div>
                <h4 className="font-heading text-sm font-bold">Onboard Vendor Account</h4>
                <p className="text-[9px] text-purple-light uppercase">Register new service providers into the schedule matrix</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-purple-light hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterVendor} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Contractor Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                  className="w-full px-3 py-2 bg-ivory/30 border border-border-light rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Business Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Shivaji Caterers"
                  value={vBusiness}
                  onChange={(e) => setVBusiness(e.target.value)}
                  className="w-full px-3 py-2 bg-ivory/30 border border-border-light rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Service Category *</label>
                  <select
                    value={vCategory}
                    onChange={(e) => setVCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-xs font-semibold"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Contact Phone *</label>
                  <input 
                    type="text" 
                    required
                    value={vPhone}
                    onChange={(e) => setVPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-border-light rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={vEmail}
                  onChange={(e) => setVEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-ivory/30 border border-border-light rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Contract terms details</label>
                <textarea 
                  rows={3} 
                  placeholder="e.g. Requires 20% advance..."
                  value={vTerms}
                  onChange={(e) => setVTerms(e.target.value)}
                  className="w-full px-3 py-2 bg-ivory/30 border border-border-light rounded-lg text-xs"
                />
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
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
