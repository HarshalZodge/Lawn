// Stateful Mock Database for Bhagyalaxmi ERP
// Supports SSR safety and persists data to localStorage.

import { 
  Customer, Venue, Booking, Package, Service, Vendor, 
  Payment, Invoice, Document, ChecklistTask, StaffMember, 
  AttendanceRecord, GeneratorLog, GeneratorInfo, Expense, 
  WhatsAppTemplate, AuditLog, UserRole, Profile
} from '@/types';

// Helper to check if running in browser
const isBrowser = () => typeof window !== 'undefined';

// ==========================================
// SEED DATA
// ==========================================
const SEED_PROFILES: Profile[] = [
  { id: 'u1', email: 'owner@bhagyalaxmi.com', fullName: 'Deepak Zodge', phone: '+91 94222 12345', role: 'Owner', status: 'Active', createdAt: '2026-01-01T10:00:00Z' },
  { id: 'u2', email: 'harshal@bhagyalaxmi.com', fullName: 'Harshal Zodge', phone: '+91 94223 12346', role: 'Manager', status: 'Active', createdAt: '2026-01-02T10:00:00Z' },
  { id: 'u3', email: 'kiran@bhagyalaxmi.com', fullName: 'Kiran Zodge', phone: '+91 94224 12347', role: 'Manager', status: 'Active', createdAt: '2026-01-03T10:00:00Z' },
  { id: 'u4', email: 'coordinator@bhagyalaxmi.com', fullName: 'Vikram Shinde', phone: '+91 98220 98765', role: 'Event Coordinator', status: 'Active', createdAt: '2026-01-04T10:00:00Z' },
  { id: 'u5', email: 'reception@bhagyalaxmi.com', fullName: 'Priya Joshi', phone: '+91 98600 11223', role: 'Reception Staff', status: 'Active', createdAt: '2026-01-05T10:00:00Z' },
  { id: 'st5_user', email: 'arjun@bhagyalaxmi.com', fullName: 'Arjun Rathod', phone: '+91 98211 44556', role: 'Staff', status: 'Active', createdAt: '2026-02-01T10:00:00Z' },
  { id: 'st6_user', email: 'sunita@bhagyalaxmi.com', fullName: 'Sunita Gawade', phone: '+91 98500 77889', role: 'Staff', status: 'Active', createdAt: '2026-02-10T10:00:00Z' },
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
  { id: 'c1', fullName: 'Abhijit Shinde', phone: '+91 94220 12345', email: 'abhijit.shinde@gmail.com', address: 'Savedi, Ahilyanagar', aadhaarNumber: '123456789012', panNumber: 'ABCDE1234F', notes: 'VIP family. Groom is a software architect in Pune.', createdAt: '2026-05-01T10:00:00Z' },
  { id: 'c2', fullName: 'Savita Pawar', phone: '+91 98900 87654', email: 'savita.pawar@yahoo.com', address: 'Rahuri, Ahilyanagar District', aadhaarNumber: '987654321098', panNumber: 'WXYZ6789A', notes: 'Prefers mild traditional decorations. Granddaughter of local cooperative leader.', createdAt: '2026-05-15T12:00:00Z' },
  { id: 'c3', fullName: 'Rahul Deshmukh', phone: '+91 94230 45678', email: 'rahul@deshmukhmotors.com', address: 'Bhingar, Ahilyanagar', aadhaarNumber: '456712347890', panNumber: 'PQRST4567Z', notes: 'Local businessman. Booked Combined Venue for 2500+ guests.', createdAt: '2026-05-20T14:30:00Z' },
  { id: 'c4', fullName: 'Meera Kulkarni', phone: '+91 98600 54321', email: 'meera.kulkarni@gmail.com', address: 'Kothrud, Pune', aadhaarNumber: '567890123456', panNumber: 'LMNOP8901K', notes: 'Requested specific flower arrangements (Peacock feathers theme).', createdAt: '2026-06-01T09:15:00Z' },
];

// Today is June 11, 2026.
const SEED_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    bookingNumber: 'BL-202606-0001',
    customerId: 'c1',
    venueId: 'v3',
    packageId: 'p2',
    eventType: 'Wedding',
    eventDate: '2026-06-12', // Tomorrow
    slotType: 'Full Day Slot',
    guestCount: 1500,
    decorationTheme: 'Heritage Paithani Royal Theme',
    cateringVendorId: 'vn1',
    specialRequests: 'Need clean rooms early by 5:00 AM. Generator backup checked twice.',
    totalAmount: 350000,
    advancePaid: 150000,
    balanceAmount: 200000,
    status: 'Confirmed',
    createdAt: '2026-05-02T11:00:00Z',
  },
  {
    id: 'b2',
    bookingNumber: 'BL-202606-0002',
    customerId: 'c2',
    venueId: 'v1',
    packageId: 'p1',
    eventType: 'Haldi',
    eventDate: '2026-06-12', // Tomorrow morning
    slotType: 'Morning Slot',
    guestCount: 500,
    decorationTheme: 'Yellow Marigold Floral Canopy',
    cateringVendorId: 'vn1',
    specialRequests: 'Haldi staging with fresh yellow and orange marigolds.',
    totalAmount: 180000,
    advancePaid: 50000,
    balanceAmount: 130000,
    status: 'Advance Paid',
    createdAt: '2026-05-16T10:00:00Z',
  },
  {
    id: 'b3',
    bookingNumber: 'BL-202606-0003',
    customerId: 'c3',
    venueId: 'v3',
    packageId: 'p3',
    eventType: 'Reception',
    eventDate: '2026-06-18', // Next week
    slotType: 'Evening Slot',
    guestCount: 2500,
    decorationTheme: 'Modern Glassmorphic LED Backlight Theme',
    cateringVendorId: 'vn1',
    specialRequests: 'Require tight security at VIP entrance. 5 VIP parking slots allocated.',
    totalAmount: 280000,
    advancePaid: 280000,
    balanceAmount: 0,
    status: 'Confirmed', // Fully Paid Event
    createdAt: '2026-05-21T15:00:00Z',
  },
  {
    id: 'b4',
    bookingNumber: 'BL-202606-0004',
    customerId: 'c4',
    venueId: 'v2',
    eventType: 'Engagement',
    eventDate: '2026-06-25', // Late June
    slotType: 'Afternoon Slot',
    guestCount: 350,
    decorationTheme: 'Classic Pastel Orchids and Lilies',
    specialRequests: 'Requires sound permit check and customized seating layout.',
    totalAmount: 200000,
    advancePaid: 0,
    balanceAmount: 200000,
    status: 'Pending',
    createdAt: '2026-06-02T10:00:00Z',
  },
  {
    id: 'b5',
    bookingNumber: 'BL-202605-0098',
    customerId: 'c1',
    venueId: 'v1',
    eventType: 'Engagement',
    eventDate: '2026-05-10', // Past event
    slotType: 'Morning Slot',
    guestCount: 600,
    decorationTheme: 'Traditional Mango Leaves and Roses',
    totalAmount: 150000,
    advancePaid: 150000,
    balanceAmount: 0,
    status: 'Completed',
    createdAt: '2026-04-10T09:00:00Z',
  }
];

const SEED_PAYMENTS: Payment[] = [
  { id: 'pay1', bookingId: 'b1', paymentNumber: 'BL-PAY-10001', amount: 150000, paymentDate: '2026-05-02T11:30:00Z', paymentMethod: 'Bank Transfer', transactionId: 'TXN987654321', paymentStatus: 'Success', notes: 'Initial booking advance deposit.' },
  { id: 'pay2', bookingId: 'b2', paymentNumber: 'BL-PAY-10002', amount: 50000, paymentDate: '2026-05-16T10:45:00Z', paymentMethod: 'UPI', transactionId: 'upi.9890087654@paytm', paymentStatus: 'Success', notes: 'Haldi booking partial advance.' },
  { id: 'pay3', bookingId: 'b3', paymentNumber: 'BL-PAY-10003', amount: 280000, paymentDate: '2026-05-21T15:20:00Z', paymentMethod: 'Razorpay', transactionId: 'pay_Nsh928nsl19', paymentStatus: 'Success', notes: 'Full package payment made via online link.' },
  { id: 'pay4', bookingId: 'b5', paymentNumber: 'BL-PAY-10000', amount: 150000, paymentDate: '2026-04-10T09:30:00Z', paymentMethod: 'Cash', paymentStatus: 'Success', notes: 'Handed over in office.' },
];

const SEED_INVOICES: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'BL-INV-202606-0001',
    bookingId: 'b1',
    subtotal: 296610.17, // 350000 / 1.18
    cgstRate: 9,
    sgstRate: 9,
    cgstAmount: 26694.92,
    sgstAmount: 26694.92,
    totalGst: 53389.83,
    grandTotal: 350000,
    advanceDeducted: 150000,
    balanceDue: 200000,
    status: 'Partially Paid',
    issuedDate: '2026-05-02',
    dueDate: '2026-06-11',
  },
  {
    id: 'inv2',
    invoiceNumber: 'BL-INV-202606-0002',
    bookingId: 'b2',
    subtotal: 152542.37,
    cgstRate: 9,
    sgstRate: 9,
    cgstAmount: 13728.81,
    sgstAmount: 13728.81,
    totalGst: 27457.63,
    grandTotal: 180000,
    advanceDeducted: 50000,
    balanceDue: 130000,
    status: 'Partially Paid',
    issuedDate: '2026-05-16',
    dueDate: '2026-06-11',
  },
  {
    id: 'inv3',
    invoiceNumber: 'BL-INV-202606-0003',
    bookingId: 'b3',
    subtotal: 237288.14,
    cgstRate: 9,
    sgstRate: 9,
    cgstAmount: 21355.93,
    sgstAmount: 21355.93,
    totalGst: 42711.86,
    grandTotal: 280000,
    advanceDeducted: 280000,
    balanceDue: 0,
    status: 'Paid',
    issuedDate: '2026-05-21',
    dueDate: '2026-06-18',
  },
];

const SEED_CHECKLISTS: ChecklistTask[] = [
  // Live Tasks for Booking 1 (Tomorrow's Royal Wedding)
  { id: 'ch1', bookingId: 'b1', taskName: 'Install Royal Heritage Paithani Stage Decor', category: 'Stage', status: 'In Progress', assignedStaffId: 'u4', updatedAt: '2026-06-11T21:00:00Z' },
  { id: 'ch2', bookingId: 'b1', taskName: 'Arrange Wedding Hall Seating (1000 chairs)', category: 'Stage', status: 'Completed', assignedStaffId: 'u4', updatedAt: '2026-06-11T18:00:00Z' },
  { id: 'ch3', bookingId: 'b1', taskName: 'Verify Kitchen gas pipelines & water supply', category: 'Catering', status: 'Completed', assignedStaffId: 'u2', updatedAt: '2026-06-11T16:30:00Z' },
  { id: 'ch4', bookingId: 'b1', taskName: 'Setup Buffet Tables & Premium Lawn Layout', category: 'Catering', status: 'In Progress', assignedStaffId: 'u4', updatedAt: '2026-06-11T20:15:00Z' },
  { id: 'ch5', bookingId: 'b1', taskName: 'Test JBL Sound Rigs & Stage Lights', category: 'Sound', status: 'Completed', assignedStaffId: 'u4', updatedAt: '2026-06-11T19:00:00Z' },
  { id: 'ch6', bookingId: 'b1', taskName: 'Deep clean Bride & Groom AC Suites', category: 'Cleaning', status: 'Completed', assignedStaffId: 'u5', updatedAt: '2026-06-11T15:00:00Z' },
  { id: 'ch7', bookingId: 'b1', taskName: 'Check diesel fuel levels in dual generator units', category: 'Generator', status: 'Pending', assignedStaffId: 'u2', updatedAt: '2026-06-11T10:00:00Z' },
  { id: 'ch8', bookingId: 'b1', taskName: 'Startup test run on 70 kVA and 25 kVA generator units', category: 'Generator', status: 'Completed', assignedStaffId: 'u4', updatedAt: '2026-06-11T17:30:00Z' },
  { id: 'ch9', bookingId: 'b1', taskName: 'Deploy 4 VIP Security Guards at Entrance Gate', category: 'Security', status: 'Pending', assignedStaffId: 'u2', updatedAt: '2026-06-11T10:00:00Z' },
  
  // Tasks for Booking 2 (Tomorrow's Haldi)
  { id: 'ch2_1', bookingId: 'b2', taskName: 'Haldi Canopy Floral Setup', category: 'Stage', status: 'In Progress', assignedStaffId: 'u4', updatedAt: '2026-06-11T20:00:00Z' },
  { id: 'ch2_2', bookingId: 'b2', taskName: 'Setup traditional morning breakfast counter', category: 'Catering', status: 'Pending', assignedStaffId: 'u2', updatedAt: '2026-06-11T10:00:00Z' },
];

const SEED_STAFF: StaffMember[] = [
  { id: 'st_owner', profileId: 'u1', fullName: 'Deepak Zodge', role: 'Owner', designation: 'Managing Director & Owner', salary: 150000, contactNumber: '+91 94222 12345', joiningDate: '2026-01-01', status: 'Active' },
  { id: 'st1', profileId: 'u2', fullName: 'Harshal Zodge', role: 'Manager', designation: 'Operations Manager', salary: 35000, contactNumber: '+91 94223 12346', joiningDate: '2026-01-02', status: 'Active' },
  { id: 'st2', profileId: 'u3', fullName: 'Kiran Zodge', role: 'Manager', designation: 'Finance & Booking Manager', salary: 32000, contactNumber: '+91 94224 12347', joiningDate: '2026-01-03', status: 'Active' },
  { id: 'st3', profileId: 'u4', fullName: 'Vikram Shinde', role: 'Event Coordinator', designation: 'Site Coordinator', salary: 22000, contactNumber: '+91 98220 98765', joiningDate: '2026-01-04', status: 'Active' },
  { id: 'st4', profileId: 'u5', fullName: 'Priya Joshi', role: 'Reception Staff', designation: 'Front Desk Lead', salary: 18000, contactNumber: '+91 98600 11223', joiningDate: '2026-01-05', status: 'Active' },
  { id: 'st5', profileId: 'st5_user', fullName: 'Arjun Rathod', role: 'Staff', designation: 'Security Supervisor', salary: 15000, contactNumber: '+91 98211 44556', joiningDate: '2026-02-01', status: 'Active' },
  { id: 'st6', profileId: 'st6_user', fullName: 'Sunita Gawade', role: 'Staff', designation: 'Housekeeping Supervisor', salary: 12000, contactNumber: '+91 98500 77889', joiningDate: '2026-02-10', status: 'Active' },
];

const SEED_ATTENDANCE: AttendanceRecord[] = [
  { id: 'at_owner', staffId: 'st_owner', logDate: '2026-06-11', checkIn: '08:30', checkOut: '19:00', status: 'Present', notes: 'Venue supervision.' },
  { id: 'at1', staffId: 'st1', logDate: '2026-06-11', checkIn: '09:00', checkOut: '19:30', status: 'Present', notes: 'Managed lawn setup checks.' },
  { id: 'at2', staffId: 'st2', logDate: '2026-06-11', checkIn: '09:30', checkOut: '18:00', status: 'Present' },
  { id: 'at3', staffId: 'st3', logDate: '2026-06-11', checkIn: '08:45', checkOut: '21:30', status: 'Present', notes: 'Overtime for tomorrow setup preparation.' },
  { id: 'at4', staffId: 'st4', logDate: '2026-06-11', checkIn: '09:00', checkOut: '18:00', status: 'Present' },
  { id: 'at5', staffId: 'st5', logDate: '2026-06-11', checkIn: '07:00', checkOut: '19:00', status: 'Present' },
  { id: 'at6', staffId: 'st6', logDate: '2026-06-11', checkIn: '08:00', checkOut: '17:00', status: 'Present' },
];

const SEED_GENERATORS_INFO: GeneratorInfo[] = [
  { id: 'gen_70kva', name: '70 kVA Silent Genset (Main)', capacityKVA: 70, status: 'Operational' },
  { id: 'gen_25kva', name: '25 kVA Silent Genset (Aux/Kitchen)', capacityKVA: 25, status: 'Operational' }
];

const SEED_GENERATOR_LOGS: GeneratorLog[] = [
  { id: 'genl1', generatorId: 'gen_70kva', logDate: '2026-06-08', fuelLevelPercent: 95, runtimeHours: 4.5, backupStatus: 'Normal', serviceNotes: 'Refueled 60 liters diesel in Main Gen.' },
  { id: 'genl2', generatorId: 'gen_25kva', logDate: '2026-06-08', fuelLevelPercent: 90, runtimeHours: 1.0, backupStatus: 'Normal' },
  { id: 'genl3', generatorId: 'gen_70kva', logDate: '2026-06-11', fuelLevelPercent: 85, runtimeHours: 3.5, backupStatus: 'Normal', serviceNotes: 'Tested system for tomorrow\'s grand wedding. Load check stable.' },
  { id: 'genl4', generatorId: 'gen_25kva', logDate: '2026-06-11', fuelLevelPercent: 95, runtimeHours: 0.5, backupStatus: 'Normal' },
];

const SEED_EXPENSES: Expense[] = [
  { id: 'e1', category: 'Diesel', amount: 5500, expenseDate: '2026-06-08', description: '60 Liters for backup Generator' },
  { id: 'e2', category: 'Maintenance', amount: 8000, expenseDate: '2026-06-05', description: 'AC unit servicing in Bride room and Groom suite' },
  { id: 'e3', category: 'Office Supplies', amount: 1800, expenseDate: '2026-06-10', description: 'Printing papers & bill book printing' },
  { id: 'e4', category: 'Salary', amount: 130000, expenseDate: '2026-06-01', description: 'Staff salaries for May 2026' },
  { id: 'e5', category: 'Electricity', amount: 24000, expenseDate: '2026-06-02', description: 'MSEDCL electricity bill payment' },
];

const SEED_DOCUMENTS: Document[] = [
  { id: 'doc1', customerId: 'c1', bookingId: 'b1', name: 'Abhijit_Shinde_Aadhaar.pdf', category: 'Aadhaar', filePath: '#', uploadedAt: '2026-05-02T11:15:00Z' },
  { id: 'doc2', customerId: 'c1', bookingId: 'b1', name: 'Bhagyalaxmi_Agreement_BL-202606-0001.pdf', category: 'Agreement', filePath: '#', uploadedAt: '2026-05-02T11:20:00Z' },
  { id: 'doc3', customerId: 'c2', bookingId: 'b2', name: 'Savita_Pawar_PAN.pdf', category: 'PAN', filePath: '#', uploadedAt: '2026-05-16T10:15:00Z' },
];

const SEED_WHATSAPP: WhatsAppTemplate[] = [
  { id: 'w1', templateName: 'Booking Confirmation', messageBody: 'Namaskar {{customer_name}}, Dhanyawad! Your booking for {{event_type}} at Bhagyalaxmi Lawns on {{event_date}} is confirmed. Booking ID: {{booking_id}}. We look forward to hosting your celebration! - Bhagyalaxmi Lawns', variables: ['customer_name', 'event_type', 'event_date', 'booking_id'], isActive: true },
  { id: 'w2', templateName: 'Advance Reminder', messageBody: 'Hello {{customer_name}}, a friendly reminder that the advance payment of Rs. {{advance_due}} for your {{event_type}} on {{event_date}} is pending. Kindly complete payment via the following link: {{payment_link}} - Bhagyalaxmi Lawns', variables: ['customer_name', 'advance_due', 'event_type', 'event_date', 'payment_link'], isActive: true },
  { id: 'w3', templateName: 'Balance Reminder', messageBody: 'Hello {{customer_name}}, your event {{event_type}} is scheduled on {{event_date}}. The remaining balance of Rs. {{balance_due}} is due by {{due_date}}. You can pay using UPI or Net Banking. Thank you! - Bhagyalaxmi Lawns', variables: ['customer_name', 'event_type', 'event_date', 'balance_due', 'due_date'], isActive: true },
  { id: 'w4', templateName: 'Thank You & Feedback', messageBody: 'Namaskar {{customer_name}}, thank you for choosing Bhagyalaxmi Lawns for your special day. We hope you and your guests had a memorable experience. Please share your valuable feedback here: {{feedback_link}} - Bhagyalaxmi Lawns', variables: ['customer_name', 'feedback_link'], isActive: true },
];

const SEED_AUDIT_LOGS: AuditLog[] = [
  { id: 'aud1', userId: 'u2', userName: 'Harshal Zodge', action: 'Created Booking BL-202606-0001', tableName: 'bookings', timestamp: '2026-05-02T11:00:00Z' },
  { id: 'aud2', userId: 'u3', userName: 'Kiran Zodge', action: 'Approved Payment for BL-202606-0001 (Rs. 1,50,000)', tableName: 'payments', timestamp: '2026-05-02T11:30:00Z' },
  { id: 'aud3', userId: 'u2', userName: 'Harshal Zodge', action: 'Logged Generator Service (Refueled diesel)', tableName: 'generator_logs', timestamp: '2026-06-08T10:00:00Z' },
  { id: 'aud4', userId: 'u4', userName: 'Vikram Shinde', action: 'Marked Stage Setup task IN PROGRESS for Booking BL-202606-0001', tableName: 'operations_checklist', timestamp: '2026-06-11T21:00:00Z' },
];

// ==========================================
// CORE STATE LOADER/WRITER
// ==========================================
// Seed versioning control to force reload new data schemas when code updates
if (isBrowser()) {
  const CURRENT_SEED_VERSION = 'v8';
  if (localStorage.getItem('bl_erp_seed_version') !== CURRENT_SEED_VERSION) {
    const keysToClear = [
      'profiles', 'venues', 'services', 'packages', 'vendors', 
      'customers', 'bookings', 'payments', 'invoices', 'checklist', 
      'staff', 'attendance', 'expenses', 'documents', 'whatsapp_templates', 
      'audit_logs', 'generator_logs', 'generators_info', 'parking_records', 
      'active_user_id'
    ];
    keysToClear.forEach(key => localStorage.removeItem(`bl_erp_${key}`));
    localStorage.setItem('bl_erp_seed_version', CURRENT_SEED_VERSION);
  }
}

const getStoreValue = <T>(key: string, defaultValue: T): T => {
  if (!isBrowser()) return defaultValue;
  const val = localStorage.getItem(`bl_erp_${key}`);
  if (!val) {
    localStorage.setItem(`bl_erp_${key}`, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(val);
  } catch (e) {
    return defaultValue;
  }
};

const setStoreValue = <T>(key: string, value: T): void => {
  if (!isBrowser()) return;
  localStorage.setItem(`bl_erp_${key}`, JSON.stringify(value));
};

// ==========================================
// PUBLIC DATABASE APIs
// ==========================================

export const db = {
  // Profiles
  getProfiles: (): Profile[] => getStoreValue('profiles', SEED_PROFILES),
  
  // Active User / Role selection
  getCurrentUser: (): Profile => {
    const profiles = db.getProfiles();
    const activeUserId = getStoreValue('active_user_id', 'u2'); // Default to Sanjay Patole (Manager)
    return profiles.find(p => p.id === activeUserId) || profiles[0];
  },
  setCurrentUser: (userId: string): void => {
    setStoreValue('active_user_id', userId);
    // Add audit log
    const user = db.getProfiles().find(p => p.id === userId);
    if (user) {
      db.addAuditLog(userId, `Switched session role to ${user.role}`, 'profiles');
    }
  },

  // Customers
  getCustomers: (): Customer[] => getStoreValue('customers', SEED_CUSTOMERS),
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const customers = db.getCustomers();
    const newCust: Customer = {
      ...cust,
      id: `c_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    customers.push(newCust);
    setStoreValue('customers', customers);
    db.addAuditLog(db.getCurrentUser().id, `Added Customer ${newCust.fullName}`, 'customers');
    return newCust;
  },
  updateCustomer: (id: string, updates: Partial<Customer>): Customer => {
    const customers = db.getCustomers();
    const idx = customers.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Customer not found');
    customers[idx] = { ...customers[idx], ...updates };
    setStoreValue('customers', customers);
    db.addAuditLog(db.getCurrentUser().id, `Updated Customer ${customers[idx].fullName}`, 'customers');
    return customers[idx];
  },

  // Venues
  getVenues: (): Venue[] => getStoreValue('venues', SEED_VENUES),
  updateVenue: (id: string, updates: Partial<Venue>): Venue => {
    const venues = db.getVenues();
    const idx = venues.findIndex(v => v.id === id);
    if (idx === -1) throw new Error('Venue not found');
    venues[idx] = { ...venues[idx], ...updates };
    setStoreValue('venues', venues);
    db.addAuditLog(db.getCurrentUser().id, `Updated Venue Status for ${venues[idx].name}`, 'venues');
    return venues[idx];
  },

  // Services & Packages
  getServices: (): Service[] => getStoreValue('services', SEED_SERVICES),
  getPackages: (): Package[] => getStoreValue('packages', SEED_PACKAGES),
  addPackage: (pkg: Omit<Package, 'id'>): Package => {
    const pkgs = db.getPackages();
    const newPkg: Package = { ...pkg, id: `pkg_${Date.now()}` };
    pkgs.push(newPkg);
    setStoreValue('packages', pkgs);
    db.addAuditLog(db.getCurrentUser().id, `Created Service Package ${newPkg.name}`, 'packages');
    return newPkg;
  },

  // Bookings
  getBookings: (): Booking[] => getStoreValue('bookings', SEED_BOOKINGS),
  addBooking: (bkg: Omit<Booking, 'id' | 'bookingNumber' | 'createdAt' | 'balanceAmount'>): Booking => {
    const bookings = db.getBookings();
    const count = bookings.filter(b => b.bookingNumber.startsWith(`BL-${new Date().getFullYear()}`)).length + 1;
    const bookingNumber = `BL-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${count.toString().padStart(4, '0')}`;
    
    // Check for double bookings on same venue + date + slot overlap
    const hasOverlap = bookings.some(b => 
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
    bookings.push(newBooking);
    setStoreValue('bookings', bookings);

    // Auto generate an invoice
    db.createInvoiceForBooking(newBooking);

    // Auto generate default operations checklist tasks
    db.createDefaultChecklist(newBooking.id);

    db.addAuditLog(db.getCurrentUser().id, `Created Booking ${newBooking.bookingNumber} for ${newBooking.eventType}`, 'bookings');
    return newBooking;
  },
  updateBooking: (id: string, updates: Partial<Booking>): Booking => {
    const bookings = db.getBookings();
    const idx = bookings.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Booking not found');
    
    const prevStatus = bookings[idx].status;
    const merged = { ...bookings[idx], ...updates };
    merged.balanceAmount = merged.totalAmount - merged.advancePaid;
    bookings[idx] = merged;
    setStoreValue('bookings', bookings);

    // Update corresponding invoice if totals changed
    db.updateInvoiceForBooking(merged);

    if (prevStatus !== merged.status) {
      db.addAuditLog(db.getCurrentUser().id, `Changed Booking ${merged.bookingNumber} status to ${merged.status}`, 'bookings');
    } else {
      db.addAuditLog(db.getCurrentUser().id, `Modified Booking Details for ${merged.bookingNumber}`, 'bookings');
    }
    return merged;
  },

  // Payments
  getPayments: (): Payment[] => getStoreValue('payments', SEED_PAYMENTS),
  addPayment: (pay: Omit<Payment, 'id' | 'paymentNumber' | 'paymentDate' | 'paymentStatus'>): Payment => {
    const payments = db.getPayments();
    const paymentNumber = `BL-PAY-${(payments.length + 10001)}`;
    const newPayment: Payment = {
      ...pay,
      id: `pay_${Date.now()}`,
      paymentNumber,
      paymentDate: new Date().toISOString(),
      paymentStatus: 'Success'
    };
    payments.push(newPayment);
    setStoreValue('payments', payments);

    // Update booking's advancePaid/balanceAmount
    const booking = db.getBookings().find(b => b.id === pay.bookingId);
    if (booking) {
      const isAdvance = booking.advancePaid === 0;
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
  getInvoices: (): Invoice[] => getStoreValue('invoices', SEED_INVOICES),
  createInvoiceForBooking: (booking: Booking): Invoice => {
    const invoices = db.getInvoices();
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
    
    invoices.push(newInvoice);
    setStoreValue('invoices', invoices);
    return newInvoice;
  },
  updateInvoiceForBooking: (booking: Booking): void => {
    const invoices = db.getInvoices();
    const idx = invoices.findIndex(inv => inv.bookingId === booking.id);
    if (idx === -1) {
      db.createInvoiceForBooking(booking);
      return;
    }
    const inv = invoices[idx];
    
    // Preserve custom metered and misc costs
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

    invoices[idx] = {
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
    setStoreValue('invoices', invoices);
  },
  updateInvoice: (id: string, updates: Partial<Invoice>): Invoice => {
    const invoices = db.getInvoices();
    const idx = invoices.findIndex(inv => inv.id === id);
    if (idx === -1) throw new Error('Invoice not found');
    invoices[idx] = { ...invoices[idx], ...updates };
    setStoreValue('invoices', invoices);
    db.addAuditLog(db.getCurrentUser().id, `Updated Invoice parameters for ${invoices[idx].invoiceNumber}`, 'invoices');
    return invoices[idx];
  },

  // Event Operations & Checklist Tasks
  getChecklist: (): ChecklistTask[] => getStoreValue('checklist', SEED_CHECKLISTS),
  createDefaultChecklist: (bookingId: string): void => {
    const list = db.getChecklist();
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
      list.push({
        ...task,
        id: `ch_task_${bookingId}_${i}_${Date.now()}`,
        bookingId,
        updatedAt: new Date().toISOString()
      });
    });
    setStoreValue('checklist', list);
  },
  updateChecklistTask: (id: string, updates: Partial<ChecklistTask>): ChecklistTask => {
    const list = db.getChecklist();
    const idx = list.findIndex(task => task.id === id);
    if (idx === -1) throw new Error('Task not found');
    list[idx] = { 
      ...list[idx], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    setStoreValue('checklist', list);
    
    // Add audit log
    db.addAuditLog(
      db.getCurrentUser().id, 
      `Marked Task "${list[idx].taskName}" as ${list[idx].status}`, 
      'operations_checklist'
    );
    return list[idx];
  },

  // Vendors
  getVendors: (): Vendor[] => getStoreValue('vendors', SEED_VENDORS),
  addVendor: (vendor: Omit<Vendor, 'id' | 'rating' | 'createdAt'>): Vendor => {
    const vendors = db.getVendors();
    const newVendor: Vendor = {
      ...vendor,
      id: `vn_${Date.now()}`,
      rating: 5.0,
      createdAt: new Date().toISOString()
    };
    vendors.push(newVendor);
    setStoreValue('vendors', vendors);
    db.addAuditLog(db.getCurrentUser().id, `Registered Vendor ${newVendor.businessName || newVendor.name}`, 'vendors');
    return newVendor;
  },
  updateVendor: (id: string, updates: Partial<Vendor>): Vendor => {
    const vendors = db.getVendors();
    const idx = vendors.findIndex(v => v.id === id);
    if (idx === -1) throw new Error('Vendor not found');
    vendors[idx] = { ...vendors[idx], ...updates };
    setStoreValue('vendors', vendors);
    db.addAuditLog(db.getCurrentUser().id, `Updated Vendor details for ${vendors[idx].name}`, 'vendors');
    return vendors[idx];
  },

  // Staff & Attendance
  getStaff: (): StaffMember[] => getStoreValue('staff', SEED_STAFF),
  getAttendance: (): AttendanceRecord[] => getStoreValue('attendance', SEED_ATTENDANCE),
  addStaff: (member: Omit<StaffMember, 'id' | 'joiningDate' | 'status'>): StaffMember => {
    const staff = db.getStaff();
    const newMember: StaffMember = {
      ...member,
      id: `st_${Date.now()}`,
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    };
    staff.push(newMember);
    setStoreValue('staff', staff);
    
    // Create matching user profile
    const profiles = db.getProfiles();
    profiles.push({
      id: member.profileId,
      email: `${member.fullName.toLowerCase().replace(/\s+/g, '')}@bhagyalaxmi.com`,
      fullName: member.fullName,
      phone: member.contactNumber,
      role: member.role,
      status: 'Active',
      createdAt: new Date().toISOString()
    });
    setStoreValue('profiles', profiles);

    db.addAuditLog(db.getCurrentUser().id, `Hired Staff Member ${newMember.fullName}`, 'staff');
    return newMember;
  },
  logAttendance: (staffId: string, status: AttendanceRecord['status'], notes?: string): AttendanceRecord => {
    const records = db.getAttendance();
    const today = new Date().toISOString().split('T')[0];
    const idx = records.findIndex(r => r.staffId === staffId && r.logDate === today);
    
    const record: AttendanceRecord = {
      id: idx !== -1 ? records[idx].id : `at_${Date.now()}`,
      staffId,
      logDate: today,
      checkIn: idx !== -1 ? records[idx].checkIn : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      checkOut: status === 'Absent' ? undefined : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      status,
      notes
    };

    if (idx !== -1) {
      records[idx] = record;
    } else {
      records.push(record);
    }
    setStoreValue('attendance', records);
    return record;
  },  // Generator logs
  getGeneratorsInfo: (): GeneratorInfo[] => getStoreValue('generators_info', SEED_GENERATORS_INFO),
  getGeneratorLogs: (): GeneratorLog[] => getStoreValue('generator_logs', SEED_GENERATOR_LOGS),
  addGeneratorLog: (log: Omit<GeneratorLog, 'id' | 'logDate'>): GeneratorLog => {
    const logs = db.getGeneratorLogs();
    const newLog: GeneratorLog = {
      ...log,
      id: `gen_${Date.now()}`,
      logDate: new Date().toISOString().split('T')[0]
    };
    logs.unshift(newLog); // newer logs first
    setStoreValue('generator_logs', logs);
    const gen = db.getGeneratorsInfo().find(g => g.id === log.generatorId);
    db.addAuditLog(db.getCurrentUser().id, `Logged parameters for Generator: ${gen ? gen.name : log.generatorId} (Fuel: ${log.fuelLevelPercent}%)`, 'generator_logs');
    return newLog;
  },
  updateGeneratorStatus: (id: string, status: GeneratorInfo['status']): void => {
    const gens = db.getGeneratorsInfo();
    const idx = gens.findIndex(g => g.id === id);
    if (idx !== -1) {
      gens[idx].status = status;
      setStoreValue('generators_info', gens);
      db.addAuditLog(db.getCurrentUser().id, `Updated Generator ${gens[idx].name} status to ${status}`, 'generators_info');
    }
  },
  // Expenses
  getExpenses: (): Expense[] => getStoreValue('expenses', SEED_EXPENSES),
  addExpense: (exp: Omit<Expense, 'id' | 'expenseDate'>): Expense => {
    const expenses = db.getExpenses();
    const newExp: Expense = {
      ...exp,
      id: `exp_${Date.now()}`,
      expenseDate: new Date().toISOString().split('T')[0]
    };
    expenses.push(newExp);
    setStoreValue('expenses', expenses);
    db.addAuditLog(db.getCurrentUser().id, `Logged Business Expense: Rs. ${newExp.amount} for ${newExp.category}`, 'expenses');
    return newExp;
  },

  // Documents
  getDocuments: (): Document[] => getStoreValue('documents', SEED_DOCUMENTS),
  addDocument: (doc: Omit<Document, 'id' | 'uploadedAt'>): Document => {
    const docs = db.getDocuments();
    const newDoc: Document = {
      ...doc,
      id: `doc_${Date.now()}`,
      uploadedAt: new Date().toISOString()
    };
    docs.push(newDoc);
    setStoreValue('documents', docs);
    db.addAuditLog(db.getCurrentUser().id, `Uploaded ${doc.category} Document: ${doc.name}`, 'documents');
    return newDoc;
  },

  // WhatsApp templates
  getWhatsAppTemplates: (): WhatsAppTemplate[] => getStoreValue('whatsapp_templates', SEED_WHATSAPP),
  updateWhatsAppTemplate: (id: string, updates: Partial<WhatsAppTemplate>): WhatsAppTemplate => {
    const temps = db.getWhatsAppTemplates();
    const idx = temps.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Template not found');
    temps[idx] = { ...temps[idx], ...updates };
    setStoreValue('whatsapp_templates', temps);
    db.addAuditLog(db.getCurrentUser().id, `Updated WhatsApp Message Template "${temps[idx].templateName}"`, 'whatsapp_templates');
    return temps[idx];
  },

  // Audit Logs
  getAuditLogs: (): AuditLog[] => getStoreValue('audit_logs', SEED_AUDIT_LOGS),
  addAuditLog: (userId: string, action: string, tableName: string): void => {
    const logs = db.getAuditLogs();
    const profiles = db.getProfiles();
    const user = profiles.find(p => p.id === userId);
    
    const newLog: AuditLog = {
      id: `aud_${Date.now()}`,
      userId,
      userName: user ? user.fullName : 'System',
      action,
      tableName,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog); // Newer logs at the top
    setStoreValue('audit_logs', logs.slice(0, 100)); // Cap at 100 logs
  }
};
