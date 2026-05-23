"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Download, Printer, X, Pill, Clock, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function PrescriptionsDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);

  // Comprehensive Mock Data simulating joined real data
  const prescriptions = [
    {
      id: "PR-1042",
      patientName: "Rahul Verma",
      patientId: "1",
      doctorName: "Dr. Sharma",
      date: "Nov 12, 2023",
      time: "10:30 AM",
      status: "Dispensed",
      notes: "Follow up after 2 weeks. Monitor BP daily.",
      items: [
        { name: "Ashwagandha Churna", dosage: "1-0-1 after meals", duration: "14 Days", quantity: 28 },
        { name: "Brahmi Vati", dosage: "1-1-1", duration: "14 Days", quantity: 42 }
      ]
    },
    {
      id: "PR-1041",
      patientName: "Priya Singh",
      patientId: "2",
      doctorName: "Dr. Sharma",
      date: "Nov 12, 2023",
      time: "09:45 AM",
      status: "Pending Pharmacy",
      notes: "Avoid spicy food.",
      items: [
        { name: "Triphala Guggulu", dosage: "2 pills at bedtime", duration: "7 Days", quantity: 14 }
      ]
    },
    {
      id: "PR-1040",
      patientName: "Amit Kumar",
      patientId: "3",
      doctorName: "Dr. Verma",
      date: "Nov 11, 2023",
      time: "04:15 PM",
      status: "Dispensed",
      notes: "Take with warm water.",
      items: [
        { name: "Chyawanprash Awaleha", dosage: "1 spoon morning", duration: "30 Days", quantity: 1 }
      ]
    }
  ];

  const filteredPrescriptions = prescriptions.filter(p => 
    p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 mt-2 text-foreground relative">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
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
        className="premium-card p-6"
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Patient Name or Prescription ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>
          <button className="px-4 py-2.5 bg-muted text-foreground font-semibold border border-border rounded-lg hover:bg-muted/80 transition-colors cursor-pointer text-sm">
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-sm bg-muted/20">
                <th className="py-3 font-semibold pl-4 rounded-tl-lg">Prescription ID</th>
                <th className="py-3 font-semibold">Patient</th>
                <th className="py-3 font-semibold">Doctor & Date</th>
                <th className="py-3 font-semibold">Status</th>
                <th className="py-3 font-semibold text-right pr-4 rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrescriptions.map((rx) => (
                <tr key={rx.id} className="border-b border-border hover:bg-muted/30 transition-colors group">
                  <td className="py-4 pl-4">
                    <span className="font-bold text-sm text-foreground">{rx.id}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{rx.items.length} Medicines</p>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
                        {rx.patientName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-semibold text-sm">{rx.patientName}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-sm font-medium block">{rx.doctorName}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock size={12} /> {rx.date}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold inline-flex ${
                      rx.status === 'Dispensed' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      {rx.status}
                    </span>
                  </td>
                  <td className="py-4 text-right pr-4">
                    <button 
                      onClick={() => setSelectedPrescription(rx)}
                      className="px-3 py-1.5 text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer border border-border hover:border-primary"
                    >
                      View <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPrescriptions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No prescriptions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                  <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <FileText className="text-primary" size={20} /> Prescription {selectedPrescription.id}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Issued on {selectedPrescription.date} at {selectedPrescription.time}</p>
                </div>
                <button 
                  onClick={() => setSelectedPrescription(null)}
                  className="p-2 bg-background border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {/* Doctor & Patient Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-background">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Patient</p>
                    <p className="font-bold text-foreground text-lg">{selectedPrescription.patientName}</p>
                    <Link href={`/dashboard/patients/${selectedPrescription.patientId}`}>
                      <span className="text-xs text-primary font-semibold hover:underline cursor-pointer">View Full Profile</span>
                    </Link>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-background">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Prescribed By</p>
                    <p className="font-bold text-foreground text-lg">{selectedPrescription.doctorName}</p>
                  </div>
                </div>

                {/* Medicines List */}
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Pill className="text-primary" size={18} /> Prescribed Medicines
                  </h3>
                  <div className="space-y-3">
                    {selectedPrescription.items.map((item: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-foreground flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs border border-border shrink-0">{idx + 1}</span>
                            {item.name}
                          </h4>
                          <div className="mt-2 space-y-1 pl-7">
                            <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Dosage:</span> {item.dosage}</p>
                            <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Duration:</span> {item.duration}</p>
                          </div>
                        </div>
                        <div className="bg-background border border-border px-4 py-2 rounded-lg flex flex-col justify-center items-center shrink-0 min-w-[100px]">
                          <span className="text-xs text-muted-foreground font-semibold uppercase">Qty</span>
                          <span className="font-bold text-xl text-primary">{item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedPrescription.notes && (
                  <div>
                    <h3 className="font-bold text-lg mb-3">General Notes</h3>
                    <div className="p-4 rounded-xl border border-border bg-amber-500/5 text-sm font-medium text-foreground">
                      {selectedPrescription.notes}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-border bg-muted/30 flex gap-3">
                <button className="flex-1 py-2.5 rounded-lg border border-border bg-background font-semibold shadow-sm hover:bg-muted transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm">
                  <Printer size={16} /> Print
                </button>
                <button className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm">
                  <Download size={16} /> Download PDF
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
