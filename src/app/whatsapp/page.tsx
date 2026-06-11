'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Save, Settings, Play, CheckCircle2, ChevronRight, X, Info } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { db } from '@/lib/mock-db';
import { WhatsAppTemplate } from '@/types';
import { cn } from '@/lib/utils';

export default function WhatsAppTemplates() {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  
  // Preview Simulator variables
  const [simName, setSimName] = useState('Abhijit Shinde');
  const [simEvent, setSimEvent] = useState('Grand Wedding');
  const [simDate, setSimDate] = useState('2026-06-12');
  const [simAmount, setSimAmount] = useState('1,50,000');
  
  // Active selected template copy
  const [editBody, setEditBody] = useState('');

  useEffect(() => {
    const list = db.getWhatsAppTemplates();
    setTemplates(list);
    if (list.length > 0) {
      setSelectedId(list[0].id);
      setEditBody(list[0].messageBody);
    }
  }, []);

  const activeTemplate = templates.find(t => t.id === selectedId);

  const handleTemplateSelect = (id: string) => {
    setSelectedId(id);
    const match = templates.find(t => t.id === id);
    if (match) setEditBody(match.messageBody);
  };

  const handleToggleActive = (id: string, currentVal: boolean) => {
    try {
      db.updateWhatsAppTemplate(id, { isActive: !currentVal });
      setTemplates(db.getWhatsAppTemplates());
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveBody = () => {
    if (!activeTemplate) return;
    try {
      db.updateWhatsAppTemplate(activeTemplate.id, { messageBody: editBody });
      setTemplates(db.getWhatsAppTemplates());
      alert(`WhatsApp template "${activeTemplate.templateName}" successfully updated in database!`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Compile helper: replaces variables with sim values
  const getCompiledPreview = () => {
    if (!editBody) return '';
    return editBody
      .replace(/{{customer_name}}/g, simName)
      .replace(/{{event_type}}/g, simEvent)
      .replace(/{{event_date}}/g, simDate)
      .replace(/{{advance_due}}/g, simAmount)
      .replace(/{{balance_due}}/g, simAmount)
      .replace(/{{booking_id}}/g, 'BL-202606-0001')
      .replace(/{{payment_link}}/g, 'https://bhagyalaxmi.in/pay/BL-0001')
      .replace(/{{due_date}}/g, '2026-06-11')
      .replace(/{{feedback_link}}/g, 'https://g.page/bhagyalaxmi-lawns/review');
  };

  return (
    <DashboardLayout>
      {/* WhatsApp Header */}
      <div className="mb-8">
        <h3 className="font-heading text-2xl font-bold text-purple-dark">WhatsApp Communication Engine</h3>
        <p className="text-xs text-gray-500 font-medium mt-1">
          Configure triggers for instant ceremony confirmations, payment clearing reminders, and guest feedback surveys.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: List of Templates */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-border-light shadow-luxury space-y-4">
            <h4 className="font-heading text-sm font-bold text-purple-dark flex items-center">
              <Settings className="h-4.5 w-4.5 mr-1.5 text-gold-primary animate-spin" style={{ animationDuration: '6s' }} />
              Automation Triggers
            </h4>
            <p className="text-[10px] text-gray-400">Enable or disable automatic WhatsApp alerts.</p>

            <div className="space-y-3">
              {templates.map((temp) => {
                const isSelected = temp.id === selectedId;
                return (
                  <div 
                    key={temp.id}
                    onClick={() => handleTemplateSelect(temp.id)}
                    className={cn(
                      "p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col space-y-3",
                      isSelected 
                        ? "bg-purple-light/20 border-purple-primary shadow-sm scale-[1.01]" 
                        : "bg-white border-border-light hover:border-gold-primary/30"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-purple-dark">{temp.templateName}</span>
                      
                      {/* Active Toggle Switch */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleActive(temp.id, temp.isActive); }}
                        className={cn(
                          "w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none",
                          temp.isActive ? "bg-green-primary" : "bg-gray-300"
                        )}
                      >
                        <div className={cn(
                          "bg-white w-4 h-4 rounded-full shadow-sm transition-transform",
                          temp.isActive ? "translate-x-4" : "translate-x-0"
                        )}></div>
                      </button>
                    </div>

                    <div className="text-[10px] text-gray-500 flex justify-between">
                      <span>Variable count: {temp.variables.length}</span>
                      <span className={cn(
                        "font-bold uppercase tracking-wider text-[8px]",
                        temp.isActive ? "text-green-700" : "text-gray-400"
                      )}>
                        {temp.isActive ? 'Active Auto' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle Column: Template Copy Editor */}
        <div className="bg-white p-6 rounded-2xl border border-border-light shadow-luxury">
          {activeTemplate ? (
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-border-light pb-3">
                <h4 className="font-heading text-base font-bold text-purple-dark">
                  Edit Template Body: {activeTemplate.templateName}
                </h4>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Message Copy Details</label>
                <textarea
                  rows={8}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full p-4 bg-ivory/40 border border-border-light focus:outline-none focus:border-gold-primary rounded-xl text-xs font-mono leading-relaxed text-gray-700"
                />
              </div>

              <div className="bg-ivory/50 p-4 rounded-xl border border-border-light space-y-2 text-xs">
                <span className="font-bold text-purple-dark flex items-center">
                  <Info className="h-4 w-4 mr-1 text-gold-primary shrink-0" /> Supported Variables
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1 text-[9px] font-mono">
                  {activeTemplate.variables.map((v, i) => (
                    <span key={i} className="bg-white border border-border-light px-2 py-0.5 rounded text-purple-primary font-bold">
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveBody}
                className="w-full py-2.5 bg-purple-primary text-white font-bold rounded-lg border border-gold-primary/30 hover:bg-purple-dark text-xs shadow-md flex items-center justify-center transition-colors"
              >
                <Save className="h-4 w-4 mr-1.5 text-gold-primary shrink-0" />
                Save Copy Changes
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic text-center py-12">Select template to edit.</p>
          )}
        </div>

        {/* Right Column: Live Variable Simulator preview */}
        <div className="bg-white p-6 rounded-2xl border border-border-light shadow-luxury space-y-6">
          <h4 className="font-heading text-sm font-bold text-purple-dark flex items-center">
            <Play className="h-4.5 w-4.5 mr-1.5 text-gold-primary" />
            Live Preview Simulator
          </h4>

          {/* Variables inputs */}
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Customer Name</label>
              <input
                type="text"
                value={simName}
                onChange={(e) => setSimName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-ivory/40 border border-border-light rounded"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Ceremony type</label>
              <input
                type="text"
                value={simEvent}
                onChange={(e) => setSimEvent(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-ivory/40 border border-border-light rounded"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Date</label>
                <input
                  type="date"
                  value={simDate}
                  onChange={(e) => setSimDate(e.target.value)}
                  className="w-full px-2 py-1.5 bg-ivory/40 border border-border-light rounded text-[10px]"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Dues (Rs.)</label>
                <input
                  type="text"
                  value={simAmount}
                  onChange={(e) => setSimAmount(e.target.value)}
                  className="w-full px-2 py-1.5 bg-ivory/40 border border-border-light rounded"
                />
              </div>
            </div>
          </div>

          {/* Compiled Output preview */}
          <div className="border-t border-border-light pt-6 space-y-3">
            <span className="text-[10px] font-bold text-purple-primary uppercase tracking-wider">Mobile Preview (Simulated WhatsApp screen)</span>
            
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-[11px] font-sans relative overflow-hidden text-emerald-950 shadow-sm whitespace-pre-wrap leading-relaxed">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-emerald-600"></div>
              {getCompiledPreview() || 'Template text loading...'}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
