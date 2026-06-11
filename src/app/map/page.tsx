'use client';

import React, { useState, useRef } from 'react';
import { 
  ZoomIn, ZoomOut, RotateCcw, Plus, Trash2, Layout, 
  MapPin, HelpCircle, Save, Info, Grid 
} from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { cn } from '@/lib/utils';

interface PlacedElement {
  id: string;
  type: 'round-table' | 'buffet-table' | 'stage' | 'sofa' | 'vip-spot' | 'bus-lane';
  label: string;
  x: number;
  y: number;
  rotation: number;
  pax: number;
}

export default function VenueMapPlanner() {
  // SVG Canvas configuration
  const viewWidth = 1000;
  const viewHeight = 600;
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  
  // Placed seating items list
  const [elements, setElements] = useState<PlacedElement[]>([
    { id: 't1', type: 'round-table', label: 'T-1', x: 220, y: 150, rotation: 0, pax: 8 },
    { id: 't2', type: 'round-table', label: 'T-2', x: 300, y: 150, rotation: 0, pax: 8 },
    { id: 't3', type: 'round-table', label: 'T-3', x: 220, y: 220, rotation: 0, pax: 8 },
    { id: 't4', type: 'round-table', label: 'T-4', x: 300, y: 220, rotation: 0, pax: 8 },
    { id: 'stg', type: 'stage', label: 'WEDDING STAGE', x: 120, y: 180, rotation: 90, pax: 0 },
    { id: 'buf', type: 'buffet-table', label: 'VEG BUFFET COUNTER', x: 550, y: 100, rotation: 0, pax: 0 },
    { id: 'vip1', type: 'vip-spot', label: 'VIP-01', x: 820, y: 450, rotation: 0, pax: 0 },
    { id: 'vip2', type: 'vip-spot', label: 'VIP-02', x: 880, y: 450, rotation: 0, pax: 0 },
  ]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Dragging states
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartOffset = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Pan states
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  // Add new elements to the center of active screen
  const addElement = (type: PlacedElement['type']) => {
    const counts = elements.filter(e => e.type === type).length + 1;
    let label = '';
    let pax = 0;
    
    switch (type) {
      case 'round-table': label = `T-${counts}`; pax = 8; break;
      case 'buffet-table': label = `Buffet-${counts}`; break;
      case 'stage': label = 'Stage Setup'; break;
      case 'sofa': label = `Sofa-${counts}`; break;
      case 'vip-spot': label = `VIP-${counts}`; break;
      case 'bus-lane': label = `Bus-${counts}`; break;
    }

    const newEl: PlacedElement = {
      id: `${type}_${Date.now()}`,
      type,
      label,
      x: 450 + (Math.random() * 40 - 20),
      y: 250 + (Math.random() * 40 - 20),
      rotation: 0,
      pax
    };

    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(e => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleRotate = (id: string) => {
    setElements(elements.map(e => e.id === id ? { ...e, rotation: (e.rotation + 45) % 360 } : e));
  };

  // Convert client cursor coordinates to relative SVG coordinate space
  const getSVGCoords = (e: React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    // Translate client mouse point relative to SVG layout bounds
    const x = ((e.clientX - rect.left) / rect.width) * viewWidth;
    const y = ((e.clientY - rect.top) / rect.height) * viewHeight;
    return { x, y };
  };

  // MOUSE DRAG HANDLERS FOR BLUEPRINT ELEMENTS
  const onElementMouseDown = (e: React.MouseEvent, el: PlacedElement) => {
    e.stopPropagation();
    if (isPanning) return;
    setDraggingId(el.id);
    setSelectedId(el.id);
    
    const coords = getSVGCoords(e);
    dragStartOffset.current = {
      x: coords.x - el.x,
      y: coords.y - el.y
    };
  };

  const onCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingId) {
      // Element dragging behavior
      const coords = getSVGCoords(e);
      const newX = Math.round(coords.x - dragStartOffset.current.x);
      const newY = Math.round(coords.y - dragStartOffset.current.y);
      
      // Keep inside bounds roughly
      setElements(elements.map(el => 
        el.id === draggingId 
          ? { ...el, x: Math.max(20, Math.min(viewWidth - 20, newX)), y: Math.max(20, Math.min(viewHeight - 20, newY)) }
          : el
      ));
    } else if (isPanning) {
      // Background canvas panning
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPanX(panX + dx);
      setPanY(panY + dy);
      panStart.current = { x: e.clientX, y: e.clientY };
    }
  };

  const onCanvasMouseUp = () => {
    setDraggingId(null);
    setIsPanning(false);
  };

  const onCanvasMouseDown = (e: React.MouseEvent) => {
    // Start Panning if background clicked
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY };
  };

  const resetZoomPan = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  const activeElement = elements.find(e => e.id === selectedId);

  return (
    <DashboardLayout>
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h3 className="font-heading text-2xl font-bold text-purple-dark">Venue Layout Blueprint</h3>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Visual table placement, seating arrangement coordinator, and VIP parking space allocator. Drag items directly to place them.
          </p>
        </div>
        
        {/* Zoom and Canvas controls */}
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <button 
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            className="p-2 bg-white border border-border-light rounded-lg hover:border-gold-primary transition-all text-purple-primary shadow-sm"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="p-2 bg-white border border-border-light rounded-lg hover:border-gold-primary transition-all text-purple-primary shadow-sm"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button 
            onClick={resetZoomPan}
            className="p-2 bg-white border border-border-light rounded-lg hover:border-gold-primary transition-all text-purple-primary shadow-sm"
            title="Reset Map Transform"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          
          <button 
            onClick={() => alert('Layout settings successfully saved to database template!')}
            className="px-4 py-2 bg-purple-primary text-white text-xs font-bold rounded-lg border border-gold-primary/30 hover:bg-purple-dark shadow-md flex items-center"
          >
            <Save className="h-3.5 w-3.5 mr-1 text-gold-primary" />
            Save Layout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Toolbar Column: Placing Elements */}
        <div className="space-y-6">
          {/* Elements list to place */}
          <div className="bg-white p-5 rounded-2xl border border-border-light shadow-luxury space-y-4">
            <h4 className="font-heading text-sm font-bold text-purple-dark flex items-center">
              <Layout className="h-4.5 w-4.5 mr-1.5 text-gold-primary" />
              Blueprint Toolbar
            </h4>
            <p className="text-[10px] text-gray-400">Click item to inject it into the planning board.</p>

            <div className="space-y-2.5">
              <button 
                onClick={() => addElement('round-table')}
                className="w-full p-3 bg-ivory/50 hover:bg-white rounded-xl border border-border-light hover:border-gold-primary text-left text-xs font-bold text-dark flex items-center justify-between transition-all"
              >
                <span>Round Dining Table (8 Pax)</span>
                <Plus className="h-4 w-4 text-purple-primary shrink-0" />
              </button>

              <button 
                onClick={() => addElement('buffet-table')}
                className="w-full p-3 bg-ivory/50 hover:bg-white rounded-xl border border-border-light hover:border-gold-primary text-left text-xs font-bold text-dark flex items-center justify-between transition-all"
              >
                <span>Buffet Table Block</span>
                <Plus className="h-4 w-4 text-purple-primary shrink-0" />
              </button>

              <button 
                onClick={() => addElement('stage')}
                className="w-full p-3 bg-ivory/50 hover:bg-white rounded-xl border border-border-light hover:border-gold-primary text-left text-xs font-bold text-dark flex items-center justify-between transition-all"
              >
                <span>Royal Event Stage</span>
                <Plus className="h-4 w-4 text-purple-primary shrink-0" />
              </button>

              <button 
                onClick={() => addElement('vip-spot')}
                className="w-full p-3 bg-ivory/50 hover:bg-white rounded-xl border border-border-light hover:border-gold-primary text-left text-xs font-bold text-dark flex items-center justify-between transition-all"
              >
                <span>VIP Parking Spot</span>
                <Plus className="h-4 w-4 text-purple-primary shrink-0" />
              </button>
            </div>
          </div>

          {/* Selected Item inspector Panel */}
          {activeElement ? (
            <div className="bg-white p-5 rounded-2xl border border-gold-primary/30 shadow-luxury space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-gold-primary">Element Specs</span>
                <button 
                  onClick={() => deleteElement(activeElement.id)}
                  className="p-1 text-red-500 hover:bg-red-55 rounded-lg border border-red-100"
                  title="Remove from board"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="text-xs space-y-3">
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Rename Label</label>
                  <input
                    type="text"
                    value={activeElement.label}
                    onChange={(e) => {
                      const val = e.target.value;
                      setElements(elements.map(el => el.id === activeElement.id ? { ...el, label: val } : el));
                    }}
                    className="w-full px-2 py-1 bg-ivory border border-border-light rounded font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 bg-ivory/30 rounded border border-border-light">
                    <span className="text-gray-400 block">Coordinates</span>
                    <span className="font-semibold">X: {activeElement.x}, Y: {activeElement.y}</span>
                  </div>
                  <button
                    onClick={() => handleRotate(activeElement.id)}
                    className="p-2 bg-ivory/50 hover:bg-white rounded border border-border-light hover:border-gold-primary text-center font-bold flex flex-col justify-center items-center transition-colors"
                  >
                    <span>Rotate</span>
                    <span className="text-purple-primary font-sans">{activeElement.rotation}°</span>
                  </button>
                </div>

                {activeElement.type === 'round-table' && (
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Seating Scale (Pax)</label>
                    <input
                      type="number"
                      value={activeElement.pax}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setElements(elements.map(el => el.id === activeElement.id ? { ...el, pax: val } : el));
                      }}
                      className="w-full px-2 py-1 bg-ivory border border-border-light rounded font-bold"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-purple-dark text-white p-5 rounded-2xl border border-gold-primary/20 space-y-2 text-xs">
              <h5 className="font-heading text-xs font-bold text-gold-primary uppercase tracking-wider flex items-center">
                <Info className="h-4 w-4 mr-1.5 shrink-0" />
                Blueprint Help
              </h5>
              <p className="text-purple-light leading-relaxed">
                Click any table, stage, or spot on the blueprint map to rotate, rename labels, adjust capacity scale, or delete elements.
              </p>
            </div>
          )}
        </div>

        {/* Right Canvas Column (Takes 3 grid spans) */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-border-light shadow-luxury overflow-hidden relative select-none">
            {/* Visual Guide Banner */}
            <div className="absolute top-4 left-4 bg-purple-dark/85 backdrop-blur-sm border border-gold-primary/30 p-2.5 rounded-lg z-10 text-[10px] text-white flex items-center space-x-2">
              <Grid className="h-4 w-4 text-gold-primary animate-pulse" />
              <span>Left side is indoor Banquet Hall. Right side is Open Lawns. Bottom is Parking.</span>
            </div>

            {/* SVG Render Workspace */}
            <svg
              ref={svgRef}
              viewBox={`0 0 ${viewWidth} ${viewHeight}`}
              onMouseMove={onCanvasMouseMove}
              onMouseUp={onCanvasMouseUp}
              onMouseDown={onCanvasMouseDown}
              className={cn(
                "w-full h-[600px] bg-[#F3ECE0] border-2 border-dashed border-border-light cursor-grab",
                isPanning && "cursor-grabbing",
                draggingId && "cursor-grabbing"
              )}
            >
              <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
                {/* ARCHITECTURAL LAYOUT ZONES BOUNDARIES */}
                
                {/* 1. Wedding Hall (Indoor banquet) */}
                <rect x="50" y="50" width="450" height="400" fill="#FCFAF6" stroke="#C9A227" strokeWidth="3" rx="10" />
                <text x="70" y="90" fill="#5B2C6F" className="font-heading text-sm font-bold opacity-30 tracking-widest uppercase">
                  Bhagyalaxmi Banquet Hall
                </text>

                {/* Rooms details inside Hall */}
                <rect x="50" y="50" width="120" height="100" fill="#F8F4ED" stroke="#E6DCC8" strokeWidth="2" rx="4" />
                <text x="60" y="80" fill="#2C2C2C" className="text-[10px] font-bold opacity-50">Bride AC Room</text>

                <rect x="50" y="350" width="120" height="100" fill="#F8F4ED" stroke="#E6DCC8" strokeWidth="2" rx="4" />
                <text x="60" y="380" fill="#2C2C2C" className="text-[10px] font-bold opacity-50">Groom AC Room</text>

                {/* Kitchen Area */}
                <rect x="350" y="50" width="150" height="120" fill="#EADFCD" stroke="#E6DCC8" strokeWidth="2" />
                <text x="365" y="80" fill="#2C2C2C" className="text-[10px] font-bold opacity-50">Catering Kitchen</text>

                {/* Washrooms */}
                <rect x="380" y="370" width="120" height="80" fill="#F8F4ED" stroke="#E6DCC8" strokeWidth="2" />
                <text x="395" y="400" fill="#2C2C2C" className="text-[10px] font-bold opacity-50">Restrooms</text>

                {/* 2. Open Lawn (Outdoor Area) */}
                <rect x="530" y="50" width="420" height="400" fill="#E8F1EC" stroke="#0E6251" strokeWidth="3" rx="10" />
                <text x="550" y="90" fill="#0E6251" className="font-heading text-sm font-bold opacity-30 tracking-widest uppercase">
                  Open lawn Ceremony Area
                </text>
                
                {/* 3. Parking Lot Area */}
                <rect x="50" y="470" width="900" height="100" fill="#EFECE6" stroke="#2C2C2C" strokeWidth="2" strokeDasharray="5 5" rx="5" />
                <text x="70" y="500" fill="#2C2C2C" className="font-heading text-[10px] font-bold opacity-45 uppercase tracking-wider">
                  Vehicle Valet & Parking Grid
                </text>

                {/* Main Entry Gate and Service entrances */}
                <line x1="50" y1="250" x2="50" y2="300" stroke="#0E6251" strokeWidth="8" />
                <text x="15" y="280" fill="#0E6251" transform="rotate(-90 15 280)" className="text-[9px] font-bold">MAIN GATE</text>

                <line x1="950" y1="250" x2="950" y2="300" stroke="#C9A227" strokeWidth="8" />
                <text x="965" y="280" fill="#C9A227" transform="rotate(90 965 280)" className="text-[9px] font-bold">SERVICE GATE</text>

                {/* PLACED SEATING LAYOUT ELEMENTS */}
                {elements.map((el) => {
                  const isSelected = el.id === selectedId;
                  const rotationAttr = `rotate(${el.rotation} ${el.x} ${el.y})`;

                  return (
                    <g 
                      key={el.id}
                      transform={rotationAttr}
                      onMouseDown={(e) => onElementMouseDown(e, el)}
                      className="cursor-grab hover:filter hover:drop-shadow-md"
                    >
                      {/* ROUND TABLES */}
                      {el.type === 'round-table' && (
                        <>
                          <circle 
                            cx={el.x} 
                            cy={el.y} 
                            r="28" 
                            fill={isSelected ? '#EBDEF0' : '#ffffff'} 
                            stroke={isSelected ? '#5B2C6F' : '#C9A227'} 
                            strokeWidth={isSelected ? '3' : '2'} 
                          />
                          {/* Render chairs around circle */}
                          {[...Array(el.pax)].map((_, i) => {
                            const angle = (i * 360) / el.pax;
                            const rad = (angle * Math.PI) / 180;
                            const chairX = el.x + 35 * Math.cos(rad);
                            const chairY = el.y + 35 * Math.sin(rad);
                            return (
                              <circle 
                                key={i} 
                                cx={chairX} 
                                cy={chairY} 
                                r="5.5" 
                                fill="#5B2C6F" 
                                stroke="#E6DCC8" 
                                strokeWidth="1" 
                              />
                            );
                          })}
                        </>
                      )}

                      {/* BUFFET TABLES */}
                      {el.type === 'buffet-table' && (
                        <rect 
                          x={el.x - 70} 
                          y={el.y - 18} 
                          width="140" 
                          height="36" 
                          fill={isSelected ? '#EBDEF0' : '#FCFAF6'} 
                          stroke={isSelected ? '#5B2C6F' : '#0E6251'} 
                          strokeWidth="2.5" 
                          rx="4"
                        />
                      )}

                      {/* STAGE BLOCKS */}
                      {el.type === 'stage' && (
                        <rect 
                          x={el.x - 90} 
                          y={el.y - 35} 
                          width="180" 
                          height="70" 
                          fill={isSelected ? '#EBDEF0' : '#5B2C6F'} 
                          stroke="#C9A227" 
                          strokeWidth="3.5" 
                          rx="6"
                        />
                      )}

                      {/* VIP PARKING SPOTS */}
                      {el.type === 'vip-spot' && (
                        <rect 
                          x={el.x - 22} 
                          y={el.y - 35} 
                          width="44" 
                          height="70" 
                          fill={isSelected ? '#FEF9E7' : '#ffffff'} 
                          stroke={isSelected ? '#C9A227' : '#2C2C2C'} 
                          strokeWidth="2" 
                          strokeDasharray="2 2"
                        />
                      )}

                      {/* Label Text overlay inside elements */}
                      <text
                        x={el.x}
                        y={el.y + 4}
                        textAnchor="middle"
                        fill={el.type === 'stage' && !isSelected ? '#ffffff' : '#2C2C2C'}
                        className="text-[9px] font-extrabold select-none pointer-events-none"
                      >
                        {el.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
