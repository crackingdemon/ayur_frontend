"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Plus, Trash2, Search, Loader2, Printer, X } from "lucide-react";
import Link from "next/link";
import { usePatient } from "@/hooks/usePatient";
import { usePrescription } from "@/hooks/usePrescription";
import { useInventorySearch } from "@/hooks/useInventory";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { PrescriptionItem } from "@/types";

export default function PrescribePage() {
  const params = useParams();
  const router = useRouter();
  const { patient, isLoading: isPatientLoading } = usePatient(params.id as string);
  
  const visits = patient?.visits || [];
  const latestVisit = visits[0];
  
  const { prescription, savePrescription } = usePrescription(latestVisit?.id || "");

  const [items, setItems] = useState<Partial<PrescriptionItem>[]>(prescription?.items || [{ id: crypto.randomUUID() }]);
  const [pathya, setPathya] = useState(prescription?.pathya || "");
  const [apathya, setApathya] = useState(prescription?.apathya || "");
  const [vihara, setVihara] = useState(prescription?.vihara || "");
  const [notes, setNotes] = useState(prescription?.notes || "");
  
  // Panchakarma State
  const [pkEnabled, setPkEnabled] = useState(false);
  const [pkName, setPkName] = useState("");
  const [pkTotalDays, setPkTotalDays] = useState(7);
  const [pkDays, setPkDays] = useState(Array.from({ length: 7 }).map((_, i) => ({ dayNumber: i + 1, notes: "" })));

  const [isSaving, setIsSaving] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);
  
  // Printing state
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [consultationFee, setConsultationFee] = useState<number>(300);
  useEffect(() => {
    if (prescription) {
      setItems(prescription.items?.length > 0 ? prescription.items : [{ id: crypto.randomUUID() }]);
      setPathya(prescription.pathya || "");
      setApathya(prescription.apathya || "");
      setVihara(prescription.vihara || "");
      setNotes(prescription.notes || "");
    }
  }, [prescription]);

  const handleAddItem = () => setItems(prev => [...prev, { id: crypto.randomUUID() }]);
  const handleRemoveItem = (id: string | number) => setItems(prev => prev.filter(item => item.id !== id));

  const updateItem = (id: string | number, field: string, value: any) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handlePreSave = () => {
    if (!latestVisit?.id) {
      toast.error("No active visit found for this patient.");
      return;
    }
    
    // Validate items
    const validItems = items.filter(i => i.customMedicineName || i.inventoryId);
    if (validItems.length === 0 && !pathya && !apathya && !vihara && !notes && !pkEnabled) {
      toast.error("Cannot save an empty prescription.");
      return;
    }

    if (pkEnabled && !pkName) {
      toast.error("Please enter a name for the Panchakarma treatment.");
      return;
    }

    setShowPrintModal(true);
  };

  const executeSaveAndPrint = async () => {
    const validItems = items.filter(i => i.customMedicineName || i.inventoryId);
    
    const payloadItems = validItems.map((i): PrescriptionItem => ({
      id: i.id || crypto.randomUUID(),
      inventoryId: i.inventoryId || undefined,
      customMedicineName: i.customMedicineName || (i.inventoryId ? undefined : ""),
      dosage: i.dosage || "1-0-1",
      frequency: i.frequency || "Twice a day",
      kala: i.kala || "After food",
      anupana: i.anupana || "Warm Water",
      duration: i.duration || "7 days",
      instructions: i.instructions || ""
    }));

    setIsSaving(true);
    try {
      await savePrescription({
        pathya,
        apathya,
        vihara,
        notes,
        items: payloadItems
      });

      if (pkEnabled) {
        await api.post('/panchakarma', {
          patientId: patient?.id,
          visitId: latestVisit?.id,
          name: pkName,
          totalDays: pkTotalDays,
          days: pkDays
        });
      }

      toast.success("Prescription saved successfully!");
      setTimeout(() => {
        window.print();
        router.push(`/dashboard/patients/${patient?.id || params.id}`);
      }, 500);
    } catch (err) {
      toast.error("Failed to save prescription or treatment.");
    } finally {
      setIsSaving(false);
      setShowPrintModal(false);
    }
  };

  if (isPatientLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] mt-2 text-foreground overflow-y-auto pb-20">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="flex justify-between items-end mb-6 shrink-0 no-print">
        <div>
          <Link href={`/dashboard/patients/${patient?.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-4 cursor-pointer">
            <ArrowLeft size={16} /> Back to Profile
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Prescription Builder</h1>
          <p className="text-muted-foreground font-medium mt-1">For {patient?.name} • Visit: {new Date(latestVisit?.date || Date.now()).toLocaleDateString()}</p>
        </div>
        <button 
          onClick={handlePreSave} 
          disabled={isSaving}
          className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
          Save & Print
        </button>
      </div>

      <div className="space-y-6 max-w-5xl no-print">
        {/* Medicines List */}
        <div className="premium-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Medicines</h2>
            <button onClick={handleAddItem} className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
              <Plus size={14}/> Add Medicine
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <MedicineRow 
                key={item.id} 
                item={item} 
                index={index}
                updateItem={updateItem}
                onRemove={() => handleRemoveItem(item.id as string)}
                isActiveSearch={activeSearchIndex === index}
                setActiveSearch={() => setActiveSearchIndex(index)}
                clearActiveSearch={() => setActiveSearchIndex(null)}
              />
            ))}
            {items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-xl font-medium">
                No medicines added yet.
              </div>
            )}
          </div>
        </div>

        {/* Panchakarma Treatment Designer */}
        <div className="premium-card p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">Panchakarma Treatment <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] uppercase tracking-wider">Designer</span></h2>
              <p className="text-sm text-muted-foreground mt-1">Design a multi-day Ayurvedic treatment plan for this patient.</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={pkEnabled}
                onChange={(e) => setPkEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
              />
              <span className="font-semibold text-sm">Enable</span>
            </label>
          </div>

          {pkEnabled && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 border border-primary/20 bg-primary/5 rounded-xl">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Treatment Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Vamana Karma, Basti"
                    value={pkName}
                    onChange={(e) => setPkName(e.target.value)}
                    className="w-full p-3 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Total Days</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      min="1" max="90"
                      value={pkTotalDays}
                      onChange={(e) => {
                        const days = parseInt(e.target.value) || 1;
                        setPkTotalDays(days);
                        setPkDays(Array.from({ length: days }).map((_, i) => ({
                          dayNumber: i + 1,
                          notes: pkDays[i]?.notes || ""
                        })));
                      }}
                      className="w-full p-3 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Daily Protocol</h3>
                <div className="grid gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {pkDays.map((day, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-3 bg-muted/20 border border-border rounded-lg">
                      <div className="shrink-0 w-16 text-center py-2 bg-secondary rounded text-secondary-foreground font-bold text-sm">
                        Day {day.dayNumber}
                      </div>
                      <input 
                        type="text"
                        placeholder="Daily instructions, oils to use, diet..."
                        value={day.notes}
                        onChange={(e) => {
                          const newDays = [...pkDays];
                          newDays[idx].notes = e.target.value;
                          setPkDays(newDays);
                        }}
                        className="w-full p-2 bg-background border border-border rounded outline-none focus:border-primary text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Ayurvedic Diet & Lifestyle */}
        <div className="premium-card p-6">
          <h2 className="text-xl font-bold mb-6">Diet & Lifestyle (Pathya-Apathya)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-emerald-600">Pathya (Recommended Diet)</label>
              <textarea 
                value={pathya}
                onChange={e => setPathya(e.target.value)}
                placeholder="E.g., Warm water, Moong dal, Light food..."
                className="w-full h-24 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-red-600">Apathya (Restricted Diet)</label>
              <textarea 
                value={apathya}
                onChange={e => setApathya(e.target.value)}
                placeholder="E.g., Curd at night, Spicy food, Cold items..."
                className="w-full h-24 p-4 bg-red-500/5 border border-red-500/20 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none" 
              />
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-blue-600">Vihara (Lifestyle Advice)</label>
            <textarea 
              value={vihara}
              onChange={e => setVihara(e.target.value)}
              placeholder="E.g., Wake up before sunrise, Yoga, Avoid day sleep..."
              className="w-full h-24 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" 
            />
          </div>
        </div>

        {/* General Notes */}
        <div className="premium-card p-6 mb-10">
          <h2 className="text-xl font-bold mb-4">General Notes</h2>
          <textarea 
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full h-24 p-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" 
          />
        </div>
      </div>

      {/* Print Preview Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 no-print">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Printer size={20} className="text-primary" /> Print Bill & Prescription
              </h2>
              <button onClick={() => setShowPrintModal(false)} className="text-muted-foreground hover:bg-muted p-2 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl">
                <div>
                  <h3 className="font-bold text-lg">Consultation Fee</h3>
                  <p className="text-sm text-muted-foreground">Will be added to the printed bill</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">₹</span>
                  <input 
                    type="number" 
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(parseInt(e.target.value) || 0)}
                    className="w-24 p-2 bg-background border border-border rounded-lg font-bold outline-none focus:border-primary"
                  />
                </div>
              </div>
              
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 text-sm">
                <p className="font-semibold text-primary mb-2">Print Preview Summary:</p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Patient: {patient?.name}</li>
                  <li>Medicines: {items.filter(i => i.customMedicineName || i.inventoryId).length} items</li>
                  <li>Consultation Fee: ₹{consultationFee}</li>
                </ul>
              </div>
            </div>
            
            <div className="p-6 border-t border-border flex gap-3">
              <button onClick={() => setShowPrintModal(false)} className="flex-1 py-3 font-bold border border-border rounded-xl hover:bg-muted">
                Cancel
              </button>
              <button onClick={executeSaveAndPrint} disabled={isSaving} className="flex-1 py-3 font-bold bg-primary text-primary-foreground rounded-xl shadow-md hover:shadow-lg flex justify-center items-center gap-2">
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
                Confirm & Print
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Actual Print Layout - Hidden on screen, visible on print */}
      <div className="print-section hidden print:block bg-white text-black p-8 max-w-4xl mx-auto">
         <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-3xl font-bold uppercase tracking-widest text-black">VAIDYA OS CLINIC</h1>
            <p className="text-sm text-black">Comprehensive Ayurvedic Care</p>
         </div>
         
         <div className="flex justify-between mb-8 text-sm text-black">
            <div>
               <p><span className="font-bold">Patient:</span> {patient?.name}</p>
               <p><span className="font-bold">Age/Gender:</span> {patient?.age} / {patient?.gender}</p>
               <p><span className="font-bold">Phone:</span> {patient?.phone}</p>
            </div>
            <div className="text-right">
               <p><span className="font-bold">Date:</span> {new Date().toLocaleDateString()}</p>
               <p><span className="font-bold">Doctor:</span> {latestVisit?.doctor || "Dr. Sharma"}</p>
            </div>
         </div>
         
         <div className="mb-8">
           <h2 className="text-xl font-bold border-b border-black mb-4 uppercase text-black">Prescription (Rx)</h2>
           <table className="w-full text-left text-sm mb-4 text-black">
             <thead>
               <tr className="border-b border-black">
                 <th className="py-2">Medicine</th>
                 <th className="py-2">Dosage</th>
                 <th className="py-2">Time</th>
                 <th className="py-2">Duration</th>
               </tr>
             </thead>
             <tbody>
               {items.filter(i => i.customMedicineName || i.inventoryId).map((item, idx) => (
                 <tr key={idx} className="border-b border-gray-300">
                   <td className="py-2 font-bold">{item.customMedicineName || item.inventoryId}</td>
                   <td className="py-2">{item.dosage}</td>
                   <td className="py-2">{item.kala}</td>
                   <td className="py-2">{item.duration}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
         
         {(pathya || apathya || vihara) && (
           <div className="mb-8 text-sm text-black">
             <h2 className="text-lg font-bold border-b border-black mb-2 uppercase text-black">Diet & Lifestyle</h2>
             {pathya && <p className="mb-1"><span className="font-bold">Pathya (Recommend):</span> {pathya}</p>}
             {apathya && <p className="mb-1"><span className="font-bold">Apathya (Avoid):</span> {apathya}</p>}
             {vihara && <p className="mb-1"><span className="font-bold">Vihara:</span> {vihara}</p>}
           </div>
         )}
         
         <div className="mt-12 flex justify-between items-end border-t-2 border-black pt-4 text-black">
           <div>
             <p className="font-bold text-lg">Consultation Fee: ₹{consultationFee}</p>
           </div>
           <div className="text-center">
             <div className="w-40 border-b border-black mb-1"></div>
             <p className="text-xs uppercase">Doctor&apos;s Signature</p>
           </div>
         </div>
      </div>
    </div>
  );
}

interface MedicineRowProps {
  item: Partial<PrescriptionItem>;
  index: number;
  updateItem: (id: string | number, field: string, value: any) => void;
  onRemove: () => void;
  isActiveSearch: boolean;
  setActiveSearch: () => void;
  clearActiveSearch: () => void;
}

function MedicineRow({ item, index, updateItem, onRemove, isActiveSearch, setActiveSearch, clearActiveSearch }: MedicineRowProps) {
  const [searchQuery, setSearchQuery] = useState(item.customMedicineName || "");
  const { results, isLoading } = useInventorySearch(isActiveSearch ? searchQuery : "");

  return (
    <div className="p-4 border border-border rounded-xl bg-muted/20 flex flex-col gap-4 relative">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 relative">
          <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Medicine Name</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="Search inventory or type custom name"
              value={searchQuery}
              onFocus={setActiveSearch}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                updateItem(item.id as string, "customMedicineName", e.target.value);
                updateItem(item.id as string, "inventoryId", null);
              }}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          {isActiveSearch && searchQuery.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl max-h-48 overflow-y-auto">
              {isLoading && <div className="p-3 text-center text-xs text-muted-foreground">Searching...</div>}
              {!isLoading && results.length === 0 && (
                <div 
                  className="p-3 text-sm cursor-pointer hover:bg-muted font-medium text-primary"
                  onClick={() => {
                    updateItem(item.id as string, "customMedicineName", searchQuery);
                    updateItem(item.id as string, "inventoryId", null);
                    clearActiveSearch();
                  }}
                >
                  Use "{searchQuery}" as custom medicine
                </div>
              )}
              {results.map((res: any) => (
                <div 
                  key={res.id} 
                  className="p-3 text-sm cursor-pointer hover:bg-muted font-medium flex justify-between items-center border-b border-border last:border-0"
                  onClick={() => {
                    setSearchQuery(res.name);
                    updateItem(item.id as string, "customMedicineName", res.name);
                    updateItem(item.id as string, "inventoryId", res.id);
                    clearActiveSearch();
                  }}
                >
                  <span>{res.name}</span>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">{res.type}</span>
                </div>
              ))}
            </div>
          )}
          {/* Backdrop for closing dropdown */}
          {isActiveSearch && (
            <div className="fixed inset-0 z-40" onClick={clearActiveSearch} />
          )}
        </div>
        <button onClick={onRemove} className="mt-6 text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors cursor-pointer">
          <Trash2 size={18} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Dosage</label>
          <input type="text" placeholder="1-0-1" value={item.dosage || ""} onChange={e => updateItem(item.id as string, "dosage", e.target.value)} className="w-full p-2 bg-background border border-border rounded text-sm outline-none focus:border-primary" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kala (Time)</label>
          <input type="text" placeholder="Pragbhakta (Before food)" value={item.kala || ""} onChange={e => updateItem(item.id as string, "kala", e.target.value)} className="w-full p-2 bg-background border border-border rounded text-sm outline-none focus:border-primary" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Anupana (Vehicle)</label>
          <input type="text" placeholder="Warm Water, Honey" value={item.anupana || ""} onChange={e => updateItem(item.id as string, "anupana", e.target.value)} className="w-full p-2 bg-background border border-border rounded text-sm outline-none focus:border-primary" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Duration</label>
          <input type="text" placeholder="7 days" value={item.duration || ""} onChange={e => updateItem(item.id as string, "duration", e.target.value)} className="w-full p-2 bg-background border border-border rounded text-sm outline-none focus:border-primary" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-1 rounded flex gap-1 items-center">
            Total Qty <span title="Required for auto-deduction from inventory">ⓘ</span>
          </label>
          <input type="number" min="0" placeholder="14" value={item.quantity || ""} onChange={e => updateItem(item.id as string, "quantity", parseInt(e.target.value) || 0)} className="w-full p-2 bg-primary/5 border border-primary/20 rounded text-sm outline-none focus:border-primary font-bold" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Instructions</label>
          <input type="text" placeholder="Chew well" value={item.instructions || ""} onChange={e => updateItem(item.id as string, "instructions", e.target.value)} className="w-full p-2 bg-background border border-border rounded text-sm outline-none focus:border-primary" />
        </div>
      </div>
    </div>
  );
}
