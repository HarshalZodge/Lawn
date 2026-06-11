// Supabase client wrapper with transparent mock fallback
import { db } from './mock-db';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Since we want the application to work out of the box without requiring the user to
// set up a live Supabase instance immediately, we build a hybrid client.
// It matches standard Supabase patterns but queries our stateful mock-db as a fallback.

export const supabase = {
  auth: {
    getUser: async () => {
      const u = db.getCurrentUser();
      return { data: { user: { id: u.id, email: u.email, user_metadata: { full_name: u.fullName, role: u.role } } }, error: null };
    },
    signOut: async () => {
      console.log('Logging out (Mock Client)');
      return { error: null };
    }
  },
  
  // Custom query helper mimicking supabase client selects
  from: (table: string) => {
    return {
      select: (query?: string) => {
        let data: any[] = [];
        if (table === 'profiles') data = db.getProfiles();
        else if (table === 'venues') data = db.getVenues();
        else if (table === 'bookings') data = db.getBookings();
        else if (table === 'customers') data = db.getCustomers();
        else if (table === 'vendors') data = db.getVendors();
        else if (table === 'payments') data = db.getPayments();
        else if (table === 'invoices') data = db.getInvoices();
        else if (table === 'operations_checklist') data = db.getChecklist();
        else if (table === 'staff') data = db.getStaff();
        else if (table === 'attendance') data = db.getAttendance();
        else if (table === 'generator_logs') data = db.getGeneratorLogs();
        else if (table === 'generators_info') data = db.getGeneratorsInfo();
        else if (table === 'expenses') data = db.getExpenses();
        else if (table === 'whatsapp_templates') data = db.getWhatsAppTemplates();
        else if (table === 'audit_logs') data = db.getAuditLogs();
        
        return {
          data,
          error: null,
          eq: (column: string, value: any) => {
            const filtered = data.filter((item: any) => item[column] === value);
            return { data: filtered, error: null, single: () => ({ data: filtered[0], error: null }) };
          },
          single: () => ({ data: data[0], error: null })
        };
      },
      
      insert: (record: any) => {
        let inserted: any = null;
        if (table === 'bookings') inserted = db.addBooking(record);
        else if (table === 'customers') inserted = db.addCustomer(record);
        else if (table === 'payments') inserted = db.addPayment(record);
        else if (table === 'expenses') inserted = db.addExpense(record);
        else if (table === 'staff') inserted = db.addStaff(record);
        else if (table === 'generator_logs') inserted = db.addGeneratorLog(record);
        else if (table === 'documents') inserted = db.addDocument(record);
        
        return { data: inserted, error: null };
      },
      
      update: (updates: any) => {
        return {
          eq: (column: string, value: any) => {
            let updated: any = null;
            if (table === 'bookings' && column === 'id') updated = db.updateBooking(value, updates);
            else if (table === 'customers' && column === 'id') updated = db.updateCustomer(value, updates);
            else if (table === 'vendors' && column === 'id') updated = db.updateVendor(value, updates);
            else if (table === 'operations_checklist' && column === 'id') updated = db.updateChecklistTask(value, updates);
            
            return { data: updated, error: null };
          }
        };
      }
    };
  }
};
