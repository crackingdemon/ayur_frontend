"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, User, Phone, Calendar, Activity, Pill, ChevronRight, FileText, Leaf, Stethoscope, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { usePatient, usePatientHistory } from "@/hooks/usePatient";
import { usePanchakarma } from "@/hooks/usePanchakarma";
import { toast } from "sonner";
import { format } from "date-fns";

export default function PatientProfile() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const { patient, isLoading, error, updateModernEMR, updateAyurvedicEMR, updateDiagnosis, updatePatientInfo } = usePatient(params.id as string);
  
  const [historyPage, setHistoryPage] = useState(1);
  const { history, meta: historyMeta, isLoading: isHistoryLoading } = usePatientHistory(params.id as string, historyPage, 5);
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);

  const { treatments: pkTreatments, isLoading: isPkLoading } = usePanchakarma({ patientId: params.id as string });

  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)] text-red-500">
        Error loading patient profile: {error || 'Patient not found'}
      </div>
    );
  }

  const visits = patient.visits || [];
  const latestVisit = visits[0] || {};
  const modern = latestVisit.modernEMR || {};
  const ayurvedic = latestVisit.ayurvedicEMR || {};
  const diagnosis = latestVisit.diagnosis || {};

  const handleSaveModern = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!latestVisit.id) {
      toast.error('No visit selected to update');
      return;
    }
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Split the data!
    const patientData = {
      pastHistory: data.pastHistory,
      drugHistory: data.drugHistory
    };
    
    // Remove patient fields from EMR payload
    delete data.pastHistory;
    delete data.drugHistory;

    try {
      await Promise.all([
        updatePatientInfo(patientData),
        updateModernEMR(latestVisit.id, data)
      ]);
      toast.success('Modern EMR & Patient Info saved successfully!');
    } catch (error) {
      toast.error('Failed to save Modern EMR');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAyurvedic = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!latestVisit.id) {
      toast.error('No visit selected to update');
      return;
    }
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const data: Record<string, any> = Object.fromEntries(formData.entries());
    // Convert numeric fields back to numbers for Prisma
    if (data.vata) data.vata = Number(data.vata);
    if (data.pitta) data.pitta = Number(data.pitta);
    if (data.kapha) data.kapha = Number(data.kapha);
    try {
      await updateAyurvedicEMR(latestVisit.id, data);
      toast.success('Ayurvedic EMR saved successfully!');
    } catch (error) {
      toast.error('Failed to save Ayurvedic EMR');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDiagnosis = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!latestVisit.id) {
      toast.error('No visit selected to update');
      return;
    }
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    try {
      await updateDiagnosis(latestVisit.id, data);
      toast.success('Diagnosis saved successfully!');
    } catch (error) {
      toast.error('Failed to save Diagnosis');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview & Visits", icon: User },
    { id: "modern", label: "Modern EMR", icon: Activity },
    { id: "ayurvedic", label: "Ayurvedic EMR", icon: Leaf },
    { id: "diagnosis", label: "Diagnosis Plan", icon: Stethoscope },
    { id: "panchakarma", label: "Panchakarma", icon: Activity },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] mt-2 text-foreground">
      {/* Header */}
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <Link href="/dashboard/patients" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-4 cursor-pointer">
            <ArrowLeft size={16} /> Back to Directory
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-2xl shadow-sm">
              {patient.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{patient.name}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 font-medium">
                <span>PT-{String(patient.id).substring(0, 4).toUpperCase()}</span>
                <span>•</span>
                <span>{patient.age} Yrs, {patient.gender}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Phone size={12} /> {patient.phone}</span>
                <span>•</span>
                <span className="text-red-500 font-bold flex items-center gap-1">Blood: {patient.bloodGroup || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/patients/${patient.id}/prescribe`}>
            <button className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
              <Pill size={16} /> Prescribe
            </button>
          </Link>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Left Sidebar Tabs */}
        <div className="w-64 shrink-0 flex flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold transition-all cursor-pointer border ${
                  isActive 
                    ? 'bg-primary text-primary-foreground border-primary shadow-md translate-x-1' 
                    : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 premium-card overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-8">
            <AnimatePresence mode="wait">
              
              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8 max-w-4xl"
                >
                  <div>
                    <h2 className="text-2xl font-bold border-b border-border pb-2 mb-6">Patient Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-xl">
                        <h3 className="font-bold text-red-600 dark:text-red-400 mb-2 uppercase text-sm tracking-wider">Allergies</h3>
                        <p className="font-medium">{patient.allergies || 'No known allergies'}</p>
                      </div>
                      <div className="p-6 bg-muted/30 border border-border rounded-xl">
                        <h3 className="font-bold text-muted-foreground mb-2 uppercase text-sm tracking-wider">Quick Note</h3>
                        <p className="font-medium text-sm">Patient needs regular follow-up.</p>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Calendar size={18} className="text-primary" /> Consultation History
                    </h3>
                    <div className="border border-border rounded-xl overflow-hidden mb-4">
                      {isHistoryLoading ? (
                        <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                      ) : history.length === 0 ? (
                        <div className="p-6 text-center text-muted-foreground">No past visits recorded.</div>
                      ) : history.map((visit: any, i: number) => {
                        const isExpanded = expandedVisitId === visit.id;
                        return (
                          <div key={visit.id} className={`flex flex-col hover:bg-muted/30 transition-colors ${i !== history.length - 1 ? 'border-b border-border' : ''}`}>
                            <div className="p-6 flex items-start gap-4 cursor-pointer" onClick={() => setExpandedVisitId(isExpanded ? null : visit.id)}>
                              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border shrink-0 mt-1">
                                <FileText size={16} className="text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-bold text-base">{visit.reason}</h4>
                                    <p className="text-sm text-muted-foreground font-medium mt-0.5">Consulted {visit.doctor}</p>
                                  </div>
                                  <span className="text-xs font-bold bg-muted px-2.5 py-1 rounded-md text-foreground border border-border">
                                    {new Date(visit.date).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Expanded Content */}
                            {isExpanded && (
                              <div className="px-6 pb-6 pt-2 border-t border-border/50 bg-muted/10">
                                {visit.modernEMR && (visit.modernEMR.bp || visit.modernEMR.pulse || visit.modernEMR.temp) && (
                                  <div className="mb-4 flex gap-4 text-sm bg-background p-3 rounded-lg border border-border">
                                    {visit.modernEMR.bp && <span className="font-medium"><strong className="text-muted-foreground mr-1">BP:</strong> {visit.modernEMR.bp}</span>}
                                    {visit.modernEMR.pulse && <span className="font-medium"><strong className="text-muted-foreground mr-1">Pulse:</strong> {visit.modernEMR.pulse}</span>}
                                    {visit.modernEMR.temp && <span className="font-medium"><strong className="text-muted-foreground mr-1">Temp:</strong> {visit.modernEMR.temp}</span>}
                                  </div>
                                )}
                                
                                {visit.ayurvedicEMR && (visit.ayurvedicEMR.prakruti || visit.ayurvedicEMR.vikruti) && (
                                  <div className="mb-4 flex gap-4 text-sm bg-background p-3 rounded-lg border border-border">
                                    {visit.ayurvedicEMR.prakruti && <span className="font-medium"><strong className="text-muted-foreground mr-1">Prakruti:</strong> {visit.ayurvedicEMR.prakruti}</span>}
                                    {visit.ayurvedicEMR.vikruti && <span className="font-medium"><strong className="text-muted-foreground mr-1">Vikruti:</strong> {visit.ayurvedicEMR.vikruti}</span>}
                                  </div>
                                )}

                                {visit.diagnosis?.ayurvedicDiagnosis && (
                                  <div className="mb-4">
                                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Diagnosis</h5>
                                    <p className="text-sm font-medium text-foreground">{visit.diagnosis.ayurvedicDiagnosis}</p>
                                  </div>
                                )}
                                
                                {visit.prescription ? (
                                    <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
                                      <div className="bg-primary/5 px-4 py-3 border-b border-border font-bold text-primary flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <Pill size={14} /> Issued Prescription
                                        </div>
                                        <Link href={`/dashboard/patients/${patient.id}/prescribe`}>
                                          <button className="text-xs font-bold px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:shadow-md transition-all cursor-pointer">
                                            Edit / Print
                                          </button>
                                        </Link>
                                      </div>
                                      <div className="p-4">
                                      {visit.prescription.items?.length > 0 && (
                                        <table className="w-full text-left text-sm whitespace-nowrap mb-4">
                                          <thead className="text-xs text-muted-foreground uppercase">
                                            <tr>
                                              <th className="pb-2 font-semibold">Medicine</th>
                                              <th className="pb-2 font-semibold">Dosage</th>
                                              <th className="pb-2 font-semibold">Duration</th>
                                              <th className="pb-2 font-semibold">Anupana</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-border">
                                            {visit.prescription.items.map((item: any) => (
                                              <tr key={item.id}>
                                                <td className="py-2 font-semibold">{item.inventory?.name || item.customMedicineName}</td>
                                                <td className="py-2">{item.dosage}</td>
                                                <td className="py-2">{item.duration}</td>
                                                <td className="py-2 text-muted-foreground">{item.anupana}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      )}
                                      
                                      {(visit.prescription.pathya || visit.prescription.apathya) && (
                                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm border-t border-border pt-4">
                                          {visit.prescription.pathya && (
                                            <div>
                                              <strong className="text-emerald-600 block mb-1 uppercase text-[10px] tracking-wider">Pathya</strong>
                                              <p className="font-medium text-muted-foreground">{visit.prescription.pathya}</p>
                                            </div>
                                          )}
                                          {visit.prescription.apathya && (
                                            <div>
                                              <strong className="text-red-600 block mb-1 uppercase text-[10px] tracking-wider">Apathya</strong>
                                              <p className="font-medium text-muted-foreground">{visit.prescription.apathya}</p>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm font-medium text-muted-foreground italic mt-4 bg-muted/50 px-4 py-2 rounded-lg inline-block">
                                    No prescription issued during this visit.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Pagination Controls */}
                    {historyMeta.totalPages > 1 && (
                      <div className="flex gap-2 justify-end mb-8">
                        <button 
                          disabled={historyPage === 1}
                          onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                          className="px-3 py-1.5 rounded border border-border bg-card text-sm font-semibold disabled:opacity-50 hover:bg-muted transition-colors cursor-pointer"
                        >
                          Prev
                        </button>
                        <div className="px-3 py-1.5 text-sm font-bold border border-border rounded bg-muted">
                          {historyPage} / {historyMeta.totalPages}
                        </div>
                        <button 
                          disabled={historyPage === historyMeta.totalPages}
                          onClick={() => setHistoryPage(p => Math.min(historyMeta.totalPages, p + 1))}
                          className="px-3 py-1.5 rounded border border-border bg-card text-sm font-semibold disabled:opacity-50 hover:bg-muted transition-colors cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* MODERN TAB */}
              {activeTab === "modern" && (
                <motion.form
                  onSubmit={handleSaveModern}
                  key="modern"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8 max-w-4xl"
                >
                  <div className="flex justify-between items-center border-b border-border pb-2 mb-6">
                    <h2 className="text-2xl font-bold">Modern Master EMR</h2>
                    <button type="submit" disabled={isSaving} className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer disabled:opacity-50">
                      {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14}/>} Save Updates
                    </button>
                  </div>
                  <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Chief Complaints (with duration)</label>
                        <textarea name="chiefComplaints" defaultValue={modern.chiefComplaints} className="w-full h-24 p-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">History of Present Illness</label>
                        <textarea name="hpi" defaultValue={modern.hpi} className="w-full h-24 p-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Past History</label>
                          <textarea name="pastHistory" defaultValue={patient.pastHistory || ''} className="w-full h-20 p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 resize-none text-sm" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Drug & Allergy History</label>
                          <textarea name="drugHistory" defaultValue={patient.drugHistory || ''} className="w-full h-20 p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 resize-none text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Latest Vitals</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-1"><span className="text-xs font-semibold">Pulse</span><input name="pulse" type="text" defaultValue={modern.pulse} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm" /></div>
                          <div className="space-y-1"><span className="text-xs font-semibold">BP</span><input name="bp" type="text" defaultValue={modern.bp} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm" /></div>
                          <div className="space-y-1"><span className="text-xs font-semibold">Temp</span><input name="temp" type="text" defaultValue={modern.temp} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm" /></div>
                          <div className="space-y-1"><span className="text-xs font-semibold">Systemic Exam</span><input name="systemicExam" type="text" defaultValue={modern.systemicExam} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm" /></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Investigations</label>
                        <textarea name="investigations" defaultValue={modern.investigations} className="w-full h-24 p-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 resize-none" />
                      </div>
                  </div>
                </motion.form>
              )}

              {/* AYURVEDIC TAB */}
              {activeTab === "ayurvedic" && (
                <motion.form
                  onSubmit={handleSaveAyurvedic}
                  key="ayurvedic"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8 max-w-4xl"
                >
                  <div className="flex justify-between items-center border-b border-border pb-2 mb-6">
                    <h2 className="text-2xl font-bold">Ayurvedic Master EMR</h2>
                    <button type="submit" disabled={isSaving} className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer disabled:opacity-50">
                      {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14}/>} Save Updates
                    </button>
                  </div>
                    
                    {/* Dosha Assessment */}
                    <div className="mb-8 p-6 bg-muted/20 border border-border rounded-2xl">
                      <h3 className="font-bold text-lg mb-4">Dosha Assessment</h3>
                      <div className="space-y-6">
                        {['vata', 'pitta', 'kapha'].map((dosha) => (
                          <div key={dosha} className="flex items-center gap-4">
                            <label className="w-16 font-bold uppercase text-sm">{dosha}</label>
                            <input name={dosha} type="range" min="0" max="100" defaultValue={ayurvedic[dosha] || 0} className="flex-1 accent-primary" />
                            <span className="w-12 text-right font-bold text-primary">{ayurvedic[dosha] || 0}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Dashavidha Pariksha */}
                      <div className="space-y-4">
                        <h3 className="font-bold text-lg border-b border-border pb-2">Dashavidha Pariksha</h3>
                        {[
                          { key: 'prakruti', label: 'Prakruti', options: ['Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Pitta-Kapha', 'Vata-Kapha', 'Tridoshaja'] },
                          { key: 'vikruti', label: 'Vikruti', type: 'text' },
                          { key: 'sara', label: 'Sara', type: 'text' },
                          { key: 'samhanana', label: 'Samhanana', options: ['Pravara', 'Madhyama', 'Avara'] },
                          { key: 'satva', label: 'Satva', options: ['Pravara', 'Madhyama', 'Avara'] },
                        ].map(field => (
                          <div key={field.key} className="flex flex-col space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">{field.label}</label>
                            {field.options ? (
                              <select name={field.key} defaultValue={ayurvedic[field.key] || ""} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm outline-none">
                                <option value="">Select...</option>
                                {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            ) : (
                              <input name={field.key} type="text" defaultValue={ayurvedic[field.key] || ""} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm outline-none" />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Ashtavidha Pariksha */}
                      <div className="space-y-4">
                        <h3 className="font-bold text-lg border-b border-border pb-2">Ashtavidha Pariksha</h3>
                        {[
                          { key: 'nadi', label: 'Nadi (Pulse)' },
                          { key: 'mootra', label: 'Mootra (Urine)' },
                          { key: 'mala', label: 'Mala (Stool)' },
                          { key: 'jihva', label: 'Jihva (Tongue)' },
                        ].map(field => (
                          <div key={field.key} className="flex flex-col space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">{field.label}</label>
                            <input name={field.key} type="text" defaultValue={ayurvedic[field.key] || ""} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm outline-none" />
                          </div>
                        ))}
                        <div className="pt-4 space-y-4">
                          <div className="flex flex-col space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Agni & Ama</label>
                            <div className="flex gap-2">
                              <select name="agni" defaultValue={ayurvedic.agni || ""} className="flex-1 p-2.5 bg-background border border-border rounded-lg text-sm outline-none">
                                <option value="Sama">Samagni</option>
                                <option value="Vishama">Vishamagni</option>
                                <option value="Tikshna">Tikshnagni</option>
                                <option value="Manda">Mandagni</option>
                              </select>
                              <select name="ama" defaultValue={ayurvedic.ama || ""} className="flex-1 p-2.5 bg-background border border-border rounded-lg text-sm outline-none">
                                <option value="Nirama">Nirama</option>
                                <option value="Sama">Sama (with Ama)</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Kostha</label>
                            <select name="kostha" defaultValue={ayurvedic.kostha || ""} className="w-full p-2.5 bg-background border border-border rounded-lg text-sm outline-none">
                              <option value="Madhyama">Madhyama</option>
                              <option value="Krura">Krura</option>
                              <option value="Mridu">Mridu</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                </motion.form>
              )}

              {/* DIAGNOSIS TAB */}
              {activeTab === "diagnosis" && (
                <motion.form
                  onSubmit={handleSaveDiagnosis}
                  key="diagnosis"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8 max-w-4xl"
                >
                  <div className="flex justify-between items-center border-b border-border pb-2 mb-6">
                    <h2 className="text-2xl font-bold">Diagnosis & Treatment Plan</h2>
                    <button type="submit" disabled={isSaving} className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer disabled:opacity-50">
                      {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14}/>} Save Updates
                    </button>
                  </div>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Provisional Diagnosis (Modern)</label>
                          <textarea name="provisional" defaultValue={diagnosis.provisional} className="w-full h-24 p-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 resize-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Ayurvedic Diagnosis</label>
                          <textarea name="ayurvedicDiagnosis" defaultValue={diagnosis.ayurvedicDiagnosis} className="w-full h-24 p-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 resize-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Samprapti (Pathogenesis)</label>
                        <textarea name="samprapti" defaultValue={diagnosis.samprapti} className="w-full h-32 p-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 resize-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          Chikitsa Siddhanta (Line of Treatment)
                        </label>
                        <textarea name="chikitsa" defaultValue={diagnosis.chikitsa} className="w-full h-40 p-4 bg-background border border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none text-emerald-900 dark:text-emerald-100 bg-emerald-50/30 dark:bg-emerald-950/20" />
                      </div>
                    </div>
                </motion.form>
              )}

              {/* PANCHAKARMA TAB */}
              {activeTab === "panchakarma" && (
                <motion.div
                  key="panchakarma"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 max-w-4xl"
                >
                  <h2 className="text-2xl font-bold border-b border-border pb-2 mb-6 flex justify-between items-center">
                    Panchakarma History
                  </h2>
                  
                  {isPkLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                  ) : pkTreatments.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card/50">
                      <Activity className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                      <h3 className="text-lg font-semibold text-foreground">No Panchakarma Treatments</h3>
                      <p className="text-sm text-muted-foreground mt-1">Prescribe a treatment from the Prescribe flow.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {pkTreatments.map(treatment => {
                        const completed = treatment.days.filter(d => d.status === 'Completed').length;
                        return (
                          <div key={treatment.id} className="p-6 border border-border rounded-2xl bg-card">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-bold text-lg text-foreground">{treatment.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {treatment.startDate ? format(new Date(treatment.startDate), 'MMM d, yyyy') : 'No Date'} • {treatment.totalDays} Days
                                </p>
                              </div>
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                                treatment.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {treatment.status}
                              </span>
                            </div>
                            
                            <div className="mb-4">
                              <div className="flex justify-between text-xs font-medium mb-1">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="text-foreground">{completed}/{treatment.totalDays} Days Completed</span>
                              </div>
                              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-primary h-full rounded-full transition-all duration-500"
                                  style={{ width: `${Math.round((completed / treatment.totalDays) * 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
