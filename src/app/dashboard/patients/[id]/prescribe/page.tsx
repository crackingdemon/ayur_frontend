"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Plus, Trash2, Pill, CheckCircle, Package } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

// Mock Inventory Data
const inventory = [
  { id: 1, name: "Ashwagandha Churna", stock: 145, price: 250 },
  { id: 2, name: "Triphala Guggulu", stock: 8, price: 180 },
  { id: 3, name: "Chyawanprash Awaleha", stock: 42, price: 450 },
  { id: 4, name: "Brahmi Vati", stock: 0, price: 120 },
];

export default function PrescriptionBuilder() {
  const params = useParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = (item: any) => {
    if (item.stock === 0) return; // Cannot add out of stock
    if (selectedItems.find(i => i.id === item.id)) return; // Already added
    
    setSelectedItems([...selectedItems, {
      ...item,
      dosage: "1-0-1",
      duration: "5 Days",
      quantity: 10
    }]);
    setSearchTerm("");
  };

  const handleRemoveItem = (id: number) => {
    setSelectedItems(selectedItems.filter(i => i.id !== id));
  };

  const handleUpdateItem = (id: number, field: string, value: string | number) => {
    setSelectedItems(selectedItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleFinalize = () => {
    setIsSubmitting(true);
    // Simulate API call to save prescription and deduct inventory
    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`/dashboard/patients/${params.id}`);
    }, 1500);
  };

  return (
    <div className="space-y-6 mt-2 text-foreground max-w-5xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link href={`/dashboard/patients/${params.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-4 cursor-pointer">
          <ArrowLeft size={16} /> Back to Profile
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Pill className="text-primary" size={28} /> Write Prescription
            </h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">Prescribing for PT-{String(params.id).padStart(4, '0')} (Rahul Verma)</p>
          </div>
          <button 
            onClick={handleFinalize}
            disabled={selectedItems.length === 0 || isSubmitting}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Saving & Deducting...</span>
            ) : (
              <><CheckCircle size={18} /> Finalize Prescription</>
            )}
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Search & Add */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 space-y-4"
        >
          <div className="premium-card p-5">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b border-border pb-2">
              <Search size={18} className="text-primary" /> Search Pharmacy
            </h3>
            
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Search size={16} />
              </div>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search medicines..."
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>

            {searchTerm && (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {filteredInventory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No medicines found.</p>
                ) : (
                  filteredInventory.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => handleAddItem(item)}
                      className={`p-3 rounded-lg border text-sm transition-all flex justify-between items-center ${
                        item.stock === 0 
                          ? 'border-red-500/20 bg-red-500/5 cursor-not-allowed opacity-75' 
                          : 'border-border bg-card hover:bg-muted cursor-pointer group'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-foreground">{item.name}</p>
                        <p className={`text-xs mt-0.5 font-medium ${item.stock <= 10 && item.stock > 0 ? 'text-amber-500' : item.stock === 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                          {item.stock} in stock
                        </p>
                      </div>
                      {item.stock > 0 && (
                        <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus size={14} />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="premium-card p-5">
            <h3 className="font-bold text-lg mb-3">General Notes</h3>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add instructions, diet restrictions, or next visit details..."
              className="w-full h-32 p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
            />
          </div>
        </motion.div>

        {/* Right Column: Prescribed Items */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="premium-card h-full flex flex-col">
            <div className="p-5 border-b border-border bg-muted/30">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Package size={18} className="text-primary" /> Selected Medicines
                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs border border-primary/20">{selectedItems.length}</span>
              </h3>
            </div>
            
            <div className="p-5 flex-1">
              {selectedItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl p-10 bg-muted/10">
                  <Pill size={48} className="mb-4 opacity-20" />
                  <p className="font-medium text-center">No medicines selected.</p>
                  <p className="text-sm text-center mt-1 opacity-70">Search and click a medicine on the left to add it to the prescription.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedItems.map((item, index) => (
                    <div key={item.id} className="p-4 rounded-xl border border-border bg-card relative group">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-lg text-foreground flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs border border-border">{index + 1}</span>
                          {item.name}
                        </h4>
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dosage</label>
                          <input 
                            type="text" 
                            value={item.dosage}
                            onChange={(e) => handleUpdateItem(item.id, 'dosage', e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                            placeholder="e.g., 1-0-1 after meals"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duration</label>
                          <input 
                            type="text" 
                            value={item.duration}
                            onChange={(e) => handleUpdateItem(item.id, 'duration', e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                            placeholder="e.g., 5 Days"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex justify-between">
                            <span>Quantity (Deduct)</span>
                            <span className="text-primary font-bold">Max: {item.stock}</span>
                          </label>
                          <input 
                            type="number" 
                            min="1"
                            max={item.stock}
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all font-bold text-primary"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {selectedItems.length > 0 && (
              <div className="p-5 border-t border-border bg-muted/30 flex justify-between items-center rounded-b-xl">
                <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-500" />
                  Inventory will be automatically deducted upon finalize.
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
