"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Download, Printer, X, Pill, Clock, Plus, ChevronRight, Loader2, Thermometer, User, FileOutput, CheckCircle2, Banknote } from "lucide-react";
import Link from "next/link";
import { useAllPrescriptions } from "@/hooks/useAllPrescriptions";
import { format } from "date-fns";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function PrescriptionsDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);
  const [isDispensing, setIsDispensing] = useState(false);
  const [isDispenseModalOpen, setIsDispenseModalOpen] = useState(false);
  const [itemsBilling, setItemsBilling] = useState<Record<string, { unitPrice: number, discount: number, discountType: 'flat' | 'percent', quantity: number, total: number }>>({});

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { prescriptions, meta, isLoading, mutate } = useAllPrescriptions(page, 10, debouncedSearch);

  const handleDispenseClick = () => {
    if (!selectedPrescription) return;
    const initialBilling: Record<string, { unitPrice: number, discount: number, discountType: 'flat' | 'percent', quantity: number, total: number }> = {};
    selectedPrescription.items?.forEach((item: any) => {
      const isInventory = item.inventoryId && item.inventory;
      const unitPrice = isInventory ? item.inventory.price : 0;
      const quantity = item.quantity || 0;
      initialBilling[item.id] = {
        unitPrice,
        discount: 0,
        discountType: 'flat',
        quantity,
        total: unitPrice * quantity
      };
    });
    setItemsBilling(initialBilling);
    setIsDispenseModalOpen(true);
  };

  const executeDispense = async () => {
    if (!selectedPrescription) return;
    setIsDispensing(true);
    try {
      // Resolve percentage discounts to absolute monetary amounts before sending
      const resolvedBilling: Record<string, any> = {};
      Object.keys(itemsBilling).forEach(id => {
        const item = itemsBilling[id];
        const subTotal = item.unitPrice * item.quantity;
        const discountAmount = item.discountType === 'percent' 
          ? (subTotal * (item.discount / 100)) 
          : item.discount;
          
        resolvedBilling[id] = {
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          discount: discountAmount,
          total: item.total
        };
      });

      await api.post(`/prescriptions/${selectedPrescription.id}/dispense`, {
        itemsBilling: resolvedBilling
      });
      toast.success("Prescription dispensed and billed successfully!");
      mutate();
      setIsDispenseModalOpen(false);
      setSelectedPrescription(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to dispense prescription");
    } finally {
      setIsDispensing(false);
    }
  };

  return (
    <div className="space-y-8 mt-2 text-foreground relative h-[calc(100vh-6rem)] flex flex-col">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0"
      >
        <div>
          <h1 className="text-3xl font-bold mb-1 tracking-tight flex items-center gap-3">
            <FileText className="text-primary" size={28} /> Prescription History
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">View all issued prescriptions across the clinic.</p>
        </div>
        <Link href="/dashboard/patients">
          <button className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
            <Plus size={18} /> New Prescription
          </button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="premium-card p-0 flex flex-col flex-1 min-h-0 overflow-hidden"
      >
        <div className="p-6 border-b border-border flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Patient Name..."
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-muted/80 backdrop-blur-md z-10 border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Patient</th>
                <th className="px-6 py-4 font-semibold">Visit Date</th>
                <th className="px-6 py-4 font-semibold">Medicines</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">Loading Prescriptions...</p>
                  </td>
                </tr>
              ) : prescriptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="text-muted-foreground" size={32} />
                    </div>
                    <p className="text-lg font-bold text-foreground mb-1">No prescriptions found</p>
                    <p className="text-sm text-muted-foreground">There are no prescriptions matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                prescriptions.map((rx: any) => (
                  <tr key={rx.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm">
                          {(rx.visit?.patient?.name || "?").substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-foreground block">{rx.visit?.patient?.name || "Unknown"}</span>
                          <span className="text-xs text-muted-foreground">{rx.visit?.patient?.phone || "No phone"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold block">{rx.visit?.date ? format(new Date(rx.visit.date), 'MMM d, yyyy') : "Unknown"}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock size={12} /> {rx.visit?.date ? format(new Date(rx.visit.date), 'hh:mm a') : "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-sm">
                          {rx.items?.length || 0}
                        </span>
                        <span className="text-sm text-muted-foreground font-medium">Items</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit ${
                        rx.status === 'Dispensed' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {rx.status === 'Dispensed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {rx.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedPrescription(rx)}
                        className="px-4 py-2 text-xs font-bold bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer border border-border shadow-sm hover:shadow-md"
                      >
                        Preview <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="border-t border-border p-4 flex items-center justify-between bg-muted/20 shrink-0">
          <span className="text-sm text-muted-foreground font-medium">
            Showing <span className="text-foreground font-bold">{prescriptions.length}</span> of <span className="text-foreground font-bold">{meta.total}</span> prescriptions
          </span>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded border border-border bg-card text-sm font-semibold disabled:opacity-50 hover:bg-muted transition-colors cursor-pointer shadow-sm"
            >
              Previous
            </button>
            <div className="px-3 py-1.5 text-sm font-bold border border-border rounded bg-muted shadow-inner">
              {page} / {meta.totalPages || 1}
            </div>
            <button 
              disabled={page === meta.totalPages || meta.totalPages === 0}
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              className="px-3 py-1.5 rounded border border-border bg-card text-sm font-semibold disabled:opacity-50 hover:bg-muted transition-colors cursor-pointer shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>

      {/* Slide-over Modal for Prescription Details */}
      <AnimatePresence>
        {selectedPrescription && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPrescription(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-card border-l border-border shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                      <FileText className="text-primary" size={20} /> Prescription Details
                    </h2>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${
                      selectedPrescription.status === 'Dispensed' 
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}>
                      {selectedPrescription.status || 'Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Issued on {selectedPrescription.visit?.date ? format(new Date(selectedPrescription.visit.date), 'MMMM d, yyyy') : "Unknown Date"}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedPrescription(null)}
                  className="p-2 bg-background border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {/* Doctor & Patient Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-background shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                      <User size={48} />
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Patient</p>
                    <p className="font-bold text-foreground text-lg truncate">{selectedPrescription.visit?.patient?.name}</p>
                    <Link href={`/dashboard/patients/${selectedPrescription.visit?.patient?.id}`}>
                      <span className="text-xs text-primary font-bold hover:underline cursor-pointer inline-flex items-center gap-1 mt-1">
                        View Profile <ChevronRight size={12} />
                      </span>
                    </Link>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-background shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                      <Thermometer size={48} />
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Doctor</p>
                    <p className="font-bold text-foreground text-lg">{selectedPrescription.visit?.doctor || "Dr. Sharma"}</p>
                  </div>
                </div>

                {/* Medicines List */}
                {selectedPrescription.items?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <Pill className="text-primary" size={18} /> Prescribed Medicines
                    </h3>
                    <div className="space-y-3">
                      {selectedPrescription.items.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl border border-border bg-background shadow-sm flex flex-col gap-3">
                          <h4 className="font-bold text-foreground flex items-center gap-2 text-base">
                            <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                            {item.inventory?.name || item.customMedicineName}
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-muted/30 p-3 rounded-lg border border-border/50">
                            <div>
                              <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Dosage</span>
                              <span className="text-sm font-semibold">{item.dosage}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Duration</span>
                              <span className="text-sm font-semibold">{item.duration}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">Quantity</span>
                              <span className="text-sm font-bold text-primary">{item.quantity || "N/A"}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Kala (Time)</span>
                              <span className="text-sm font-semibold">{item.kala || "-"}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Anupana</span>
                              <span className="text-sm font-semibold">{item.anupana || "-"}</span>
                            </div>
                          </div>
                          {item.instructions && (
                            <p className="text-xs text-muted-foreground font-medium bg-amber-500/5 p-2 rounded border border-amber-500/10">
                              <span className="font-bold text-amber-700 dark:text-amber-500">Inst:</span> {item.instructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ayurvedic Diet & Lifestyle */}
                {(selectedPrescription.pathya || selectedPrescription.apathya || selectedPrescription.vihara) && (
                  <div>
                    <h3 className="font-bold text-lg mb-3">Diet & Lifestyle</h3>
                    <div className="space-y-3">
                      {selectedPrescription.pathya && (
                        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                          <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Pathya (Recommended)</p>
                          <p className="text-sm font-medium">{selectedPrescription.pathya}</p>
                        </div>
                      )}
                      {selectedPrescription.apathya && (
                        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                          <p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-1">Apathya (Restricted)</p>
                          <p className="text-sm font-medium">{selectedPrescription.apathya}</p>
                        </div>
                      )}
                      {selectedPrescription.vihara && (
                        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                          <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Vihara (Lifestyle)</p>
                          <p className="text-sm font-medium">{selectedPrescription.vihara}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedPrescription.notes && (
                  <div>
                    <h3 className="font-bold text-lg mb-3">General Notes</h3>
                    <div className="p-4 rounded-xl border border-border bg-muted/30 text-sm font-medium text-foreground">
                      {selectedPrescription.notes}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-border bg-background flex gap-3 shrink-0">
                {selectedPrescription.status !== 'Dispensed' ? (
                  <>
                    <button 
                      disabled={isDispensing}
                      onClick={handleDispenseClick}
                      className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-base"
                    >
                      {isDispensing ? <Loader2 size={18} className="animate-spin" /> : <Banknote size={18} />} 
                      Dispense & Bill
                    </button>
                    <Link href={`/dashboard/patients/${selectedPrescription.visit?.patient?.id}/prescribe`} className="flex-none">
                      <button className="w-full py-3 px-6 rounded-xl border border-border bg-card font-bold shadow-sm hover:bg-muted transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm">
                        <FileOutput size={16} /> Edit
                      </button>
                    </Link>
                  </>
                ) : (
                  <>
                    <button className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm">
                      <Printer size={16} /> Print Full PDF
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dispense & Bill Confirmation Modal */}
      <AnimatePresence>
        {isDispenseModalOpen && selectedPrescription && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsDispenseModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl flex flex-col overflow-hidden z-10"
            >
              <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <Banknote className="text-emerald-500" size={24} /> 
                  Dispense & Bill Confirmation
                </h2>
                <button 
                  onClick={() => setIsDispenseModalOpen(false)}
                  className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh] styled-scrollbar">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Medicine</th>
                      <th className="px-4 py-3">Qty</th>
                      <th className="px-4 py-3">Unit Price (₹)</th>
                      <th className="px-4 py-3">Discount</th>
                      <th className="px-4 py-3 text-right rounded-tr-lg">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedPrescription.items?.map((item: any) => {
                      const isInventory = item.inventoryId && item.inventory;
                      const name = isInventory ? item.inventory.name : item.customMedicineName;
                      const billing = itemsBilling[item.id] || { unitPrice: 0, discount: 0, discountType: 'flat', quantity: 0, total: 0 };
                      
                      const updateBilling = (field: string, value: any) => {
                        setItemsBilling(prev => {
                          const current = { ...prev[item.id], [field]: value };
                          // Recalculate total
                          const subTotal = current.unitPrice * current.quantity;
                          const discountAmount = current.discountType === 'percent' 
                            ? (subTotal * (current.discount / 100)) 
                            : current.discount;
                          current.total = Math.max(0, subTotal - discountAmount);
                          return { ...prev, [item.id]: current };
                        });
                      };

                      return (
                        <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-4 font-medium flex items-center gap-2">
                            {name} {!isInventory && <span className="text-[10px] bg-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Custom</span>}
                          </td>
                          <td className="px-4 py-4">
                            <input 
                              type="number" 
                              min="0"
                              value={billing.quantity === 0 ? '' : billing.quantity}
                              onChange={(e) => updateBilling('quantity', parseInt(e.target.value) || 0)}
                              className="w-16 p-1.5 bg-background border border-border rounded focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <input 
                              type="number" 
                              min="0"
                              value={billing.unitPrice === 0 ? '' : billing.unitPrice}
                              onChange={(e) => updateBilling('unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-20 p-1.5 bg-background border border-border rounded focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                min="0"
                                value={billing.discount === 0 ? '' : billing.discount}
                                onChange={(e) => updateBilling('discount', parseFloat(e.target.value) || 0)}
                                className="w-16 p-1.5 bg-background border border-border rounded focus:ring-2 focus:ring-primary/20 outline-none"
                              />
                              <select 
                                value={billing.discountType}
                                onChange={(e) => updateBilling('discountType', e.target.value)}
                                className="p-1.5 bg-background border border-border rounded focus:ring-2 focus:ring-primary/20 outline-none text-xs"
                              >
                                <option value="flat">₹</option>
                                <option value="percent">%</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right font-bold text-primary text-base">
                            ₹{billing.total.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-6 border-t border-border bg-muted/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Grand Total</span>
                  <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">
                    ₹{Object.values(itemsBilling).reduce((sum, item) => sum + item.total, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => setIsDispenseModalOpen(false)}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-border bg-card font-bold hover:bg-muted transition-colors cursor-pointer text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={isDispensing}
                    onClick={executeDispense}
                    className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-base"
                  >
                    {isDispensing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} 
                    Confirm & Bill
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
