"use client";

import { motion } from "framer-motion";
import { Package, Search, Plus, AlertCircle } from "lucide-react";

export default function InventoryPage() {
  const inventory = [
    { name: "Ashwagandha Churna", stock: 145, price: "₹250", status: "In Stock" },
    { name: "Triphala Guggulu", stock: 8, price: "₹180", status: "Low Stock" },
    { name: "Chyawanprash Awaleha", stock: 42, price: "₹450", status: "In Stock" },
    { name: "Brahmi Vati", stock: 0, price: "₹120", status: "Out of Stock" },
  ];

  return (
    <div className="space-y-8 mt-4 text-foreground">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">Pharmacy Inventory</h1>
          <p className="text-muted-foreground text-lg">Manage medicines and track stock levels.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
          <Plus size={18} /> Add Medicine
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="premium-card p-6"
      >
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search medicines by name..."
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-sm">
                <th className="pb-3 font-semibold pl-4">Medicine Name</th>
                <th className="pb-3 font-semibold">Current Stock</th>
                <th className="pb-3 font-semibold">Price (per unit)</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, i) => (
                <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors group">
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-muted border border-border text-foreground flex items-center justify-center">
                        <Package size={16} />
                      </div>
                      <span className="font-semibold text-sm">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-4 font-medium text-sm">{item.stock} Units</td>
                  <td className="py-4 font-medium text-sm">{item.price}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit ${
                      item.status === 'In Stock' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                      item.status === 'Low Stock' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                      'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                    }`}>
                      {item.status !== 'In Stock' && <AlertCircle size={12} />}
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 text-right pr-4">
                    <button className="text-primary font-semibold hover:underline text-sm cursor-pointer">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
