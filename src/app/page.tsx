'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, ShieldCheck, Heart, User, CheckCircle2, MapPin, KeyRound, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/mock-db';
import { Profile } from '@/types';

export default function EntryPortal() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProfiles(db.getProfiles());
    setMounted(true);
  }, []);

  const handlePortalEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) return;

    // Secure login passcode logic:
    // 1. Supports global standard testing passcode: "1234"
    // 2. Supports personal lowercase first name: "deepak", "harshal", "kiran"
    // 3. Supports user specific PIN: Owner = "1111", Harshal = "2222", Kiran = "3333"
    const firstName = selectedProfile.fullName.split(' ')[0].toLowerCase();
    const isCorrect = 
      passcode === '1234' || 
      passcode === firstName ||
      (selectedProfile.role === 'Owner' && passcode === '1111') ||
      (selectedProfile.fullName.includes('Harshal') && passcode === '2222') ||
      (selectedProfile.fullName.includes('Kiran') && passcode === '3333');

    if (isCorrect) {
      db.setCurrentUser(selectedProfile.id);
      router.push('/dashboard');
    } else {
      setError('Access Denied: Invalid Security Passcode');
      setPasscode('');
      // Auto clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
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
          <div className="inline-flex items-center justify-center space-x-2 bg-purple-primary/10 px-4 py-1.5 rounded-full border border-purple-primary/20 mb-4">
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

        {/* Dynamic Passcode / Roles Switcher */}
        <AnimatePresence mode="wait">
          {!selectedProfile ? (
            <motion.div 
              key="profile-select"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl bg-white rounded-2xl border border-border-light shadow-luxury-lg p-6 sm:p-8 relative"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-primary via-gold-primary to-green-500 rounded-t-2xl"></div>
              
              <h3 className="font-heading text-lg font-bold text-purple-dark text-center mb-6">
                Select Your Profile to Login
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {profiles.map((profile, i) => (
                  <button
                    key={profile.id}
                    onClick={() => {
                      setSelectedProfile(profile);
                      setPasscode('');
                      setError(null);
                    }}
                    className="group relative flex flex-col items-center p-6 bg-ivory/50 border border-border-light hover:border-gold-primary hover:bg-white rounded-xl text-center transition-all duration-300 shadow-sm hover:shadow-luxury scale-100 hover:scale-[1.03]"
                  >
                    <div className="h-12 w-12 rounded-full bg-purple-primary/10 text-purple-primary flex items-center justify-center flex-shrink-0 group-hover:bg-purple-primary group-hover:text-white transition-all duration-300 mb-3">
                      {profile.role === 'Owner' && <Crown className="h-6 w-6 text-gold-primary" />}
                      {profile.role === 'Manager' && <ShieldCheck className="h-6 w-6" />}
                    </div>
                    
                    <p className="text-sm font-bold text-dark group-hover:text-purple-primary transition-colors truncate w-full">
                      {profile.fullName}
                    </p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{profile.role}</p>
                    <span className="inline-block mt-3 text-[10px] bg-gold-primary/20 text-gold-primary px-2.5 py-0.5 rounded font-semibold border border-gold-primary/30">
                      Security Active
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="passcode-entry"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md bg-white rounded-2xl border border-border-light shadow-luxury-lg p-6 sm:p-8 relative"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-primary via-gold-primary to-green-500 rounded-t-2xl"></div>
              
              <button 
                onClick={() => setSelectedProfile(null)}
                className="absolute top-4 left-4 p-1.5 rounded-lg text-gray-400 hover:text-purple-primary hover:bg-ivory transition-colors flex items-center text-xs font-bold"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </button>

              <div className="flex flex-col items-center mt-4">
                <div className="h-12 w-12 rounded-full bg-purple-primary/10 text-purple-primary flex items-center justify-center mb-3">
                  <KeyRound className="h-6 w-6 text-gold-primary" />
                </div>
                <h3 className="font-heading text-lg font-bold text-purple-dark">
                  Verify Credentials
                </h3>
                <p className="text-xs text-gray-500 text-center mt-1">
                  Enter secure passcode for <b>{selectedProfile.fullName}</b>
                </p>
              </div>

              <form onSubmit={handlePortalEntry} className="mt-6 space-y-4">
                <div>
                  <input
                    type="password"
                    required
                    placeholder="Enter PIN / Passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full px-4 py-3 bg-ivory/50 border border-[#EBE6DD] focus:outline-none focus:border-purple-primary rounded-xl text-center text-lg font-bold tracking-widest"
                    autoFocus
                  />
                  <p className="text-[10px] text-gray-400 text-center mt-1.5">
                    Demo hint: Use `1234` or user's first name (`deepak`, `harshal`, `kiran`)
                  </p>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold text-center"
                  >
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-purple-primary hover:bg-purple-dark text-white font-bold rounded-xl border border-gold-primary/30 shadow-md text-xs tracking-wider transition-all"
                >
                  Verify & Enter ERP
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
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
