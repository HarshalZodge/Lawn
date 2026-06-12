-- Database Schema for Bhagyalaxmi ERP (Wedding Venue OS)
-- Target Platform: PostgreSQL (Supabase)
-- Safe to run multiple times (idempotent setup script)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ROLES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Roles (Safe check on duplicate role names)
INSERT INTO roles (name, description) VALUES
('Super Admin', 'Full system access and configurations'),
('Owner', 'View all financial statistics, analytics, forecasts, and manage managers'),
('Manager', 'Handle bookings, vendor allocations, slot schedules, and staff assignments'),
('Accountant', 'Manage payments, verify cash flow, edit packages, and generate GST invoices'),
('Reception Staff', 'Inquire customers, view calendar availability, and register visitors'),
('Event Coordinator', 'Check live checklists on wedding days, verify stage, sound, and decorator status'),
('Staff', 'Perform shifts, log attendance, update security or generator checklists')
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- 2. USERS & PROFILES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role_id UUID REFERENCES roles(id),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. CUSTOMERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100),
    address TEXT,
    aadhaar_number VARCHAR(12) UNIQUE,
    pan_number VARCHAR(10) UNIQUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. VENUES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    capacity INTEGER NOT NULL,
    base_price DECIMAL(12, 2) NOT NULL,
    amenities TEXT[],
    description TEXT,
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'Maintenance', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Venues (Safe check on duplicate venue names)
INSERT INTO venues (name, capacity, base_price, amenities, description) VALUES
('Wedding Hall', 1200, 150000.00, ARRAY['Air Conditioning', 'Chandelier Lighting', 'Sound System', 'Bride Room', 'Groom Room'], 'Luxurious indoor air-conditioned banquet hall with royal decor'),
('Open Lawn', 2500, 200000.00, ARRAY['Fountain', 'Premium Grass Turf', 'Stage Area', 'High Mast Lights', 'Buffet Area'], 'Spectacular outdoor green lawns perfect for grand wedding receptions and events'),
('Combined Venue', 3700, 300000.00, ARRAY['All Hall Amenities', 'All Lawn Amenities', 'VIP Entrance', 'Ample Valet Parking'], 'The ultimate luxury experience combining both the indoor hall and the outdoor lawns for maximum scale')
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- 5. PACKAGES & SERVICES
-- ==========================================
CREATE TABLE IF NOT EXISTS packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    base_price DECIMAL(12, 2) NOT NULL,
    included_services JSONB, -- list of service ids and quantities included
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- Catering, Decoration, DJ, Generator, Accomodation, Parking, Security
    default_price DECIMAL(12, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Services
INSERT INTO services (name, category, default_price, description) VALUES
('Royal Paithani Stage Decor', 'Decoration', 50000.00, 'Maharashtrian heritage-themed floral stage setup'),
('Traditional Buffet Catering', 'Catering', 450.00, 'Pure vegetarian Maharashtrian menu per plate'),
('Professional Wedding DJ & Lights', 'DJ', 25000.00, 'High-end sound system with intelligent stage lights'),
('Heavy-Duty Sound System', 'DJ', 15000.00, 'JBL sound rigs with cordless microphones'),
('Cinematic Wedding Photography', 'Photography', 60000.00, 'Traditional & candid coverage with high-end cameras'),
('Generator Fuel & Backup', 'Generator', 12000.00, '125 KVA silent backup with fuel coverage up to 6 hours'),
('Bride & Groom AC Rooms', 'Accommodation', 5000.00, 'Premium private dressing suites with restrooms'),
('Valet & Parking Marshals', 'Parking', 8000.00, '10 parking coordinators managing entrance/valet'),
('Armed Security Officers', 'Security', 15000.00, '4 professional bodyguards for gate and VIP control'),
('Live Shehnai & Dhol Tasha', 'Decoration', 18000.00, 'Traditional live welcoming musicians')
ON CONFLICT (name) DO NOTHING;

-- Seed Default Packages
INSERT INTO packages (name, description, base_price, included_services) VALUES
('Classic Wedding', 'Standard wedding hall booking including basic decor, bride room, generator, and parking assistance', 180000.00, '[]'),
('Royal Maharashtrian Heritage', 'Premium combined hall and lawn event with Royal Paithani stage decor, shehnai, full lighting setup, generator backup, security, and rooms', 350000.00, '[]'),
('Grand Reception & Dinner', 'Open lawn evening reception package with buffet caterer coordination, DJ system, VIP security, and lighting', 280000.00, '[]')
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- 6. VENDORS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    business_name VARCHAR(150),
    category VARCHAR(50) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100),
    contract_terms TEXT,
    rating DECIMAL(2, 1) DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Vendors
INSERT INTO vendors (name, business_name, category, phone, email, contract_terms) VALUES
('Sanjay Deshmukh', 'Shivaji Caterers', 'Catering', '9876543210', 'sanjay@shivajicaterers.com', 'Requires 20% advance, full payment 2 days before event. Pure Veg only.'),
('Vijay Kadam', 'Golden Stage Decorators', 'Decoration', '9876543211', 'vijay@goldendecor.com', 'Stage setup must begin 12 hours before event slot. Materials provided.'),
('DJ Rahul', 'Bassline Events Ahilyanagar', 'DJ', '9876543212', 'rahul@bassline.com', 'Permits for music after 10 PM to be managed by client/venue.'),
('Anil Shinde', 'Shinde Power Solutions', 'Generator', '9876543213', 'anil@shindepower.com', 'Supplies backup fuel. Maintenance logs shared monthly.')
ON CONFLICT (phone) DO NOTHING;

-- ==========================================
-- 7. BOOKINGS & SLOTS
-- ==========================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. BL-202606-0001
    customer_id UUID REFERENCES customers(id) NOT NULL,
    venue_id UUID REFERENCES venues(id) NOT NULL,
    package_id UUID REFERENCES packages(id),
    event_type VARCHAR(50) NOT NULL, -- Wedding, Reception, Haldi, Corporate, etc.
    event_date DATE NOT NULL,
    slot_type VARCHAR(30) NOT NULL CHECK (slot_type IN ('Morning Slot', 'Afternoon Slot', 'Evening Slot', 'Full Day Slot', 'Custom Slot')),
    guest_count INTEGER NOT NULL,
    decoration_theme VARCHAR(100),
    catering_vendor_id UUID REFERENCES vendors(id),
    special_requests TEXT,
    total_amount DECIMAL(12, 2) NOT NULL,
    advance_paid DECIMAL(12, 2) DEFAULT 0.00,
    balance_amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Advance Paid', 'Confirmed', 'Completed', 'Cancelled')),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 8. PAYMENTS & INVOICES
-- ==========================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) NOT NULL,
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50) NOT NULL, -- Razorpay, UPI, Cash, Bank Transfer, Cheque
    transaction_id VARCHAR(100),
    payment_status VARCHAR(20) DEFAULT 'Success' CHECK (payment_status IN ('Success', 'Pending', 'Failed')),
    received_by UUID REFERENCES profiles(id),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL, -- BL-INV-YYYYMM-XXXX
    booking_id UUID REFERENCES bookings(id) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    cgst_rate DECIMAL(4, 2) DEFAULT 9.00,
    sgst_rate DECIMAL(4, 2) DEFAULT 9.00,
    cgst_amount DECIMAL(12, 2) NOT NULL,
    sgst_amount DECIMAL(12, 2) NOT NULL,
    total_gst DECIMAL(12, 2) NOT NULL,
    grand_total DECIMAL(12, 2) NOT NULL,
    advance_deducted DECIMAL(12, 2) DEFAULT 0.00,
    balance_due DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Unpaid' CHECK (status IN ('Paid', 'Partially Paid', 'Unpaid', 'Overdue')),
    issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE
);

-- ==========================================
-- 9. DOCUMENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    booking_id UUID REFERENCES bookings(id),
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Agreement, Aadhaar, PAN, Receipt, Invoice, Vendor Contract
    file_path TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1
);

-- ==========================================
-- 10. OPERATIONS & TASKS
-- ==========================================
CREATE TABLE IF NOT EXISTS operations_checklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) NOT NULL,
    task_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Stage, Catering, Sound, Cleaning, Security, Generator, Parking
    status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    assigned_staff_id UUID REFERENCES profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 11. STAFF & ATTENDANCE
-- ==========================================
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) UNIQUE,
    designation VARCHAR(100) NOT NULL,
    salary DECIMAL(10, 2),
    contact_number VARCHAR(20) NOT NULL,
    joining_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES staff(id) NOT NULL,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in TIME,
    check_out TIME,
    status VARCHAR(20) DEFAULT 'Present' CHECK (status IN ('Present', 'Absent', 'Leave', 'Half-Day')),
    notes TEXT,
    UNIQUE(staff_id, log_date)
);

-- ==========================================
-- 12. GENERATOR & POWER TRACKING
-- ==========================================
CREATE TABLE IF NOT EXISTS generator_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generator_id VARCHAR(100),
    log_date DATE DEFAULT CURRENT_DATE,
    fuel_level_percent DECIMAL(5, 2) NOT NULL,
    runtime_hours DECIMAL(6, 2) NOT NULL,
    backup_status VARCHAR(50) DEFAULT 'Normal' CHECK (backup_status IN ('Normal', 'Active Backup', 'Maintenance Required')),
    service_notes TEXT,
    logged_by UUID REFERENCES profiles(id)
);

-- ==========================================
-- 13. PARKING RECORDS
-- ==========================================
CREATE TABLE IF NOT EXISTS parking_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_date DATE DEFAULT CURRENT_DATE,
    vip_spots_occupied INTEGER DEFAULT 0,
    bus_spots_occupied INTEGER DEFAULT 0,
    general_spots_occupied INTEGER DEFAULT 0,
    total_capacity INTEGER DEFAULT 250,
    current_available INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 14. FINANCIAL EXPENSES
-- ==========================================
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL, -- Salary, Diesel, Maintenance, Office Supplies, Electricity, Tax
    amount DECIMAL(12, 2) NOT NULL,
    expense_date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    receipt_url TEXT,
    logged_by UUID REFERENCES profiles(id)
);

-- ==========================================
-- 15. WHATSAPP & AUTOMATION TEMPLATES
-- ==========================================
CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(100) UNIQUE NOT NULL,
    message_body TEXT NOT NULL,
    variables JSONB, -- List of variables mapping (e.g. customer_name, event_date)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed WhatsApp Templates
INSERT INTO whatsapp_templates (template_name, message_body, variables) VALUES
('booking_confirmation', 'Namaskar {{customer_name}}, Dhanyawad! Your booking for {{event_type}} at Bhagyalaxmi Lawns on {{event_date}} is confirmed. Booking ID: {{booking_id}}. We look forward to hosting your celebration! - Bhagyalaxmi Lawns', '["customer_name", "event_type", "event_date", "booking_id"]'),
('advance_reminder', 'Hello {{customer_name}}, a friendly reminder that the advance payment of Rs. {{advance_due}} for your {{event_type}} on {{event_date}} is pending. Kindly complete payment via the following link: {{payment_link}} - Bhagyalaxmi Lawns', '["customer_name", "advance_due", "event_type", "event_date", "payment_link"]'),
('balance_reminder', 'Hello {{customer_name}}, your event {{event_type}} is scheduled on {{event_date}}. The remaining balance of Rs. {{balance_due}} is due by {{due_date}}. You can pay using UPI or Net Banking. Thank you! - Bhagyalaxmi Lawns', '["customer_name", "event_type", "event_date", "balance_due", "due_date"]'),
('thank_you_feedback', 'Namaskar {{customer_name}}, thank you for choosing Bhagyalaxmi Lawns for your special day. We hope you and your guests had a memorable experience. Please share your valuable feedback here: {{feedback_link}} - Bhagyalaxmi Lawns', '["customer_name", "feedback_link"]')
ON CONFLICT (template_name) DO NOTHING;

-- ==========================================
-- 16. AUDIT LOGS
-- ==========================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Simple Policies for Demonstration:
-- Owner & Manager can read/write everything. 
-- Accountants can read everything and write payments/invoices/expenses.
-- Staff can read their profiles and bookings, update operations_checklists.

-- Drop existing policies if running multiple times to avoid name collision errors
DROP POLICY IF EXISTS owner_manager_all ON profiles;
DROP POLICY IF EXISTS owner_manager_bookings ON bookings;

CREATE POLICY owner_manager_all ON profiles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles p 
        JOIN roles r ON p.role_id = r.id 
        WHERE p.id = auth.uid() AND r.name IN ('Owner', 'Manager', 'Super Admin')
    )
);

CREATE POLICY owner_manager_bookings ON bookings FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles p 
        JOIN roles r ON p.role_id = r.id 
        WHERE p.id = auth.uid() AND r.name IN ('Owner', 'Manager', 'Super Admin', 'Accountant', 'Event Coordinator')
    )
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_invoices_booking_id ON invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(log_date);
CREATE INDEX IF NOT EXISTS idx_operations_booking_id ON operations_checklist(booking_id);
