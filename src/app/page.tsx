'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, ShieldCheck, Heart, User, CheckCircle2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '@/lib/mock-db';
import { Profile } from '@/types';

export default function EntryPortal() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setProfiles(db.getProfiles());
    setMounted(true);
  }, []);

  const handlePortalEntry = (userId: string) => {
    db.setCurrentUser(userId);
    router.push('/dashboard');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-ivory text-dark font-sans relative overflow-hidden px-4">
      {/* Decorative Maharashtrian Mandala Ornaments */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full border-[12px] border-purple-primary/5 pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full border-[12px] border-gold-primary/5 pointer-events-none"></div>
      
      {/* Header */}
      <header className="py-6 flex items-center justify-between max-w-6xl mx-auto w-full z-10">
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-lg bg-purple-primary flex items-center justify-center border border-gold-primary/30 shadow-md">
            <Crown className="h-5 w-5 text-gold-primary" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold text-purple-primary tracking-wide">Bhagyalaxmi ERP</h1>
            <p className="text-[10px] text-gold-primary font-medium tracking-widest uppercase">Wedding Venue OS</p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-gray-500 font-medium bg-white px-3 py-1.5 rounded-full border border-border-light shadow-sm">
          <MapPin className="h-3.5 w-3.5 text-gold-primary" />
          <span>Bhingar, Ahilyanagar</span>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="flex-1 flex flex-col items-center justify-center z-10 py-12 max-w-4xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center space-x-2 bg-purple-primary/10 px-4 py-1.5 rounded-full border border-purple-primary/20 mb-4 animate-pulse">
            <Heart className="h-4 w-4 text-purple-primary fill-purple-primary" />
            <span className="text-xs font-semibold text-purple-primary tracking-wide">Luxury Wedding Venue Operating System</span>
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl font-extrabold text-purple-dark leading-tight">
            Bhagyalaxmi Lawns <br />
            <span className="gold-gradient-text">ERP Command Suite</span>
          </h2>
          <p className="text-gray-600 max-w-lg mx-auto mt-4 text-sm sm:text-base leading-relaxed">
            Welcome to the enterprise platform for Bhagyalaxmi Lawns. Manage bookings, venue layouts, event operations, GST invoicing, and staff workflow.
          </p>
        </motion.div>

        {/* Roles Selection Box */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full bg-white rounded-2xl border border-border-light shadow-luxury-lg p-6 sm:p-8 relative"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-primary via-gold-primary to-green-primary rounded-t-2xl"></div>
          
          <h3 className="font-heading text-lg font-bold text-purple-dark text-center mb-6">
            Select Simulated Portal to Enter
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {profiles.map((profile, i) => (
              <motion.button
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                onClick={() => handlePortalEntry(profile.id)}
                className="group relative flex items-start p-4 bg-ivory/50 border border-border-light hover:border-gold-primary hover:bg-white rounded-xl text-left transition-all duration-300 shadow-sm hover:shadow-luxury scale-100 hover:scale-[1.03]"
              >
                <div className="h-9 w-9 rounded-lg bg-purple-primary/10 text-purple-primary flex items-center justify-center flex-shrink-0 group-hover:bg-purple-primary group-hover:text-white transition-colors duration-300">
                  {profile.role === 'Owner' && <Crown className="h-5 w-5 text-gold-primary" />}
                  {profile.role === 'Manager' && <ShieldCheck className="h-5 w-5" />}
                  {profile.role === 'Accountant' && <User className="h-5 w-5" />}
                  {profile.role === 'Event Coordinator' && <CheckCircle2 className="h-5 w-5 text-green-primary" />}
                  {profile.role === 'Reception Staff' && <User className="h-5 w-5 text-gold-primary" />}
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-bold text-dark group-hover:text-purple-primary transition-colors truncate">
                    {profile.fullName}
                  </p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{profile.role}</p>
                  <p className="text-[10px] text-green-primary font-bold tracking-widest mt-1 uppercase flex items-center">
                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full mr-1.5 inline-block"></span>
                    Online
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border-light text-center z-10 max-w-6xl mx-auto w-full">
        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Bhagyalaxmi Lawns Ahilyanagar. Developed as a Premium SaaS Wedding Venue Operating System.
        </p>
      </footer>
    </div>
  );
}
