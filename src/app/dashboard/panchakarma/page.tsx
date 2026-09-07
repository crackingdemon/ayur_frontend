"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Activity, CheckCircle2, Circle, Clock, ChevronDown, CalendarDays, X } from "lucide-react";
import { usePanchakarma, PanchakarmaTreatment } from "@/hooks/usePanchakarma";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

export default function PanchakarmaDirectory() {
  const [filter, setFilter] = useState<'Active' | 'Completed' | 'All'>('Active');
  const [searchQuery, setSearchQuery] = useState("");
  const { treatments, isLoading, mutate } = usePanchakarma({ status: filter === 'All' ? undefined : filter });
  const [selectedTreatment, setSelectedTreatment] = useState<PanchakarmaTreatment | null>(null);

  const filteredTreatments = treatments.filter(t => 
    t.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-auto bg-background/50 relative">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Panchakarma Tracker</h1>
            <p className="text-muted-foreground mt-1">Manage ongoing and completed Ayurvedic treatments across all branches.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Search patient or treatment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="All">All Treatments</option>
            </select>
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Activity className="h-8 w-8 text-primary animate-pulse" />
          </div>
        ) : filteredTreatments.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card/50">
            <Activity className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No treatments found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTreatments.map((treatment) => (
              <TreatmentCard 
                key={treatment.id} 
                treatment={treatment} 
                onClick={() => setSelectedTreatment(treatment)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Side Panel */}
      <AnimatePresence>
        {selectedTreatment && (
          <TreatmentPanel 
            treatment={selectedTreatment} 
            onClose={() => setSelectedTreatment(null)}
            onUpdate={() => mutate()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TreatmentCard({ treatment, onClick }: { treatment: PanchakarmaTreatment, onClick: () => void }) {
  const completedDays = treatment.days.filter(d => d.status === 'Completed').length;
  const progress = Math.round((completedDays / treatment.totalDays) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{treatment.name}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{treatment.patient.name}</p>
        </div>
        <div className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
          treatment.status === 'Completed' ? 'bg-green-100 text-green-700' : 
          treatment.status === 'Active' ? 'bg-blue-100 text-blue-700' : 
          'bg-gray-100 text-gray-700'
        }`}>
          {treatment.status}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4" />
            <span>{treatment.startDate ? format(new Date(treatment.startDate), 'MMM d, yyyy') : 'No date'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4" />
            <span>{treatment.totalDays} Days</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium mb-1.5">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-foreground">{completedDays}/{treatment.totalDays} Days</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TreatmentPanel({ treatment, onClose, onUpdate }: { treatment: PanchakarmaTreatment, onClose: () => void, onUpdate: () => void }) {
  const [updating, setUpdating] = useState<string | null>(null);

  const toggleDayStatus = async (dayId: string, currentStatus: string) => {
    try {
      setUpdating(dayId);
      const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
      await api.put(`/panchakarma/${treatment.id}/day/${dayId}`, { status: newStatus });
      toast.success(`Day marked as ${newStatus}`);
      onUpdate();
    } catch (error) {
      toast.error("Failed to update day status");
    } finally {
      setUpdating(null);
    }
  };

  const markTreatmentComplete = async () => {
    if (!confirm("Are you sure you want to mark this entire treatment as completed?")) return;
    try {
      await api.post(`/panchakarma/${treatment.id}/complete`, {});
      toast.success("Treatment completed!");
      onUpdate();
      onClose();
    } catch (error) {
      toast.error("Failed to complete treatment");
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
      />
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-card border-l border-border shadow-2xl z-50 flex flex-col"
      >
        <div className="p-6 border-b border-border flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{treatment.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">Patient: {treatment.patient.name} • {treatment.patient.phone}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/10 rounded-xl">
            <div>
              <p className="text-sm font-medium text-primary">Treatment Status</p>
              <p className="text-2xl font-bold text-foreground mt-1">{treatment.status}</p>
            </div>
            {treatment.status === 'Active' && (
              <button 
                onClick={markTreatmentComplete}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                Mark Complete
              </button>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Daily Tracker
            </h3>
            <div className="space-y-3">
              {treatment.days.map((day) => {
                const isCompleted = day.status === 'Completed';
                const isUpdating = updating === day.id;

                return (
                  <div 
                    key={day.id} 
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                      isCompleted ? 'bg-muted/30 border-border' : 'bg-card border-border hover:border-primary/30'
                    }`}
                  >
                    <button 
                      onClick={() => toggleDayStatus(day.id, day.status)}
                      disabled={isUpdating}
                      className="mt-1 text-primary focus:outline-none transition-transform hover:scale-110 disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <Activity className="w-6 h-6 animate-spin text-muted-foreground" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className={`font-semibold text-sm ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          Day {day.dayNumber}
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                          {day.status}
                        </span>
                      </div>
                      {day.notes ? (
                        <p className={`text-sm mt-1.5 ${isCompleted ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                          {day.notes}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground/50 mt-1 italic">No notes provided</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
