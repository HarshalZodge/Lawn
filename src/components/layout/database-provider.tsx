'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { db, snakeToCamel, roleIdToName, setRolesLookups } from '@/lib/mock-db';
import { Profile, StaffMember, UserRole } from '@/types';

const DatabaseContext = createContext<{ loaded: boolean }>({ loaded: false });

export const useDatabase = () => useContext(DatabaseContext);

export default function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        // 1. Fetch roles lookup mapping
        try {
          const { data: roles } = await supabase.from('roles').select('*');
          if (roles && roles.length > 0) {
            setRolesLookups(roles);
          }
        } catch (e) {
          console.warn('Failed to load roles from Supabase, using mock default role configuration.');
        }

        // 2. Fetch profiles
        let profiles: Profile[] = [];
        try {
          const { data: profilesData } = await supabase.from('profiles').select('*');
          if (profilesData && profilesData.length > 0) {
            profiles = profilesData.map((p: any) => ({
              id: p.id,
              email: p.email,
              fullName: p.full_name,
              phone: p.phone,
              role: (roleIdToName[p.role_id] as UserRole) || 'Staff',
              status: p.status,
              createdAt: p.created_at
            }));
          } else {
            profiles = db.getProfiles();
          }
        } catch (e) {
          profiles = db.getProfiles();
        }

        // 3. Fetch other tables with graceful fallback to seeds
        const fetchTable = async (tableName: string, defaultValue: any[]) => {
          try {
            const { data, error } = await supabase.from(tableName).select('*');
            if (error) throw error;
            return data && data.length > 0 ? snakeToCamel(data) : defaultValue;
          } catch (e) {
            console.warn(`Fallback to local seed for table: ${tableName}`);
            return defaultValue;
          }
        };

        const venues = await fetchTable('venues', db.getVenues());
        const services = await fetchTable('services', db.getServices());
        const packages = await fetchTable('packages', db.getPackages());
        const vendors = await fetchTable('vendors', db.getVendors());
        const customers = await fetchTable('customers', db.getCustomers());
        const bookings = await fetchTable('bookings', db.getBookings());
        const payments = await fetchTable('payments', db.getPayments());
        const invoices = await fetchTable('invoices', db.getInvoices());
        const checklist = await fetchTable('operations_checklist', db.getChecklist());
        const attendance = await fetchTable('attendance', db.getAttendance());
        const generatorLogs = await fetchTable('generator_logs', db.getGeneratorLogs());
        const expenses = await fetchTable('expenses', db.getExpenses());
        const documents = await fetchTable('documents', db.getDocuments());
        const whatsappTemplates = await fetchTable('whatsapp_templates', db.getWhatsAppTemplates());
        const auditLogs = await fetchTable('audit_logs', db.getAuditLogs());

        // Staff join mapping
        let staff: StaffMember[] = [];
        try {
          const { data: dbStaff } = await supabase.from('staff').select('*');
          if (dbStaff && dbStaff.length > 0) {
            staff = dbStaff.map((s: any) => {
              const p = profiles.find(profile => profile.id === s.profile_id);
              return {
                id: s.id,
                profileId: s.profile_id,
                fullName: p?.fullName || '',
                role: p?.role || 'Staff',
                designation: s.designation,
                salary: s.salary ? Number(s.salary) : undefined,
                contactNumber: s.contact_number,
                joiningDate: s.joining_date,
                status: p?.status === 'Active' ? 'Active' : 'Inactive'
              };
            });
          } else {
            staff = db.getStaff();
          }
        } catch (e) {
          staff = db.getStaff();
        }

        // Populate in-memory database
        db.setInMemoryData({
          profiles,
          venues,
          services,
          packages,
          vendors,
          customers,
          bookings,
          payments,
          invoices,
          checklist,
          staff,
          attendance,
          generatorLogs,
          expenses,
          documents,
          whatsappTemplates,
          auditLogs
        });
      } catch (err) {
        console.error('Error initializing database:', err);
      } finally {
        setLoaded(true);
      }
    };

    initDatabase();
  }, []);

  if (!loaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-ivory">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-primary border-t-gold-primary"></div>
          <p className="font-heading text-lg font-medium text-purple-primary">Synchronizing Cloud Data...</p>
        </div>
      </div>
    );
  }

  return (
    <DatabaseContext.Provider value={{ loaded }}>
      {children}
    </DatabaseContext.Provider>
  );
}
