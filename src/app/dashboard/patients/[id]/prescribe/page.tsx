"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Plus, Trash2, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePatient } from "@/hooks/usePatient";
import { usePrescription } from "@/hooks/usePrescription";
import { useInventorySearch } from "@/hooks/useInventory";
import { toast } from "sonner";

export default function PrescribePage() {
  const params = useParams();
  const router = useRouter();
  const { patient, isLoading: isPatientLoading } = usePatient(params.id as string);
  
  const visits = patient?.visits || [];
  const latestVisit = visits[0];
  
  const { prescription, savePrescription } = usePrescription(latestVisit?.id || "");

  const [items, setItems] = useState<any[]>(prescription?.items || [{ id: Date.now() }]);
  const [pathya, setPathya] = useState(prescription?.pathya || "");
  const [apathya, setApathya] = useState(prescription?.apathya || "");
  const [vihara, setVihara] = useState(prescription?.vihara || "");
  const [notes, setNotes] = useState(prescription?.notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);
  useEffect(() => {
    if (prescription) {
      setItems(prescription.items?.length > 0 ? prescription.items : [{ id: Date.now() }]);
      setPathya(prescription.pathya || "");
      setApathya(prescription.apathya || "");
      setVihara(prescription.vihara || "");
      setNotes(prescription.notes || "");
    }
  }, [prescription]);

  const handleAddItem = () => setItems(prev => [...prev, { id: Date.now() }]);
  const handleRemoveItem = (id: number) => setItems(prev => prev.filter(item => item.id !== id));

  const updateItem = (id: number, field: string, value: any) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = async () => {
    if (!latestVisit?.id) {
      toast.error("No active visit found for this patient.");
      return;
    }
    
    // Validate items
    const validItems = items.filter(i => i.customMedicineName || i.inventoryId);
    if (validItems.length === 0 && !pathya && !apathya && !vihara && !notes) {
      toast.error("Cannot save an empty prescription.");
      return;
    }

    const payloadItems = validItems.map(i => ({
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
      toast.success("Prescription saved successfully!");
      router.push(`/dashboard/patients/${patient?.id || params.id}`);
    } catch (err) {
      toast.error("Failed to save prescription.");
    } finally {
      setIsSaving(false);
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
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <Link href={`/dashboard/patients/${patient?.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-4 cursor-pointer">
            <ArrowLeft size={16} /> Back to Profile
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Prescription Builder</h1>
          <p className="text-muted-foreground font-medium mt-1">For {patient?.name} • Visit: {new Date(latestVisit?.date || Date.now()).toLocaleDateString()}</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
          Save & Print
        </button>
      </div>

      <div className="space-y-6 max-w-5xl">
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
                onRemove={() => handleRemoveItem(item.id)}
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
    </div>
  );
}

function MedicineRow({ item, index, updateItem, onRemove, isActiveSearch, setActiveSearch, clearActiveSearch }: any) {
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
                updateItem(item.id, "customMedicineName", e.target.value);
                updateItem(item.id, "inventoryId", null);
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
                    updateItem(item.id, "customMedicineName", searchQuery);
                    updateItem(item.id, "inventoryId", null);
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
                    updateItem(item.id, "customMedicineName", res.name);
                    updateItem(item.id, "inventoryId", res.id);
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
          <input type="text" placeholder="1-0-1" value={item.dosage || ""} onChange={e => updateItem(item.id, "dosage", e.target.value)} className="w-full p-2 bg-background border border-border rounded text-sm outline-none focus:border-primary" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kala (Time)</label>
          <input type="text" placeholder="Pragbhakta (Before food)" value={item.kala || ""} onChange={e => updateItem(item.id, "kala", e.target.value)} className="w-full p-2 bg-background border border-border rounded text-sm outline-none focus:border-primary" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Anupana (Vehicle)</label>
          <input type="text" placeholder="Warm Water, Honey" value={item.anupana || ""} onChange={e => updateItem(item.id, "anupana", e.target.value)} className="w-full p-2 bg-background border border-border rounded text-sm outline-none focus:border-primary" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Duration</label>
          <input type="text" placeholder="7 days" value={item.duration || ""} onChange={e => updateItem(item.id, "duration", e.target.value)} className="w-full p-2 bg-background border border-border rounded text-sm outline-none focus:border-primary" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-1 rounded flex gap-1 items-center">
            Total Qty <span title="Required for auto-deduction from inventory">ⓘ</span>
          </label>
          <input type="number" min="0" placeholder="14" value={item.quantity || ""} onChange={e => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)} className="w-full p-2 bg-primary/5 border border-primary/20 rounded text-sm outline-none focus:border-primary font-bold" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Instructions</label>
          <input type="text" placeholder="Chew well" value={item.instructions || ""} onChange={e => updateItem(item.id, "instructions", e.target.value)} className="w-full p-2 bg-background border border-border rounded text-sm outline-none focus:border-primary" />
        </div>
      </div>
    </div>
  );
}
