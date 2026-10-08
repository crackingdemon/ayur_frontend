"use client";

import { motion } from "framer-motion";
import { Search, Plus, User, FileText, ChevronRight, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { usePatients } from "@/hooks/usePatients";
import { useState } from "react";
import { AddPatientModal } from "@/components/forms/AddPatientModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function PatientsDirectory() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { patients, meta, isLoading, isError: error } = usePatients(undefined, page, limit);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)] text-red-500">
        Error loading patients. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-2 text-foreground">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold mb-1 tracking-tight">Patient Directory</h1>
          <p className="text-muted-foreground text-sm font-medium">Manage and view patient medical records.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
          <Plus size={18} /> Add New Patient
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="premium-card p-6"
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Search patients by name, phone, or ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>
          <button className="px-4 py-2.5 bg-muted text-foreground font-semibold border border-border rounded-lg hover:bg-muted/80 transition-colors cursor-pointer text-sm">
            Filters
          </button>
        </div>

        {patients.length === 0 ? (
          <EmptyState 
            icon={Users} 
            title="No patients found" 
            description="Your clinic currently has no registered patients. Add a new patient to get started."
            action={<Button onClick={() => setIsAddModalOpen(true)}>Add First Patient</Button>}
          />
        ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-sm bg-muted/20">
                    <th className="py-3 font-semibold pl-4 rounded-tl-lg">Patient Name</th>
                    <th className="py-3 font-semibold">Contact</th>
                    <th className="py-3 font-semibold">Details</th>
                    <th className="py-3 font-semibold">Last Visit</th>
                    <th className="py-3 font-semibold text-right pr-4 rounded-tr-lg">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => {
                    const latestVisit = patient.visits?.[0];
                    return (
                      <tr key={patient.id} className="border-b border-border hover:bg-muted/30 transition-colors group">
                        <td className="py-4 pl-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                              {patient.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <span className="font-semibold text-sm text-foreground block">{patient.name}</span>
                              <span className="text-xs text-muted-foreground">ID: PT-{patient.id.substring(0, 4).toUpperCase()}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-sm font-medium">{patient.phone}</span>
                        </td>
                        <td className="py-4">
                          <span className="text-xs text-muted-foreground">{patient.age} Yrs • {patient.gender}</span>
                          <p className="text-sm font-medium mt-0.5">{latestVisit?.reason || 'No visits yet'}</p>
                        </td>
                        <td className="py-4">
                          <span className="text-sm font-medium">{latestVisit ? new Date(latestVisit.date).toLocaleDateString() : 'N/A'}</span>
                        </td>
                        <td className="py-4 text-right pr-4">
                          <Link href={`/dashboard/patients/${patient.id}`}>
                            <button className="px-3 py-1.5 text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer border border-border hover:border-primary">
                              View Profile <ChevronRight size={14} />
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination UI */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border mt-6 pt-4 px-2">
                <span className="text-sm text-muted-foreground font-medium">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, meta.total)} of {meta.total} patients
                </span>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1}
                    className="h-8 px-3 text-xs bg-muted text-foreground hover:bg-muted/80 border border-border"
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-semibold px-2">Page {page} of {meta.totalPages}</span>
                  <Button 
                    onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} 
                    disabled={page === meta.totalPages}
                    className="h-8 px-3 text-xs bg-muted text-foreground hover:bg-muted/80 border border-border"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      <AddPatientModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
