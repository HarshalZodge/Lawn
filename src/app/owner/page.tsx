'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Crown, TrendingUp, IndianRupee, ShieldAlert, Award, 
  Activity, Users, Calendar, ArrowUpRight, BarChart2, CheckCircle2 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { db } from '@/lib/mock-db';
import { Booking, Payment, Expense, Customer } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function OwnerCenter() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    setBookings(db.getBookings());
    setPayments(db.getPayments());
    setExpenses(db.getExpenses());
    setCustomers(db.getCustomers());
  }, []);

  // ----------------------------------------------------
  // ARITHMETIC METRICS FOR COMMAND CENTER
  // ----------------------------------------------------
  const grossRev = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalExp = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const netProfit = grossRev - totalExp;
  const pendingDues = bookings
    .filter(b => b.status !== 'Cancelled' && b.status !== 'Completed')
    .reduce((sum, b) => sum + Number(b.balanceAmount), 0);

  // Business health score parameters math
  const occupancyFactor = 88; // 88%
  const duesFactor = Math.round((grossRev / (grossRev + pendingDues)) * 100);
  const profitMarginFactor = Math.round((netProfit / grossRev) * 100);
  const vendorReviewsFactor = 95; // 9.5 rating avg * 10
  
  const healthScore = Math.round(
    (occupancyFactor * 0.3) + 
    (duesFactor * 0.3) + 
    (profitMarginFactor * 0.2) + 
    (vendorReviewsFactor * 0.2)
  );

  // Top Customers list (sorted by bookings size)
  const topCustomers = customers.map(cust => {
    const custBkgs = bookings.filter(b => b.customerId === cust.id && b.status !== 'Cancelled');
    const spent = custBkgs.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    return { name: cust.fullName, count: custBkgs.length, spent };
  }).sort((a, b) => b.spent - a.spent).slice(0, 4);

  // ----------------------------------------------------
  // FORECAST REVENUES DATA
  // ----------------------------------------------------
  const forecastData = [
    { month: 'Jul', Forecast: 280000 },
    { month: 'Aug', Forecast: 150000 },
    { month: 'Sep', Forecast: 200000 },
    { month: 'Oct', Forecast: 350000 },
    { month: 'Nov', Forecast: 480000 }, // High wedding season starts
    { month: 'Dec', Forecast: 650000 },
  ];

  return (
    <DashboardLayout>
      {/* Welcome Owner */}
      <div className="mb-8 p-6 bg-purple-dark text-white rounded-2xl border border-gold-primary/30 shadow-luxury relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-purple-primary via-gold-primary to-green-primary"></div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold-primary">Owner Executive Command Center</span>
            <h3 className="font-heading text-2xl font-bold text-white mt-1">Bhagyalaxmi Executive Suite</h3>
            <p className="text-xs text-purple-light/80 mt-1">Financial forecasts, margins sheets, and operations audit index.</p>
          </div>
          <div className="mt-4 sm:mt-0 p-3 bg-white/5 border border-white/10 rounded-xl flex items-center space-x-3.5">
            <div className="h-10 w-10 bg-gold-primary rounded-lg flex items-center justify-center text-purple-dark font-extrabold shadow">
              <Crown className="h-5 w-5 text-purple-primary" />
            </div>
            <div>
              <span className="text-[9px] text-purple-light uppercase">Operating Status</span>
              <p className="text-xs font-bold text-gold-primary">Premium Grade A+</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Financial KPIs | Business health score gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Financial KPIs list (takes 2 columns) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Revenue */}
          <div className="bg-white p-6 rounded-2xl border border-border-light shadow-luxury relative overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-purple-primary"></div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gross Inflow Cash</p>
            <h4 className="font-heading text-2xl font-extrabold text-purple-dark mt-2">
              {formatCurrency(grossRev)}
            </h4>
            <span className="text-[10px] text-green-primary font-semibold mt-3.5 block flex items-center">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              18% GST Compliance met
            </span>
          </div>

          {/* Expenses */}
          <div className="bg-white p-6 rounded-2xl border border-border-light shadow-luxury relative overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-red-400"></div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gross Outflow Expenses</p>
            <h4 className="font-heading text-2xl font-extrabold text-purple-dark mt-2">
              -{formatCurrency(totalExp)}
            </h4>
            <span className="text-[10px] text-gray-500 mt-3.5 block">
              AC servvices, fuel, staff salaries
            </span>
          </div>

          {/* Net Profit */}
          <div className="bg-white p-6 rounded-2xl border border-border-light shadow-luxury relative overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-green-primary"></div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Cash Profit Margins</p>
            <h4 className="font-heading text-2xl font-extrabold text-purple-dark mt-2">
              {formatCurrency(netProfit)}
            </h4>
            <span className="text-[10px] text-green-primary font-semibold mt-3.5 block">
              Margin percentage: {profitMarginFactor}%
            </span>
          </div>

          {/* Outstanding */}
          <div className="bg-white p-6 rounded-2xl border border-border-light shadow-luxury relative overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gold-primary"></div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Outstanding Receivables</p>
            <h4 className="font-heading text-2xl font-extrabold text-purple-dark mt-2">
              {formatCurrency(pendingDues)}
            </h4>
            <span className="text-[10px] text-red-500 font-semibold mt-3.5 block flex items-center">
              <ShieldAlert className="h-3.5 w-3.5 mr-1" />
              Collect balance dues prior to slots
            </span>
          </div>
        </div>

        {/* Business Health Score Circle Index */}
        <div className="bg-white p-6 rounded-2xl border border-border-light shadow-luxury flex flex-col justify-between items-center text-center">
          <h4 className="font-heading text-sm font-bold text-purple-dark self-start flex items-center">
            <Activity className="h-4.5 w-4.5 mr-1.5 text-gold-primary" />
            Business Health Score
          </h4>

          {/* Circular gauge */}
          <div className="relative h-36 w-36 flex items-center justify-center mt-4 mb-2">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="62" stroke="#E6DCC8" strokeWidth="8" fill="transparent" />
              <circle 
                cx="72" 
                cy="72" 
                r="62" 
                stroke="#5B2C6F" 
                strokeWidth="10" 
                fill="transparent" 
                strokeDasharray="390" 
                strokeDashoffset={390 - (390 * healthScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-heading text-3xl font-extrabold text-purple-dark">{healthScore}%</span>
              <span className="text-[9px] text-gold-dark font-bold tracking-widest uppercase mt-0.5">Health Score</span>
            </div>
          </div>

          <div className="w-full text-xs text-gray-500 border-t border-border-light pt-3 space-y-1.5">
            <div className="flex justify-between">
              <span>Lawn Occupancy:</span>
              <span className="font-bold text-dark">{occupancyFactor}%</span>
            </div>
            <div className="flex justify-between">
              <span>Receivables Recovery:</span>
              <span className="font-bold text-dark">{duesFactor}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Forecast Area Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Forecast Graph (Takes 2 Columns) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border-light shadow-luxury">
          <div className="mb-6">
            <h4 className="font-heading text-base font-bold text-purple-dark">Seasonal Revenue Forecast (H2 2026)</h4>
            <p className="text-xs text-gray-400 mt-1">Projection indices calculated based on historic booking trends.</p>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B2C6F" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#5B2C6F" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6DCC8" vertical={false} />
                <XAxis dataKey="month" stroke="#2C2C2C" fontSize={11} tickLine={false} />
                <YAxis stroke="#2C2C2C" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #E6DCC8', fontFamily: 'Inter' }}
                  formatter={(value) => [`Rs. ${Number(value).toLocaleString('en-IN')}`, 'Forecast']}
                />
                <Area type="monotone" dataKey="Forecast" stroke="#5B2C6F" strokeWidth={3} fillOpacity={1} fill="url(#colorForecast)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Valued Customers Ledger */}
        <div className="bg-white p-6 rounded-2xl border border-border-light shadow-luxury flex flex-col justify-between">
          <div>
            <h4 className="font-heading text-sm font-bold text-purple-dark mb-6 flex items-center">
              <Award className="h-4.5 w-4.5 mr-1.5 text-gold-primary" />
              High-Value Customers Registry
            </h4>

            <div className="space-y-4">
              {topCustomers.map((cust, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-ivory/40 border border-border-light rounded-xl text-xs">
                  <div>
                    <p className="font-bold text-purple-dark">{cust.name}</p>
                    <span className="text-[10px] text-gray-400">{cust.count} Ceremonies scheduled</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-green-700">{formatCurrency(cust.spent)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/customers"
            className="mt-6 w-full py-2 bg-ivory border border-border-light hover:border-gold-primary text-center text-xs font-bold text-purple-primary rounded-lg transition-colors flex items-center justify-center"
          >
            Launch Customer CRM Dashboard
            <ArrowUpRight className="h-3.5 w-3.5 ml-1 text-gold-primary shrink-0" />
          </Link>
        </div>

      </div>
    </DashboardLayout>
  );
}
