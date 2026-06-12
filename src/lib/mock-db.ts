// Stateful Mock Database for Bhagyalaxmi ERP
// Maintaining in-memory cache and background synchronization to Supabase.
// Safe for SSR.

import { 
  Customer, Venue, Booking, Package, Service, Vendor, 
  Payment, Invoice, Document, ChecklistTask, StaffMember, 
  AttendanceRecord, GeneratorLog, GeneratorInfo, Expense, 
  WhatsAppTemplate, AuditLog, UserRole, Profile
} from '@/types';
import { supabase } from './supabase';

// Helper to check if running in browser
const isBrowser = () => typeof window !== 'undefined';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && !url.includes('your-project-ref');
};

// ==========================================
// SEED DATA FOR FIRST INITIALIZATION
// ==========================================
const SEED_PROFILES: Profile[] = [
  { id: 'u1', email: 'owner@bhagyalaxmi.com', fullName: 'Deepak Zodge', phone: '+91 94222 12345', role: 'Owner', status: 'Active', createdAt: '2026-01-01T10:00:00Z' },
  { id: 'u2', email: 'harshal@bhagyalaxmi.com', fullName: 'Harshal Zodge', phone: '+91 94223 12346', role: 'Manager', status: 'Active', createdAt: '2026-01-02T10:00:00Z' },
  { id: 'u3', email: 'kiran@bhagyalaxmi.com', fullName: 'Kiran Zodge', phone: '+91 94224 12347', role: 'Manager', status: 'Active', createdAt: '2026-01-03T10:00:00Z' },
];

const SEED_VENUES: Venue[] = [
  { id: 'v1', name: 'Wedding Hall', capacity: 1200, basePrice: 90000, amenities: ['Chandelier Lighting', 'Sound System', 'Bride Room', 'Groom Room'], description: 'Luxurious indoor banquet hall with royal decor', status: 'Available' },
  { id: 'v2', name: 'Open Lawn', capacity: 2500, basePrice: 90000, amenities: ['Fountain', 'Premium Grass Turf', 'Stage Area', 'High Mast Lights', 'Buffet Area'], description: 'Spectacular outdoor green lawns perfect for grand wedding receptions and events (Evening night slots only, daytime available at discount)', status: 'Available' },
  { id: 'v3', name: 'Combined Venue', capacity: 3700, basePrice: 120000, amenities: ['All Hall Amenities', 'All Lawn Amenities', 'VIP Entrance', 'Ample Valet Parking'], description: 'The ultimate luxury experience combining both the indoor hall and the outdoor lawns for maximum scale', status: 'Available' },
];

const SEED_SERVICES: Service[] = [
  { id: 's1', name: 'Royal Paithani Stage Decor', category: 'Decoration', defaultPrice: 50000, description: 'Maharashtrian heritage-themed floral stage setup' },
  { id: 's2', name: 'Traditional Buffet Catering', category: 'Catering', defaultPrice: 450, description: 'Pure vegetarian Maharashtrian menu per plate' },
  { id: 's3', name: 'Professional Wedding DJ & Lights', category: 'DJ', defaultPrice: 25000, description: 'High-end sound system with intelligent stage lights' },
  { id: 's4', name: 'Heavy-Duty Sound System', category: 'DJ', defaultPrice: 15000, description: 'JBL sound rigs with cordless microphones' },
  { id: 's5', name: 'Cinematic Wedding Photography', category: 'Photography', defaultPrice: 60000, description: 'Traditional & candid coverage with high-end cameras' },
  { id: 's6', name: 'Generator Fuel & Backup', category: 'Generator', defaultPrice: 12000, description: '125 KVA silent backup with fuel coverage up to 6 hours' },
  { id: 's7', name: 'Bride & Groom AC Rooms', category: 'Accommodation', defaultPrice: 5000, description: 'Premium private dressing suites with restrooms' },
  { id: 's8', name: 'Event Valet & Security Marshals', category: 'Security', defaultPrice: 8000, description: '10 security marshals managing entrance & gate' },
  { id: 's9', name: 'Armed Security Officers', category: 'Security', defaultPrice: 15000, description: '4 professional bodyguards for gate and VIP control' },
  { id: 's10', name: 'Live Shehnai & Dhol Tasha', category: 'Decoration', defaultPrice: 18000, description: 'Traditional live welcoming musicians' },
];

const SEED_PACKAGES: Package[] = [
  { id: 'p1', name: 'Classic Wedding', description: 'Standard wedding hall booking including basic decor, bride room, generator, and security assistance', basePrice: 180000, includedServices: ['s6', 's7', 's8'] },
  { id: 'p2', name: 'Royal Maharashtrian Heritage', description: 'Premium combined hall and lawn event with Royal Paithani stage decor, shehnai, full lighting setup, generator backup, security, and rooms', basePrice: 350000, includedServices: ['s1', 's3', 's5', 's6', 's7', 's8', 's9', 's10'] },
  { id: 'p3', name: 'Grand Reception & Dinner', description: 'Open lawn evening reception package with buffet caterer coordination, DJ system, VIP security, and lighting', basePrice: 280000, includedServices: ['s3', 's4', 's6', 's8', 's9'] },
];

const SEED_VENDORS: Vendor[] = [
  { id: 'vn1', name: 'Sanjay Deshmukh', businessName: 'Shivaji Caterers', category: 'Catering', phone: '+91 98765 43210', email: 'sanjay@shivajicaterers.com', contractTerms: 'Requires 20% advance, full payment 2 days before event. Pure Veg only.', rating: 4.8, createdAt: '2026-01-10T12:00:00Z' },
  { id: 'vn2', name: 'Vijay Kadam', businessName: 'Golden Stage Decorators', category: 'Decoration', phone: '+91 98765 43211', email: 'vijay@goldendecor.com', contractTerms: 'Stage setup must begin 12 hours before event slot. Materials provided.', rating: 4.7, createdAt: '2026-01-11T12:00:00Z' },
  { id: 'vn3', name: 'DJ Rahul', businessName: 'Bassline Events Ahilyanagar', category: 'DJ', phone: '+91 98765 43212', email: 'rahul@bassline.com', contractTerms: 'Permits for music after 10 PM to be managed by client/venue.', rating: 4.5, createdAt: '2026-01-12T12:00:00Z' },
  { id: 'vn4', name: 'Anil Shinde', businessName: 'Shinde Power Solutions', category: 'Generator', phone: '+91 98765 43213', email: 'anil@shindepower.com', contractTerms: 'Supplies backup fuel. Maintenance logs shared monthly.', rating: 4.6, createdAt: '2026-01-13T12:00:00Z' },
];

const SEED_CUSTOMERS: Customer[] = [
  { id: 'c1', fullName: 'Abhijit Shinde', phone: '9822012345', email: 'abhijit@gmail.com', address: 'Bhingar, Ahilyanagar', createdAt: '2026-05-01T10:00:00Z' },
  { id: 'c2', fullName: 'Snehal Patil', phone: '9850067890', email: 'snehal@yahoo.com', address: 'Nagardeole, Ahilyanagar', createdAt: '2026-05-10T11:00:00Z' }
];

const SEED_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    bookingNumber: 'BL-202606-0001',
    customerId: 'c1',
    venueId: 'v1',
    packageId: 'p1',
    eventType: 'Wedding',
    eventDate: '2026-06-18',
    slotType: 'Full Day Slot',
    guestCount: 600,
    decorationTheme: 'Royal Marigold',
    totalAmount: 180000,
    advancePaid: 60000,
    balanceAmount: 120000,
    status: 'Advance Paid',
    createdAt: '2026-05-02T10:00:00Z'
  },
  {
    id: 'b2',
    bookingNumber: 'BL-202606-0002',
    customerId: 'c2',
    venueId: 'v2',
    packageId: 'p2',
    eventType: 'Reception',
    eventDate: '2026-06-25',
    slotType: 'Evening Slot',
    guestCount: 1500,
    decorationTheme: 'Shahi Wada theme',
    totalAmount: 350000,
    advancePaid: 350000,
    balanceAmount: 0,
    status: 'Confirmed',
    createdAt: '2026-05-12T11:00:00Z'
  }
];

const SEED_PAYMENTS: Payment[] = [
  { id: 'pay_1', bookingId: 'b1', paymentNumber: 'BL-PAY-10001', amount: 60000, paymentDate: '2026-05-02T10:30:00Z', paymentMethod: 'UPI', transactionId: 'TXN998877', paymentStatus: 'Success', notes: 'Initial booking deposit' },
  { id: 'pay_2', bookingId: 'b2', paymentNumber: 'BL-PAY-10002', amount: 350000, paymentDate: '2026-05-12T12:00:00Z', paymentMethod: 'Bank Transfer', transactionId: 'TXN445566', paymentStatus: 'Success', notes: 'Full package rate payout' },
];

const SEED_INVOICES: Invoice[] = [
  {
    id: 'inv_1',
    invoiceNumber: 'BL-INV-202606-0001',
    bookingId: 'b1',
    subtotal: 152542.37,
    cgstRate: 9,
    sgstRate: 9,
    cgstAmount: 13728.81,
    sgstAmount: 13728.81,
    totalGst: 27457.63,
    grandTotal: 180000,
    advanceDeducted: 60000,
    balanceDue: 120000,
    status: 'Partially Paid',
    issuedDate: '2026-05-02',
    dueDate: '2026-06-18'
  },
  {
    id: 'inv_2',
    invoiceNumber: 'BL-INV-202606-0002',
    bookingId: 'b2',
    subtotal: 296610.17,
    cgstRate: 9,
    sgstRate: 9,
    cgstAmount: 26694.92,
    sgstAmount: 26694.92,
    totalGst: 53389.83,
    grandTotal: 350000,
    advanceDeducted: 350000,
    balanceDue: 0,
    status: 'Paid',
    issuedDate: '2026-05-12',
    dueDate: '2026-06-25'
  }
];

const SEED_CHECKLISTS: ChecklistTask[] = [];

const SEED_STAFF: StaffMember[] = [
  { id: 'st_owner', profileId: 'u1', fullName: 'Deepak Zodge', role: 'Owner', designation: 'Managing Director & Owner', salary: 150000, contactNumber: '+91 94222 12345', joiningDate: '2026-01-01', status: 'Active' },
  { id: 'st1', profileId: 'u2', fullName: 'Harshal Zodge', role: 'Manager', designation: 'Operations Manager', salary: 35000, contactNumber: '+91 94223 12346', joiningDate: '2026-01-02', status: 'Active' },
  { id: 'st2', profileId: 'u3', fullName: 'Kiran Zodge', role: 'Manager', designation: 'Finance & Booking Manager', salary: 32000, contactNumber: '+91 94224 12347', joiningDate: '2026-01-03', status: 'Active' },
];

const SEED_ATTENDANCE: AttendanceRecord[] = [];
const SEED_GENERATORS_INFO: GeneratorInfo[] = [
  { id: 'gen_70kva', name: '70 kVA Silent Genset (Main)', capacityKVA: 70, status: 'Operational' },
  { id: 'gen_25kva', name: '25 kVA Silent Genset (Aux/Kitchen)', capacityKVA: 25, status: 'Operational' }
];

const SEED_GENERATOR_LOGS: GeneratorLog[] = [];
const SEED_EXPENSES: Expense[] = [];
const SEED_DOCUMENTS: Document[] = [];

const SEED_WHATSAPP: WhatsAppTemplate[] = [
  { id: 'w1', templateName: 'Booking Confirmation', messageBody: 'Namaskar {{customer_name}}, Dhanyawad! Your booking for {{event_type}} at Bhagyalaxmi Lawns on {{event_date}} is confirmed. Booking ID: {{booking_id}}. We look forward to hosting your celebration! - Bhagyalaxmi Lawns', variables: ['customer_name', 'event_type', 'event_date', 'booking_id'], isActive: true },
  { id: 'w2', templateName: 'Advance Reminder', messageBody: 'Hello {{customer_name}}, a friendly reminder that the advance payment of Rs. {{advance_due}} for your {{event_type}} on {{event_date}} is pending. Kindly complete payment via the following link: {{payment_link}} - Bhagyalaxmi Lawns', variables: ['customer_name', 'advance_due', 'event_type', 'event_date', 'payment_link'], isActive: true },
  { id: 'w3', templateName: 'Balance Reminder', messageBody: 'Hello {{customer_name}}, your event {{event_type}} is scheduled on {{event_date}}. The remaining balance of Rs. {{balance_due}} is due by {{due_date}}. You can pay using UPI or Net Banking. Thank you! - Bhagyalaxmi Lawns', variables: ['customer_name', 'event_type', 'event_date', 'balance_due', 'due_date'], isActive: true },
  { id: 'w4', templateName: 'Thank You & Feedback', messageBody: 'Namaskar {{customer_name}}, thank you for choosing Bhagyalaxmi Lawns for your special day. We hope you and your guests had a memorable experience. Please share your valuable feedback here: {{feedback_link}} - Bhagyalaxmi Lawns', variables: ['customer_name', 'feedback_link'], isActive: true },
];

const SEED_AUDIT_LOGS: AuditLog[] = [];

// ==========================================
// IN-MEMORY DATABASE CACHE
// ==========================================
let cacheProfiles: Profile[] = [...SEED_PROFILES];
let cacheVenues: Venue[] = [...SEED_VENUES];
let cacheServices: Service[] = [...SEED_SERVICES];
let cachePackages: Package[] = [...SEED_PACKAGES];
let cacheVendors: Vendor[] = [...SEED_VENDORS];
let cacheCustomers: Customer[] = [...SEED_CUSTOMERS];
let cacheBookings: Booking[] = [...SEED_BOOKINGS];
let cachePayments: Payment[] = [...SEED_PAYMENTS];
let cacheInvoices: Invoice[] = [...SEED_INVOICES];
let cacheChecklist: ChecklistTask[] = [];
let cacheStaff: StaffMember[] = [...SEED_STAFF];
let cacheAttendance: AttendanceRecord[] = [];
let cacheGeneratorsInfo: GeneratorInfo[] = [...SEED_GENERATORS_INFO];
let cacheGeneratorLogs: GeneratorLog[] = [];
let cacheExpenses: Expense[] = [];
let cacheDocuments: Document[] = [];
let cacheWhatsAppTemplates: WhatsAppTemplate[] = [...SEED_WHATSAPP];
let cacheAuditLogs: AuditLog[] = [];
let activeUserId = 'u2';

// Seed Roles utility lookup (Supabase role uuid <-> role string)
export let roleIdToName: Record<string, string> = {};
export let roleNameToId: Record<string, string> = {};

export const setRolesLookups = (roles: { id: string, name: string }[]) => {
  roles.forEach(r => {
    roleIdToName[r.id] = r.name;
    roleNameToId[r.name] = r.id;
  });
};

// ==========================================
// CAMEL/SNAKE CONVERSION UTILITIES
// ==========================================
export const camelToSnake = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  if (typeof obj === 'object') {
    const res: any = {};
    for (const key of Object.keys(obj)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      res[snakeKey] = camelToSnake(obj[key]);
    }
    return res;
  }
  return obj;
};

export const snakeToCamel = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (typeof obj === 'object') {
    const res: any = {};
    for (const key of Object.keys(obj)) {
      const camelKey = key.replace(/([-_][a-z])/g, group =>
        group.toUpperCase().replace('-', '').replace('_', '')
      );
      res[camelKey] = snakeToCamel(obj[key]);
    }
    return res;
  }
  return obj;
};

// ==========================================
// CLOUD SYNC HELPER
// ==========================================
const syncToSupabase = async (table: string, action: 'insert' | 'update' | 'delete', data: any, idColumn: string = 'id') => {
  if (!isSupabaseConfigured()) return;
  try {
    const dbData = camelToSnake(data);
    
    // Schema manual transforms
    if (table === 'profiles') {
      const roleId = roleNameToId[data.role];
      if (roleId) {
        dbData.role_id = roleId;
        delete dbData.role;
      }
    }
    if (table === 'staff') {
      delete dbData.full_name;
      delete dbData.role;
      delete dbData.status;
    }

    if (action === 'insert') {
      await supabase.from(table).insert(dbData);
    } else if (action === 'update') {
      await supabase.from(table).update(dbData).eq(idColumn, data[idColumn]);
    }
  } catch (err) {
    console.error(`Supabase Sync Error [${table} - ${action}]:`, err);
  }
};

// ==========================================
// PUBLIC DATABASE APIs
// ==========================================
export const db = {
  // Sync initialization called by DatabaseProvider
  setInMemoryData: (data: {
    profiles?: Profile[];
    venues?: Venue[];
    services?: Service[];
    packages?: Package[];
    vendors?: Vendor[];
    customers?: Customer[];
    bookings?: Booking[];
    payments?: Payment[];
    invoices?: Invoice[];
    checklist?: ChecklistTask[];
    staff?: StaffMember[];
    attendance?: AttendanceRecord[];
    generatorsInfo?: GeneratorInfo[];
    generatorLogs?: GeneratorLog[];
    expenses?: Expense[];
    documents?: Document[];
    whatsappTemplates?: WhatsAppTemplate[];
    auditLogs?: AuditLog[];
  }) => {
    if (data.profiles) cacheProfiles = data.profiles;
    if (data.venues) cacheVenues = data.venues;
    if (data.services) cacheServices = data.services;
    if (data.packages) cachePackages = data.packages;
    if (data.vendors) cacheVendors = data.vendors;
    if (data.customers) cacheCustomers = data.customers;
    if (data.bookings) cacheBookings = data.bookings;
    if (data.payments) cachePayments = data.payments;
    if (data.invoices) cacheInvoices = data.invoices;
    if (data.checklist) cacheChecklist = data.checklist;
    if (data.staff) cacheStaff = data.staff;
    if (data.attendance) cacheAttendance = data.attendance;
    if (data.generatorsInfo) cacheGeneratorsInfo = data.generatorsInfo;
    if (data.generatorLogs) cacheGeneratorLogs = data.generatorLogs;
    if (data.expenses) cacheExpenses = data.expenses;
    if (data.documents) cacheDocuments = data.documents;
    if (data.whatsappTemplates) cacheWhatsAppTemplates = data.whatsappTemplates;
    if (data.auditLogs) cacheAuditLogs = data.auditLogs;
  },

  // Profiles
  getProfiles: (): Profile[] => cacheProfiles,
  
  // Active Session
  getCurrentUser: (): Profile => {
    return cacheProfiles.find(p => p.id === activeUserId) || cacheProfiles[0] || SEED_PROFILES[0];
  },
  setCurrentUser: (userId: string): void => {
    activeUserId = userId;
    const user = cacheProfiles.find(p => p.id === userId);
    if (user) {
      db.addAuditLog(userId, `Switched session role to ${user.role}`, 'profiles');
    }
  },

  // Customers
  getCustomers: (): Customer[] => cacheCustomers,
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCust: Customer = {
      ...cust,
      id: `c_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    cacheCustomers.push(newCust);
    syncToSupabase('customers', 'insert', newCust);
    db.addAuditLog(db.getCurrentUser().id, `Added Customer ${newCust.fullName}`, 'customers');
    return newCust;
  },
  updateCustomer: (id: string, updates: Partial<Customer>): Customer => {
    const idx = cacheCustomers.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Customer not found');
    cacheCustomers[idx] = { ...cacheCustomers[idx], ...updates };
    syncToSupabase('customers', 'update', cacheCustomers[idx]);
    db.addAuditLog(db.getCurrentUser().id, `Updated Customer ${cacheCustomers[idx].fullName}`, 'customers');
    return cacheCustomers[idx];
  },

  // Venues
  getVenues: (): Venue[] => cacheVenues,
  updateVenue: (id: string, updates: Partial<Venue>): Venue => {
    const idx = cacheVenues.findIndex(v => v.id === id);
    if (idx === -1) throw new Error('Venue not found');
    cacheVenues[idx] = { ...cacheVenues[idx], ...updates };
    syncToSupabase('venues', 'update', cacheVenues[idx]);
    db.addAuditLog(db.getCurrentUser().id, `Updated Venue Status for ${cacheVenues[idx].name}`, 'venues');
    return cacheVenues[idx];
  },

  // Services & Packages
  getServices: (): Service[] => cacheServices,
  getPackages: (): Package[] => cachePackages,
  addPackage: (pkg: Omit<Package, 'id'>): Package => {
    const newPkg: Package = { ...pkg, id: `pkg_${Date.now()}` };
    cachePackages.push(newPkg);
    syncToSupabase('packages', 'insert', newPkg);
    db.addAuditLog(db.getCurrentUser().id, `Created Service Package ${newPkg.name}`, 'packages');
    return newPkg;
  },

  // Bookings
  getBookings: (): Booking[] => cacheBookings,
  addBooking: (bkg: Omit<Booking, 'id' | 'bookingNumber' | 'createdAt' | 'balanceAmount'>): Booking => {
    const count = cacheBookings.filter(b => b.bookingNumber.startsWith(`BL-${new Date().getFullYear()}`)).length + 1;
    const bookingNumber = `BL-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${count.toString().padStart(4, '0')}`;
    
    // Check overlap
    const hasOverlap = cacheBookings.some(b => 
      b.venueId === bkg.venueId && 
      b.eventDate === bkg.eventDate && 
      b.status !== 'Cancelled' &&
      (b.slotType === 'Full Day Slot' || bkg.slotType === 'Full Day Slot' || b.slotType === bkg.slotType)
    );
    
    if (hasOverlap) {
      throw new Error(`Double booking clash! The venue is already booked for this date and slot.`);
    }

    const newBooking: Booking = {
      ...bkg,
      id: `b_${Date.now()}`,
      bookingNumber,
      balanceAmount: bkg.totalAmount - bkg.advancePaid,
      createdAt: new Date().toISOString()
    };
    cacheBookings.push(newBooking);
    syncToSupabase('bookings', 'insert', newBooking);

    // Auto generate invoice & operations checklist
    db.createInvoiceForBooking(newBooking);
    db.createDefaultChecklist(newBooking.id);

    db.addAuditLog(db.getCurrentUser().id, `Created Booking ${newBooking.bookingNumber} for ${newBooking.eventType}`, 'bookings');
    return newBooking;
  },
  updateBooking: (id: string, updates: Partial<Booking>): Booking => {
    const idx = cacheBookings.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Booking not found');
    
    const prevStatus = cacheBookings[idx].status;
    const merged = { ...cacheBookings[idx], ...updates };
    merged.balanceAmount = merged.totalAmount - merged.advancePaid;
    cacheBookings[idx] = merged;
    syncToSupabase('bookings', 'update', merged);

    // Update invoice
    db.updateInvoiceForBooking(merged);

    if (prevStatus !== merged.status) {
      db.addAuditLog(db.getCurrentUser().id, `Changed Booking ${merged.bookingNumber} status to ${merged.status}`, 'bookings');
    } else {
      db.addAuditLog(db.getCurrentUser().id, `Modified Booking Details for ${merged.bookingNumber}`, 'bookings');
    }
    return merged;
  },

  // Payments
  getPayments: (): Payment[] => cachePayments,
  addPayment: (pay: Omit<Payment, 'id' | 'paymentNumber' | 'paymentDate' | 'paymentStatus'>): Payment => {
    const paymentNumber = `BL-PAY-${(cachePayments.length + 10001)}`;
    const newPayment: Payment = {
      ...pay,
      id: `pay_${Date.now()}`,
      paymentNumber,
      paymentDate: new Date().toISOString(),
      paymentStatus: 'Success'
    };
    cachePayments.push(newPayment);
    syncToSupabase('payments', 'insert', newPayment);

    // Update booking balance
    const booking = cacheBookings.find(b => b.id === pay.bookingId);
    if (booking) {
      const newAdvance = Number(booking.advancePaid) + Number(pay.amount);
      const newStatus = newAdvance >= booking.totalAmount ? 'Confirmed' : 'Advance Paid';
      db.updateBooking(booking.id, {
        advancePaid: newAdvance,
        status: newStatus
      });
    }

    db.addAuditLog(db.getCurrentUser().id, `Recorded Payment ${newPayment.paymentNumber} of Rs. ${newPayment.amount}`, 'payments');
    return newPayment;
  },

  // Invoices
  getInvoices: (): Invoice[] => cacheInvoices,
  createInvoiceForBooking: (booking: Booking): Invoice => {
    const invoiceNumber = `BL-INV-${booking.bookingNumber.substring(3)}`;
    const grandTotal = booking.totalAmount;
    const subtotal = Number((grandTotal / 1.18).toFixed(2));
    const totalGst = Number((grandTotal - subtotal).toFixed(2));
    const cgstAmount = Number((totalGst / 2).toFixed(2));
    const sgstAmount = Number((totalGst / 2).toFixed(2));

    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber,
      bookingId: booking.id,
      subtotal,
      cgstRate: 9,
      sgstRate: 9,
      cgstAmount,
      sgstAmount,
      totalGst,
      grandTotal,
      advanceDeducted: booking.advancePaid,
      balanceDue: booking.balanceAmount,
      status: booking.advancePaid === 0 ? 'Unpaid' : (booking.balanceAmount === 0 ? 'Paid' : 'Partially Paid'),
      issuedDate: new Date().toISOString().split('T')[0],
      dueDate: booking.eventDate
    };
    
    cacheInvoices.push(newInvoice);
    syncToSupabase('invoices', 'insert', newInvoice);
    return newInvoice;
  },
  updateInvoiceForBooking: (booking: Booking): void => {
    const idx = cacheInvoices.findIndex(inv => inv.bookingId === booking.id);
    if (idx === -1) {
      db.createInvoiceForBooking(booking);
      return;
    }
    const inv = cacheInvoices[idx];
    
    const genHours = inv.generatorHours || 0;
    const genRate = inv.generatorRate || 0;
    const elecUnits = inv.electricityUnits || 0;
    const elecRate = inv.electricityRate || 0;
    const miscCost = inv.miscCost || 0;
    const extraCharges = (genHours * genRate) + (elecUnits * elecRate) + miscCost;

    const grandTotal = Number((booking.totalAmount + extraCharges).toFixed(2));
    const subtotal = Number((grandTotal / 1.18).toFixed(2));
    const totalGst = Number((grandTotal - subtotal).toFixed(2));
    const cgstAmount = Number((totalGst / 2).toFixed(2));
    const sgstAmount = Number((totalGst / 2).toFixed(2));
    const balanceDue = Number((grandTotal - booking.advancePaid).toFixed(2));

    cacheInvoices[idx] = {
      ...inv,
      subtotal,
      cgstAmount,
      sgstAmount,
      totalGst,
      grandTotal,
      advanceDeducted: booking.advancePaid,
      balanceDue,
      status: booking.advancePaid === 0 ? 'Unpaid' : (balanceDue <= 0 ? 'Paid' : 'Partially Paid'),
      dueDate: booking.eventDate
    };
    syncToSupabase('invoices', 'update', cacheInvoices[idx]);
  },
  updateInvoice: (id: string, updates: Partial<Invoice>): Invoice => {
    const idx = cacheInvoices.findIndex(inv => inv.id === id);
    if (idx === -1) throw new Error('Invoice not found');
    cacheInvoices[idx] = { ...cacheInvoices[idx], ...updates };
    syncToSupabase('invoices', 'update', cacheInvoices[idx]);
    db.addAuditLog(db.getCurrentUser().id, `Updated Invoice parameters for ${cacheInvoices[idx].invoiceNumber}`, 'invoices');
    return cacheInvoices[idx];
  },

  // Operations Checklist
  getChecklist: (): ChecklistTask[] => cacheChecklist,
  createDefaultChecklist: (bookingId: string): void => {
    const defaults: Omit<ChecklistTask, 'id' | 'bookingId' | 'updatedAt'>[] = [
      { taskName: 'Setup Main Entrance Gate Welcoming Banner', category: 'Decoration', status: 'Pending' },
      { taskName: 'Construct and Decorate Event Stage', category: 'Stage', status: 'Pending' },
      { taskName: 'Arrange Guest Chairs and Dining Tables', category: 'Stage', status: 'Pending' },
      { taskName: 'Setup DJ Sound System and Stage Spotlights', category: 'Sound', status: 'Pending' },
      { taskName: 'Check Kitchen Gas Rigs and Catering Area Cleanliness', category: 'Catering', status: 'Pending' },
      { taskName: 'Perform Generator Backup fuel fill-up (above 80%)', category: 'Generator', status: 'Pending' },
      { taskName: 'Prepare Bride Room and Groom Suite AC logs', category: 'Cleaning', status: 'Pending' },
      { taskName: 'Sanitize Washrooms & Service corridors', category: 'Cleaning', status: 'Pending' },
      { taskName: 'Mark VIP Parking Layout and allocate Bus spots', category: 'Parking', status: 'Pending' },
      { taskName: 'Brief Security Staff on Guest Entrance access logs', category: 'Security', status: 'Pending' },
    ];
    
    defaults.forEach((task, i) => {
      const newTask: ChecklistTask = {
        ...task,
        id: `ch_task_${bookingId}_${i}_${Date.now()}`,
        bookingId,
        updatedAt: new Date().toISOString()
      };
      cacheChecklist.push(newTask);
      syncToSupabase('operations_checklist', 'insert', newTask);
    });
  },
  updateChecklistTask: (id: string, updates: Partial<ChecklistTask>): ChecklistTask => {
    const idx = cacheChecklist.findIndex(task => task.id === id);
    if (idx === -1) throw new Error('Task not found');
    cacheChecklist[idx] = { 
      ...cacheChecklist[idx], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    syncToSupabase('operations_checklist', 'update', cacheChecklist[idx]);
    db.addAuditLog(db.getCurrentUser().id, `Marked Task "${cacheChecklist[idx].taskName}" as ${cacheChecklist[idx].status}`, 'operations_checklist');
    return cacheChecklist[idx];
  },

  // Vendors
  getVendors: (): Vendor[] => cacheVendors,
  addVendor: (vendor: Omit<Vendor, 'id' | 'rating' | 'createdAt'>): Vendor => {
    const newVendor: Vendor = {
      ...vendor,
      id: `vn_${Date.now()}`,
      rating: 5.0,
      createdAt: new Date().toISOString()
    };
    cacheVendors.push(newVendor);
    syncToSupabase('vendors', 'insert', newVendor);
    db.addAuditLog(db.getCurrentUser().id, `Registered Vendor ${newVendor.businessName || newVendor.name}`, 'vendors');
    return newVendor;
  },
  updateVendor: (id: string, updates: Partial<Vendor>): Vendor => {
    const idx = cacheVendors.findIndex(v => v.id === id);
    if (idx === -1) throw new Error('Vendor not found');
    cacheVendors[idx] = { ...cacheVendors[idx], ...updates };
    syncToSupabase('vendors', 'update', cacheVendors[idx]);
    db.addAuditLog(db.getCurrentUser().id, `Updated Vendor details for ${cacheVendors[idx].name}`, 'vendors');
    return cacheVendors[idx];
  },

  // Staff & Attendance
  getStaff: (): StaffMember[] => cacheStaff,
  getAttendance: (): AttendanceRecord[] => cacheAttendance,
  addStaff: (member: Omit<StaffMember, 'id' | 'joiningDate' | 'status'>): StaffMember => {
    const newMember: StaffMember = {
      ...member,
      id: `st_${Date.now()}`,
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    };
    cacheStaff.push(newMember);

    // Sync to Supabase staff table
    syncToSupabase('staff', 'insert', newMember);
    
    // Add user profile matching staff member
    const newProfile: Profile = {
      id: member.profileId,
      email: `${member.fullName.toLowerCase().replace(/\s+/g, '')}@bhagyalaxmi.com`,
      fullName: member.fullName,
      phone: member.contactNumber,
      role: member.role,
      status: 'Active',
      createdAt: new Date().toISOString()
    };
    cacheProfiles.push(newProfile);
    syncToSupabase('profiles', 'insert', newProfile);

    db.addAuditLog(db.getCurrentUser().id, `Hired Staff Member ${newMember.fullName}`, 'staff');
    return newMember;
  },
  logAttendance: (staffId: string, status: AttendanceRecord['status'], notes?: string): AttendanceRecord => {
    const today = new Date().toISOString().split('T')[0];
    const idx = cacheAttendance.findIndex(r => r.staffId === staffId && r.logDate === today);
    
    const record: AttendanceRecord = {
      id: idx !== -1 ? cacheAttendance[idx].id : `at_${Date.now()}`,
      staffId,
      logDate: today,
      checkIn: idx !== -1 ? cacheAttendance[idx].checkIn : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      checkOut: status === 'Absent' ? undefined : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      status,
      notes
    };

    if (idx !== -1) {
      cacheAttendance[idx] = record;
      syncToSupabase('attendance', 'update', record);
    } else {
      cacheAttendance.push(record);
      syncToSupabase('attendance', 'insert', record);
    }
    return record;
  },

  // Generators
  getGeneratorsInfo: (): GeneratorInfo[] => cacheGeneratorsInfo,
  getGeneratorLogs: (): GeneratorLog[] => cacheGeneratorLogs,
  addGeneratorLog: (log: Omit<GeneratorLog, 'id' | 'logDate'>): GeneratorLog => {
    const newLog: GeneratorLog = {
      ...log,
      id: `gen_${Date.now()}`,
      logDate: new Date().toISOString().split('T')[0]
    };
    cacheGeneratorLogs.unshift(newLog);
    syncToSupabase('generator_logs', 'insert', newLog);
    const gen = cacheGeneratorsInfo.find(g => g.id === log.generatorId);
    db.addAuditLog(db.getCurrentUser().id, `Logged parameters for Generator: ${gen ? gen.name : log.generatorId} (Fuel: ${log.fuelLevelPercent}%)`, 'generator_logs');
    return newLog;
  },
  updateGeneratorStatus: (id: string, status: GeneratorInfo['status']): void => {
    const idx = cacheGeneratorsInfo.findIndex(g => g.id === id);
    if (idx !== -1) {
      cacheGeneratorsInfo[idx].status = status;
      syncToSupabase('generators_info', 'update', cacheGeneratorsInfo[idx]);
      db.addAuditLog(db.getCurrentUser().id, `Updated Generator ${cacheGeneratorsInfo[idx].name} status to ${status}`, 'generators_info');
    }
  },

  // Expenses
  getExpenses: (): Expense[] => cacheExpenses,
  addExpense: (exp: Omit<Expense, 'id' | 'expenseDate'>): Expense => {
    const newExp: Expense = {
      ...exp,
      id: `exp_${Date.now()}`,
      expenseDate: new Date().toISOString().split('T')[0]
    };
    cacheExpenses.push(newExp);
    syncToSupabase('expenses', 'insert', newExp);
    db.addAuditLog(db.getCurrentUser().id, `Logged Business Expense: Rs. ${newExp.amount} for ${newExp.category}`, 'expenses');
    return newExp;
  },

  // Documents
  getDocuments: (): Document[] => cacheDocuments,
  addDocument: (doc: Omit<Document, 'id' | 'uploadedAt'>): Document => {
    const newDoc: Document = {
      ...doc,
      id: `doc_${Date.now()}`,
      uploadedAt: new Date().toISOString()
    };
    cacheDocuments.push(newDoc);
    syncToSupabase('documents', 'insert', newDoc);
    db.addAuditLog(db.getCurrentUser().id, `Uploaded ${doc.category} Document: ${doc.name}`, 'documents');
    return newDoc;
  },

  // WhatsApp templates
  getWhatsAppTemplates: (): WhatsAppTemplate[] => cacheWhatsAppTemplates,
  updateWhatsAppTemplate: (id: string, updates: Partial<WhatsAppTemplate>): WhatsAppTemplate => {
    const idx = cacheWhatsAppTemplates.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Template not found');
    cacheWhatsAppTemplates[idx] = { ...cacheWhatsAppTemplates[idx], ...updates };
    syncToSupabase('whatsapp_templates', 'update', cacheWhatsAppTemplates[idx]);
    db.addAuditLog(db.getCurrentUser().id, `Updated WhatsApp Message Template "${cacheWhatsAppTemplates[idx].templateName}"`, 'whatsapp_templates');
    return cacheWhatsAppTemplates[idx];
  },

  // Audit Logs
  getAuditLogs: (): AuditLog[] => cacheAuditLogs,
  addAuditLog: (userId: string, action: string, tableName: string): void => {
    const user = cacheProfiles.find(p => p.id === userId);
    const newLog: AuditLog = {
      id: `aud_${Date.now()}`,
      userId,
      userName: user ? user.fullName : 'System',
      action,
      tableName,
      timestamp: new Date().toISOString()
    };
    cacheAuditLogs.unshift(newLog);
    syncToSupabase('audit_logs', 'insert', newLog);
    if (cacheAuditLogs.length > 100) cacheAuditLogs = cacheAuditLogs.slice(0, 100);
  }
};
