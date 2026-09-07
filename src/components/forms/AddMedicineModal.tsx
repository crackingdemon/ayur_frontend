import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '../ui/Button';

const inventorySchema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  type: z.string().min(1, "Type is required"),
  stockCount: z.coerce.number().min(0, "Stock cannot be negative"),
  unit: z.string().min(1, "Unit is required"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
});

type InventoryFormValues = z.infer<typeof inventorySchema>;

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
}

export function AddMedicineModal({ isOpen, onClose, onAdd }: AddMedicineModalProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: "",
      type: "Vati",
      stockCount: 0,
      unit: "pills",
      price: 0
    }
  });

  const onSubmit = async (data: InventoryFormValues) => {
    try {
      await api.post("/inventory", data);
      toast.success("Medicine added to inventory successfully!");
      onAdd();
      reset();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add medicine");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
      />
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-card border-l border-border shadow-2xl z-50 flex flex-col"
      >
        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
          <h2 className="text-xl font-bold tracking-tight">Add New Medicine</h2>
          <button onClick={onClose} className="p-2 bg-background border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shadow-sm"><X size={20} /></button>
        </div>
        
        <form id="inventory-form" onSubmit={handleSubmit(onSubmit)} className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Medicine Name</label>
            <input 
              {...register('name')}
              className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium" 
              placeholder="e.g. Ashwagandha Churna" 
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ayurvedic Type</label>
            <select 
              {...register('type')}
              className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            >
              <option value="Vati">Vati (Tablets)</option>
              <option value="Churna">Churna (Powder)</option>
              <option value="Asava/Arishta">Asava / Arishta (Liquid)</option>
              <option value="Ghrita">Ghrita (Ghee)</option>
              <option value="Taila">Taila (Oil)</option>
              <option value="Bhasma">Bhasma</option>
              <option value="Other">Other</option>
            </select>
            {errors.type && <p className="text-red-500 text-xs">{errors.type.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Initial Stock</label>
              <input 
                type="number" min="0" 
                {...register('stockCount')}
                className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium" 
              />
              {errors.stockCount && <p className="text-red-500 text-xs">{errors.stockCount.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Unit</label>
              <input 
                type="text" 
                {...register('unit')}
                className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium" 
                placeholder="pills, grams, ml" 
              />
              {errors.unit && <p className="text-red-500 text-xs">{errors.unit.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Price (per unit)</label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-muted-foreground font-bold font-mono">₹</span>
              <input 
                type="number" step="0.01" min="0" 
                {...register('price')}
                className="w-full pl-8 pr-3 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold" 
              />
            </div>
            {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
          </div>
        </form>

        <div className="p-6 border-t border-border bg-muted/30">
          <Button 
            type="submit" 
            form="inventory-form"
            isLoading={isSubmitting} 
            className="w-full py-6 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {!isSubmitting && <Save size={18} />} Save Medicine
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
