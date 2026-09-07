"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Search, Plus, AlertCircle, Loader2, ArrowUpDown, Filter, X, Save } from "lucide-react";
import { useInventoryList } from "@/hooks/useInventoryList";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { AddMedicineModal } from "@/components/forms/AddMedicineModal";
import { EmptyState } from "@/components/ui/EmptyState";

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { inventory, meta, isLoading, mutate } = useInventoryList(page, 15, debouncedSearch, filterStatus);

  const toggleLowStockFilter = () => {
    if (filterStatus === "low_stock") {
      setFilterStatus("");
    } else {
      setFilterStatus("low_stock");
      setPage(1);
    }
  };

  const getStatusBadge = (stockCount: number) => {
    if (stockCount === 0) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"><AlertCircle size={12} /> Out of Stock</span>;
    }
    if (stockCount < 20) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"><AlertCircle size={12} /> Low Stock</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">In Stock</span>;
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
            <Package className="text-primary" size={28} /> Pharmacy Inventory
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">Manage medicines, pricing, and track stock levels globally.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} /> Add Medicine
        </button>
      </motion.div>

      {/* Metrics Row */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0"
      >
        <div className="premium-card p-5 border-l-4 border-l-primary flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Items</p>
            <p className="text-2xl font-black">{meta.total}</p>
          </div>
        </div>
        <div className="premium-card p-5 border-l-4 border-l-amber-500 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Low Stock Alerts</p>
            <p className="text-2xl font-black">{inventory.filter((i: any) => i.stockCount > 0 && i.stockCount < 20).length}</p>
          </div>
        </div>
        <div className="premium-card p-5 border-l-4 border-l-red-500 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Out of Stock</p>
            <p className="text-2xl font-black">{inventory.filter((i: any) => i.stockCount === 0).length}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="premium-card p-0 flex flex-col flex-1 min-h-0 overflow-hidden"
      >
        <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search medicines by name..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
            />
          </div>
          <button 
            onClick={toggleLowStockFilter}
            className={`px-4 py-2 font-bold border rounded-lg transition-colors cursor-pointer text-sm flex items-center gap-2 ${
              filterStatus === "low_stock" 
                ? "bg-amber-500/20 border-amber-500/30 text-amber-700 dark:text-amber-400" 
                : "bg-muted text-foreground border-border hover:bg-muted/80"
            }`}
          >
            <Filter size={16} /> Low Stock Only
          </button>
        </div>

        {inventory.length === 0 && !isLoading ? (
          <EmptyState 
            icon={Package} 
            title="No medicines found" 
            description="Your inventory is empty or no items match your search. Add a new medicine to get started."
            action={<button onClick={() => setIsAddModalOpen(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold">Add First Medicine</button>}
          />
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 bg-muted/80 backdrop-blur-md z-10 border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold flex items-center gap-1 cursor-pointer hover:text-foreground">Medicine Name <ArrowUpDown size={12} /></th>
                  <th className="px-6 py-4 font-bold">Type</th>
                  <th className="px-6 py-4 font-bold">Current Stock</th>
                  <th className="px-6 py-4 font-bold">Price</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                      <p className="text-muted-foreground font-medium">Loading Inventory...</p>
                    </td>
                  </tr>
                ) : (
                  inventory.map((item: any) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                            <Package size={14} />
                          </div>
                          <span className="font-bold text-foreground">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold bg-secondary text-secondary-foreground px-2 py-1 rounded-md">{item.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-black text-lg ${item.stockCount < 20 ? "text-amber-500" : "text-foreground"}`}>
                          {item.stockCount}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1 font-medium">{item.unit}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-foreground">₹{item.price.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(item.stockCount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary font-bold hover:underline text-sm cursor-pointer px-3 py-1.5 rounded hover:bg-primary/10 transition-colors">
                          Restock / Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="border-t border-border p-4 flex items-center justify-between bg-muted/20 shrink-0">
          <span className="text-sm text-muted-foreground font-medium">
            Showing <span className="text-foreground font-bold">{inventory.length}</span> of <span className="text-foreground font-bold">{meta.total}</span> items
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

      <AddMedicineModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={() => { mutate(); setIsAddModalOpen(false); }} />
    </div>
  );
}
