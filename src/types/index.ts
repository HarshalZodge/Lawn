// TypeScript Type Definitions for Bhagyalaxmi ERP

export type UserRole = 
  | 'Super Admin' 
  | 'Owner' 
  | 'Manager' 
  | 'Accountant' 
  | 'Reception Staff' 
  | 'Event Coordinator' 
  | 'Staff';

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface Venue {
  id: string;
  name: string;
  capacity: number;
  basePrice: number;
  amenities: string[];
  description: string;
  imageUrl?: string;
  status: 'Available' | 'Maintenance' | 'Inactive';
}

export type SlotType = 'Morning Slot' | 'Afternoon Slot' | 'Evening Slot' | 'Full Day Slot' | 'Custom Slot';

export type BookingStatus = 'Pending' | 'Advance Paid' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface Booking {
  id: string;
  bookingNumber: string; // BL-YYYYMM-XXXX
  customerId: string;
  venueId: string;
  packageId?: string;
  eventType: string; // Wedding, Reception, Engagement, Haldi, Birthday, Corporate, Custom
  eventDate: string; // YYYY-MM-DD
  slotType: SlotType;
  guestCount: number;
  decorationTheme?: string;
  cateringVendorId?: string;
  specialRequests?: string;
  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;
  status: BookingStatus;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  category: 'Decoration' | 'DJ' | 'Photography' | 'Catering' | 'Generator' | 'Accommodation' | 'Parking' | 'Security' | 'Custom';
  defaultPrice: number;
  description?: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  includedServices: string[]; // Service IDs
}

export interface Vendor {
  id: string;
  name: string;
  businessName?: string;
  category: 'Catering' | 'Decoration' | 'DJ' | 'Photography' | 'Generator' | 'Flower' | 'Sound' | 'Security';
  phone: string;
  email?: string;
  contractTerms?: string;
  rating: number; // 1.0 to 5.0
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  paymentNumber: string; // BL-PAY-XXXXX
  amount: number;
  paymentDate: string;
  paymentMethod: 'Razorpay' | 'UPI' | 'Cash' | 'Bank Transfer' | 'Cheque';
  transactionId?: string;
  paymentStatus: 'Success' | 'Pending' | 'Failed';
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // BL-INV-YYYYMM-XXXX
  bookingId: string;
  subtotal: number;
  cgstRate: number; // e.g. 9%
  sgstRate: number; // e.g. 9%
  cgstAmount: number;
  sgstAmount: number;
  totalGst: number;
  grandTotal: number;
  advanceDeducted: number;
  balanceDue: number;
  status: 'Paid' | 'Partially Paid' | 'Unpaid' | 'Overdue';
  issuedDate: string;
  dueDate?: string;
  // Metered billing attributes
  generatorHours?: number;
  generatorRate?: number;
  electricityUnits?: number;
  electricityRate?: number;
  miscCost?: number;
  miscDescription?: string;
}

export interface Document {
  id: string;
  customerId?: string;
  bookingId?: string;
  name: string;
  category: 'Agreement' | 'Aadhaar' | 'PAN' | 'Receipt' | 'Invoice' | 'Vendor Contract';
  filePath: string; // base64 or mock local URL
  uploadedAt: string;
}

export interface ChecklistTask {
  id: string;
  bookingId: string;
  taskName: string;
  category: 'Stage' | 'Catering' | 'Sound' | 'Cleaning' | 'Security' | 'Generator' | 'Parking' | 'Decoration' | 'Lighting' | 'Photography';
  status: 'Pending' | 'In Progress' | 'Completed';
  assignedStaffId?: string;
  updatedAt: string;
}

export interface StaffMember {
  id: string;
  profileId: string;
  fullName: string;
  role: UserRole;
  designation: string;
  salary?: number;
  contactNumber: string;
  joiningDate: string;
  status: 'Active' | 'Inactive';
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  logDate: string; // YYYY-MM-DD
  checkIn?: string; // HH:MM
  checkOut?: string; // HH:MM
  status: 'Present' | 'Absent' | 'Leave' | 'Half-Day';
  notes?: string;
}

export interface GeneratorLog {
  id: string;
  generatorId: string; // reference to GeneratorInfo.id
  logDate: string;
  fuelLevelPercent: number; // 0-100
  runtimeHours: number;
  backupStatus: 'Normal' | 'Active Backup' | 'Maintenance Required';
  serviceNotes?: string;
}

export interface GeneratorInfo {
  id: string;
  name: string; // e.g., 'Generator A'
  capacityKVA: number;
  status: 'Operational' | 'Under Maintenance' | 'Out of Service';
}

// Removed ParkingRecord as venue no longer uses parking.
// If needed in future, can be reintroduced.

export interface Expense {
  id: string;
  category: 'Salary' | 'Diesel' | 'Maintenance' | 'Office Supplies' | 'Electricity' | 'Tax' | 'Catering Payout' | 'Decor Payout' | 'Other';
  amount: number;
  expenseDate: string;
  description: string;
  receiptUrl?: string;
}

export interface WhatsAppTemplate {
  id: string;
  templateName: string;
  messageBody: string;
  variables: string[];
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  tableName: string;
  timestamp: string;
}
