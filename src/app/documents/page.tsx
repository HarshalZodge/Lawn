'use client';

import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, Search, Upload, FileText, User, Calendar, 
  Trash2, Download, Eye, Tag, Plus, Check, X 
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { db } from '@/lib/mock-db';
import { Document, Customer, Booking } from '@/types';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  
  // Form fields
  const [docName, setDocName] = useState('');
  const [category, setCategory] = useState<Document['category']>('Agreement');
  const [customerId, setCustomerId] = useState('');
  const [bookingId, setBookingId] = useState('');

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  useEffect(() => {
    setDocuments(db.getDocuments());
    setCustomers(db.getCustomers());
    setBookings(db.getBookings());
  }, []);

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    setDocName(fileNameWithoutExt);
    
    // Read file as base64 data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFileBase64(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !selectedFile) {
      alert('Please select or drop a file before confirming upload.');
      return;
    }

    try {
      const ext = selectedFile.name.split('.').pop();
      const finalName = docName.endsWith(`.${ext}`) ? docName : `${docName}.${ext}`;
      const newDoc = db.addDocument({
        name: finalName,
        category,
        customerId: customerId || undefined,
        bookingId: bookingId || undefined,
        filePath: fileBase64 || '#'
      });

      setDocuments(db.getDocuments());
      setIsUploadOpen(false);
      
      // Reset form
      setDocName('');
      setCustomerId('');
      setBookingId('');
      setSelectedFile(null);
      setFileBase64('');
      alert(`Document "${newDoc.name}" uploaded successfully!`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Categories list
  const categories: Document['category'][] = [
    'Agreement', 'Aadhaar', 'PAN', 'Receipt', 'Invoice', 'Vendor Contract'
  ];

  // Filtering documents list
  const filteredDocs = documents.filter(doc => {
    const cust = customers.find(c => c.id === doc.customerId);
    const bkg = bookings.find(b => b.id === doc.bookingId);

    const matchesSearch = 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bkg?.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      {/* Document Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h3 className="font-heading text-2xl font-bold text-purple-dark">Cloud Document Management</h3>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Securely store rentals contracts, verify guest identity cards, compile payments receipts, and manage files.
          </p>
        </div>
        
        <button 
          onClick={() => setIsUploadOpen(true)}
          className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-2.5 bg-purple-primary text-white text-xs font-bold rounded-lg border border-gold-primary/30 hover:bg-purple-dark shadow-md"
        >
          <Upload className="mr-1.5 h-4.5 w-4.5 text-gold-primary" />
          Upload Document
        </button>
      </div>

      {/* Directory Folders Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        {/* All Folder */}
        <button 
          onClick={() => setSelectedCategory('All')}
          className={cn(
            "p-4 rounded-xl border text-center transition-all shadow-sm flex flex-col items-center justify-center scale-100 hover:scale-[1.02]",
            selectedCategory === 'All' 
              ? "bg-purple-dark text-white border-gold-primary" 
              : "bg-white border-border-light text-dark hover:border-gold-primary/45"
          )}
        >
          <FolderOpen className={cn("h-6 w-6 mb-2", selectedCategory === 'All' ? "text-gold-primary animate-pulse" : "text-purple-primary")} />
          <span className="text-xs font-bold font-heading">All Files</span>
          <span className="text-[10px] opacity-60 mt-1">{documents.length} docs</span>
        </button>

        {/* Categories Directories mapping */}
        {categories.map((cat) => {
          const count = documents.filter(d => d.category === cat).length;
          const isSelected = selectedCategory === cat;
          return (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "p-4 rounded-xl border text-center transition-all shadow-sm flex flex-col items-center justify-center scale-100 hover:scale-[1.02]",
                isSelected 
                  ? "bg-purple-dark text-white border-gold-primary" 
                  : "bg-white border-border-light text-dark hover:border-gold-primary/45"
              )}
            >
              <FolderOpen className={cn("h-6 w-6 mb-2", isSelected ? "text-gold-primary animate-pulse" : "text-purple-primary")} />
              <span className="text-xs font-bold font-heading truncate max-w-full">{cat}s</span>
              <span className="text-[10px] opacity-60 mt-1">{count} file{count !== 1 && 's'}</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar Search */}
      <div className="bg-white p-4 rounded-2xl border border-border-light shadow-luxury mb-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search documents by name, customer, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-ivory/50 border border-border-light focus:outline-none focus:border-gold-primary rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Files Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-border-light text-center italic text-gray-500">
            No documents found matching the search criteria.
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const customer = customers.find(c => c.id === doc.customerId);
            const booking = bookings.find(b => b.id === doc.bookingId);

            return (
              <div 
                key={doc.id} 
                className="bg-white p-5 rounded-2xl border border-border-light shadow-luxury hover:border-gold-primary transition-all relative overflow-hidden group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-purple-primary/10 rounded-lg text-purple-primary">
                      <FileText className="h-6 w-6 text-gold-primary" />
                    </div>
                    
                    <span className="text-[8px] font-bold bg-gold-primary/20 text-gold-primary border border-gold-primary/30 px-2 py-0.5 rounded tracking-wide uppercase">
                      {doc.category}
                    </span>
                  </div>

                  <h4 className="font-heading text-xs font-bold text-purple-dark line-clamp-2" title={doc.name}>
                    {doc.name}
                  </h4>

                  {/* Metadata linkings */}
                  <div className="mt-4 pt-3 border-t border-border-light text-[10px] text-gray-500 space-y-1">
                    {customer && (
                      <p className="flex items-center">
                        <User className="h-3 w-3 text-gold-primary mr-1 shrink-0" />
                        Cust: <span className="font-semibold text-dark ml-1">{customer.fullName}</span>
                      </p>
                    )}
                    {booking && (
                      <p className="flex items-center">
                        <FileText className="h-3 w-3 text-gold-primary mr-1 shrink-0" />
                        Bkg ID: <span className="font-semibold text-dark ml-1">{booking.bookingNumber}</span>
                      </p>
                    )}
                    <p className="flex items-center">
                      <Calendar className="h-3 w-3 text-gold-primary mr-1 shrink-0" />
                      Uploaded: <span className="font-semibold text-dark ml-1">{formatDate(doc.uploadedAt.split('T')[0])}</span>
                    </p>
                  </div>
                </div>

                {/* Operations Hover Trigger Buttons */}
                <div className="mt-6 flex space-x-2 pt-3 border-t border-border-light">
                  <button 
                    onClick={() => setPreviewDoc(doc)}
                    className="flex-1 py-1.5 bg-ivory text-purple-primary hover:border-gold-primary rounded-lg text-[10px] font-bold border border-border-light flex items-center justify-center transition-colors"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </button>
                  <button 
                    onClick={() => alert(`Initiating mock download for document: ${doc.name}`)}
                    className="flex-1 py-1.5 bg-purple-primary text-white hover:bg-purple-dark rounded-lg text-[10px] font-bold border border-gold-primary/30 flex items-center justify-center transition-colors"
                  >
                    <Download className="h-3 w-3 mr-1 text-gold-primary" />
                    Download
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* UPLOAD DOCUMENT MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsUploadOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-border-light shadow-luxury-lg overflow-hidden animate-in zoom-in duration-300">
            <div className="p-5 border-b border-border-light bg-purple-dark text-white flex justify-between items-center">
              <div>
                <h4 className="font-heading text-sm font-bold">Cloud Uploader Console</h4>
                <p className="text-[9px] text-purple-light uppercase">Link documents to customers and schedule registries</p>
              </div>
              <button onClick={() => setIsUploadOpen(false)} className="p-1.5 rounded-lg text-purple-light hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-xs">
              {/* Drag and Drop Zone */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={cn(
                  "p-5 border-2 border-dashed rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer",
                  dragActive ? "border-purple-primary bg-purple-light/20" : "border-border-light bg-ivory/25 hover:border-gold-primary"
                )}
              >
                <input 
                  type="file" 
                  id="file-upload-input"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />
                <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center w-full">
                  <Upload className="h-8 w-8 text-gold-primary mb-2 animate-pulse" />
                  <p className="font-bold text-purple-dark text-xs truncate max-w-[280px]">
                    {selectedFile ? selectedFile.name : 'Select or drag your file here'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {selectedFile ? `Size: ${(selectedFile.size / 1024).toFixed(1)} KB` : 'Supports PDF, JPG, PNG up to 2MB'}
                  </p>
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Document Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. rent_agreement_signed" 
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 bg-ivory/30 border border-border-light rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Category Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Document['category'])}
                  className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-xs"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Link Customer (Optional)</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-xs"
                >
                  <option value="">-- Do Not Link --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Link Booking (Optional)</label>
                <select
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-xs"
                >
                  <option value="">-- Do Not Link --</option>
                  {bookings.map(b => {
                    const c = customers.find(cust => cust.id === b.customerId);
                    return (
                      <option key={b.id} value={b.id}>{b.bookingNumber} ({c?.fullName})</option>
                    );
                  })}
                </select>
              </div>

              <div className="pt-4 border-t border-border-light flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 bg-white text-gray-500 border border-border-light rounded hover:border-purple-primary transition-all font-bold text-[10px]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-purple-primary text-white font-bold rounded border border-gold-primary/30 hover:bg-purple-dark shadow-sm text-[10px]"
                >
                  Confirm Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setPreviewDoc(null)}></div>
          
          <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-border-light shadow-luxury-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="p-4 border-b border-border-light bg-purple-dark text-white flex justify-between items-center">
              <span className="text-xs font-bold text-gold-primary font-heading uppercase tracking-wider">
                Document Sandbox Preview
              </span>
              <button onClick={() => setPreviewDoc(null)} className="p-1 rounded-md text-purple-light hover:text-white text-sm font-bold">
                Close
              </button>
            </div>
            
             {/* Real or Mock preview canvas */}
            <div className="p-10 bg-ivory text-center flex flex-col justify-center items-center h-96 overflow-y-auto">
              {previewDoc.filePath.startsWith('data:image/') ? (
                <img src={previewDoc.filePath} alt={previewDoc.name} className="max-h-64 object-contain mb-4 rounded-lg shadow-md border border-border-light" />
              ) : (
                <FileText className="h-20 w-20 text-gold-primary mb-4 animate-bounce" />
              )}
              <h5 className="font-heading text-sm font-bold text-purple-dark">{previewDoc.name}</h5>
              <p className="text-xs text-gray-500 max-w-sm mt-2">
                This document ({previewDoc.category}) is safely stored on the cloud server. Supabase Storage buckets have generated a secure link.
              </p>
              
              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => alert('Opening printable viewer...')}
                  className="px-4 py-2 bg-white text-purple-primary font-bold border border-border-light hover:border-gold-primary rounded-lg text-xs transition-colors"
                >
                  Print Document
                </button>
                <button 
                  onClick={() => alert('Signing verification audit signature...')}
                  className="px-4 py-2 bg-purple-primary text-white font-bold rounded-lg border border-gold-primary/30 hover:bg-purple-dark text-xs transition-all flex items-center"
                >
                  <Check className="h-4 w-4 mr-1 text-gold-primary" />
                  Verify Authenticity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
