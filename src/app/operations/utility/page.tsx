'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, Fuel, Clock, AlertTriangle, ShieldCheck, 
  PlusCircle, RefreshCw, Activity, PenSquare, Eye
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { db } from '@/lib/mock-db';
import { GeneratorLog, GeneratorInfo } from '@/types';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function GeneratorManagement() {
  const [genLogs, setGenLogs] = useState<GeneratorLog[]>([]);
  const [gensInfo, setGensInfo] = useState<GeneratorInfo[]>([]);

  // Generator Log Form States
  const [selectedGenId, setSelectedGenId] = useState('gen_70kva');
  const [fuelLevel, setFuelLevel] = useState(85);
  const [runtime, setRuntime] = useState(2.5);
  const [genStatus, setGenStatus] = useState<GeneratorLog['backupStatus']>('Normal');
  const [genNotes, setGenNotes] = useState('');

  // Active view tab for logs: 'all' | 'gen_70kva' | 'gen_25kva'
  const [filterGenId, setFilterGenId] = useState<'all' | string>('all');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setGenLogs(db.getGeneratorLogs());
    setGensInfo(db.getGeneratorsInfo());
  };

  const handleGenLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      db.addGeneratorLog({
        generatorId: selectedGenId,
        fuelLevelPercent: Number(fuelLevel),
        runtimeHours: Number(runtime),
        backupStatus: genStatus,
        serviceNotes: genNotes || undefined
      });
      
      // Update generator overall status based on latest log status
      db.updateGeneratorStatus(
        selectedGenId, 
        genStatus === 'Maintenance Required' ? 'Under Maintenance' : 'Operational'
      );

      refreshData();
      setGenNotes('');
      alert('Generator parameters successfully logged in database!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Helper to get latest log for a generator
  const getLatestLog = (genId: string): GeneratorLog => {
    const log = genLogs.find(l => l.generatorId === genId);
    if (log) return log;
    return {
      id: 'default',
      generatorId: genId,
      fuelLevelPercent: 85,
      runtimeHours: 0,
      backupStatus: 'Normal',
      logDate: new Date().toISOString().split('T')[0],
      serviceNotes: ''
    };
  };

  const filteredLogs = filterGenId === 'all' 
    ? genLogs 
    : genLogs.filter(l => l.generatorId === filterGenId);

  return (
    <DashboardLayout>
      {/* Generator Header */}
      <div className="mb-8">
        <h3 className="font-heading text-2xl font-bold text-purple-dark">Dual Genset Cockpit</h3>
        <p className="text-xs text-gray-500 font-medium mt-1">
          Monitor fuel reserves, check cumulative runtimes, log maintenance tasks, and manage electrical load balance for Bhagyalaxmi Lawns.
        </p>
      </div>

      {/* Overview Cards for Both Generators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {gensInfo.map((gen) => {
          const latestLog = getLatestLog(gen.id);
          const isOperational = gen.status === 'Operational';
          const isMaintenance = gen.status === 'Under Maintenance';
          
          return (
            <div key={gen.id} className="bg-white p-6 rounded-2xl border border-border-light shadow-luxury relative overflow-hidden">
              {/* Top accent line based on status */}
              <div className={cn(
                "absolute top-0 right-0 left-0 h-1.5",
                isOperational ? "bg-green-primary" : 
                isMaintenance ? "bg-amber-500" : "bg-red-500"
              )}></div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-heading text-base font-bold text-purple-dark flex items-center">
                    <Zap className="h-5 w-5 mr-1.5 text-gold-primary" />
                    {gen.name}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                    SPECIFICATION: {gen.capacityKVA} kVA Silent Backup Unit
                  </span>
                </div>
                <span className={cn(
                  "text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase border",
                  isOperational ? "bg-green-50 border-green-200 text-green-800" :
                  isMaintenance ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-red-50 border-red-200 text-red-800"
                )}>
                  {gen.status}
                </span>
              </div>

              {/* Diesel Level Indicator */}
              <div className="bg-ivory/50 p-4 rounded-xl border border-border-light space-y-3 mb-4">
                <div className="flex justify-between items-center text-xs font-bold text-dark">
                  <span className="flex items-center text-purple-primary">
                    <Fuel className="h-4 w-4 mr-1" />
                    Diesel Fuel reserve
                  </span>
                  <span className={cn(
                    latestLog.fuelLevelPercent > 70 ? "text-green-700" :
                    latestLog.fuelLevelPercent > 30 ? "text-amber-600" : "text-red-500"
                  )}>
                    {latestLog.fuelLevelPercent}%
                  </span>
                </div>
                <div className="w-full bg-white h-3.5 rounded-full overflow-hidden border border-border-light p-0.5">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      latestLog.fuelLevelPercent > 70 ? "bg-green-primary" :
                      latestLog.fuelLevelPercent > 30 ? "bg-gold-primary" : "bg-red-500"
                    )}
                    style={{ width: `${latestLog.fuelLevelPercent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] text-gray-400 font-medium">
                  <span>Capacity: ~{gen.capacityKVA === 70 ? '150L' : '60L'} Tank</span>
                  <span>Estimated: ~{Math.round((latestLog.fuelLevelPercent / 100) * (gen.capacityKVA === 70 ? 150 : 60))}L remaining</span>
                </div>
              </div>

              {/* Status parameters */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-ivory/30 p-2.5 rounded-lg border border-border-light flex items-center justify-between">
                  <span className="text-gray-400 flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1 text-purple-primary" />
                    Last Run
                  </span>
                  <span className="font-bold text-purple-dark">{latestLog.runtimeHours} hrs</span>
                </div>
                <div className="bg-ivory/30 p-2.5 rounded-lg border border-border-light flex items-center justify-between">
                  <span className="text-gray-400 flex items-center">
                    <Activity className="h-3.5 w-3.5 mr-1 text-purple-primary" />
                    Load Status
                  </span>
                  <span className="font-bold text-purple-dark">{latestLog.backupStatus}</span>
                </div>
              </div>

              {latestLog.serviceNotes && (
                <p className="text-[10px] text-gray-500 mt-3 italic border-t border-border-light pt-2">
                  Note: {latestLog.serviceNotes}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: LOG RUNNING PARAMETERS FORM */}
        <div className="bg-white p-6 rounded-2xl border border-border-light shadow-luxury h-fit space-y-6">
          <h4 className="font-heading text-sm font-bold text-purple-dark flex items-center border-b border-border-light pb-3">
            <PenSquare className="h-4.5 w-4.5 mr-1.5 text-gold-primary" />
            Log Genset Parameters
          </h4>

          <form onSubmit={handleGenLogSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Select Generator Unit *</label>
              <select
                value={selectedGenId}
                onChange={(e) => setSelectedGenId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-xs font-semibold text-purple-primary focus:outline-none focus:border-gold-primary"
              >
                {gensInfo.map(g => (
                  <option key={g.id} value={g.id}>{g.name} ({g.capacityKVA} kVA)</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Diesel Fuel (%) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={fuelLevel}
                  onChange={(e) => setFuelLevel(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-ivory/30 border border-border-light rounded-lg text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Runtime (Hours) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={runtime}
                  onChange={(e) => setRuntime(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-ivory/30 border border-border-light rounded-lg text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Operational Status *</label>
              <select
                value={genStatus}
                onChange={(e) => setGenStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-xs font-semibold text-purple-primary focus:outline-none focus:border-gold-primary"
              >
                <option value="Normal">Normal Operation</option>
                <option value="Active Backup">Active Grid Backup</option>
                <option value="Maintenance Required">Maintenance Needed / Alert</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Refueling / Service Notes</label>
              <textarea
                placeholder="e.g. Added 40L diesel, oil filter replacement scheduled."
                value={genNotes}
                onChange={(e) => setGenNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-ivory/30 border border-border-light rounded-lg text-xs resize-none focus:outline-none focus:border-gold-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-primary text-white font-bold rounded-lg border border-gold-primary/30 hover:bg-purple-dark text-xs shadow-md flex items-center justify-center transition-colors"
            >
              <PlusCircle className="h-4 w-4 mr-1.5 text-gold-primary" />
              Save Operational Log
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: PAST LOGS REGISTRY (Takes 2 columns) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border-light shadow-luxury space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-border-light pb-3 gap-3">
            <h4 className="font-heading text-sm font-bold text-purple-dark flex items-center">
              <Eye className="h-4.5 w-4.5 mr-1.5 text-gold-primary" />
              Historical Logs Registry
            </h4>

            {/* Filter buttons */}
            <div className="flex bg-ivory/80 p-0.5 rounded-lg border border-border-light text-[10px] font-bold">
              <button 
                onClick={() => setFilterGenId('all')}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-all",
                  filterGenId === 'all' ? "bg-purple-primary text-white" : "text-gray-500 hover:text-purple-primary"
                )}
              >
                All
              </button>
              {gensInfo.map(g => (
                <button
                  key={g.id}
                  onClick={() => setFilterGenId(g.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all",
                    filterGenId === g.id ? "bg-purple-primary text-white" : "text-gray-500 hover:text-purple-primary"
                  )}
                >
                  {g.name.split(' ')[0]} {g.name.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto max-h-[420px] pr-1 space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                No logs recorded matching this filter.
              </div>
            ) : (
              filteredLogs.map((log) => {
                const gen = gensInfo.find(g => g.id === log.generatorId);
                const isAlert = log.backupStatus === 'Maintenance Required';
                
                return (
                  <div 
                    key={log.id} 
                    className={cn(
                      "p-4 rounded-xl border text-xs flex justify-between items-center transition-all",
                      isAlert ? "bg-red-50/10 border-red-200" : "bg-ivory/30 border-border-light hover:bg-white hover:shadow-sm"
                    )}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-purple-dark">
                          {gen ? gen.name : 'Unknown Generator'}
                        </span>
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.2 rounded font-bold uppercase",
                          log.backupStatus === 'Normal' ? "bg-green-100 text-green-700" :
                          log.backupStatus === 'Active Backup' ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                        )}>
                          {log.backupStatus}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium">
                        Log date: {formatDate(log.logDate)} • Runtime: {log.runtimeHours} hours this shift
                      </p>
                      {log.serviceNotes && (
                        <p className="text-[10px] text-purple-primary bg-purple-light/20 px-2 py-0.5 rounded border border-purple-primary/5 font-semibold w-fit">
                          Notes: {log.serviceNotes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end text-purple-primary font-extrabold text-sm font-heading">
                        <Fuel className="h-3.5 w-3.5 mr-0.5 text-purple-primary" />
                        {log.fuelLevelPercent}%
                      </div>
                      <span className="text-[9px] text-gray-400">Fuel capacity level</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
