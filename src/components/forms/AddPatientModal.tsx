import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { usePatients } from '@/hooks/usePatients';

const patientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.coerce.number().positive("Age must be positive"),
  gender: z.string().min(1, "Gender is required"),
  phone: z.string().min(10, "Valid phone is required"),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddPatientModal({ isOpen, onClose }: AddPatientModalProps) {
  const { mutate } = usePatients();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema)
  });

  const onSubmit = async (data: PatientFormValues) => {
    try {
      await api.post('/patients', data);
      toast.success("Patient created successfully");
      mutate();
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create patient");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-background w-full max-w-lg rounded-xl shadow-xl overflow-hidden border border-border"
        >
          <div className="flex justify-between items-center p-6 border-b border-border">
            <h2 className="text-xl font-bold">Add New Patient</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors cursor-pointer">
              <X size={20} className="text-muted-foreground" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input 
                {...register('name')} 
                className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                placeholder="e.g. Rahul Sharma"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Age</label>
                <input 
                  type="number"
                  {...register('age')} 
                  className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                />
                {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select 
                  {...register('gender')} 
                  className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input 
                {...register('phone')} 
                className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                placeholder="10-digit number"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" isLoading={isSubmitting}>Save Patient</Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
