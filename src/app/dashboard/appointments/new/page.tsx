"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Search, Phone, Calendar as CalendarIcon, Clock, AlignLeft, CheckCircle, Loader2, X, Building2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { usePatients, PatientSummary } from "@/hooks/usePatients";
import { useDoctors } from "@/hooks/useDoctors";
import { useFacilities } from "@/hooks/useFacilities";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";

const bookingSchema = z.object({
  patientId: z.string().optional(),
  name: z.string().optional(),
  age: z.coerce.number().optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  duration: z.coerce.number().positive(),
  facilityId: z.string().min(1, "Branch is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  reason: z.string().min(1, "Reason is required"),
  source: z.string().min(1, "Source is required"),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function NewAppointment() {
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  
  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { patients, isLoading: isSearching } = usePatients(debouncedSearch);
  const [selectedPatient, setSelectedPatient] = useState<PatientSummary | null>(null);

  const { doctors, isLoading: isDoctorsLoading } = useDoctors();
  const { facilities, isLoading: isFacilitiesLoading } = useFacilities();
  const [activeFacilityId, setActiveFacilityId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setActiveFacilityId(localStorage.getItem('vaidyaos_facility') || 'all');
    }
  }, []);



  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Form State
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  const [isNewPatient, setIsNewPatient] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      patientId: "",
      name: "",
      age: undefined,
      gender: "Male",
      phone: "",
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`,
      duration: 30,
      reason: "",
      source: "call",
      doctorId: "",
      facilityId: ""
    }
  });

  // Watch the selected facility in the form to filter doctors
  const selectedFacilityId = watch('facilityId');

  // Set initial facilityId to active context if not set
  useEffect(() => {
    if (activeFacilityId && activeFacilityId !== 'all' && !watch('facilityId')) {
      setValue('facilityId', activeFacilityId);
    }
  }, [activeFacilityId, setValue, watch]);

  // Filter doctors by the currently selected facility IN THE FORM
  const filteredDoctors = useMemo(() => {
    if (!selectedFacilityId || selectedFacilityId === 'all') return doctors;
    return doctors.filter((doc: any) => 
      doc.facilityAccess?.some((fa: any) => fa.facilityId === selectedFacilityId)
    );
  }, [doctors, selectedFacilityId]);

  // Set default doctor when doctors load
  useEffect(() => {
    if (filteredDoctors.length > 0 && !watch('doctorId')) {
      setValue('doctorId', filteredDoctors[0].id);
    }
  }, [filteredDoctors, setValue, watch]);

  const durationVal = watch('duration');

  const onSubmit = async (data: BookingFormValues) => {
    if (isNewPatient && (!data.name || !data.phone || !data.age)) {
      toast.error("Please fill all required new patient details");
      return;
    }

    if (!isNewPatient && !data.patientId) {
      toast.error("Please search and select an existing patient");
      return;
    }
    
    try {
      const localDateTime = new Date(`${data.date}T${data.time}`);
      
      const payload = {
        isNewPatient,
        patientId: isNewPatient ? undefined : data.patientId,
        name: data.name,
        age: data.age,
        gender: data.gender,
        phone: data.phone,
        date: localDateTime.toISOString(),
        time: data.time,
        duration: data.duration,
        doctorId: data.doctorId,
        facilityId: data.facilityId,
        reason: data.reason,
        source: data.source
      };

      await api.post('/appointments', payload);
      toast.success("Appointment booked successfully!");
      router.push('/dashboard/appointments');
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to book appointment");
    }
  };

  return (
    <div className="space-y-6 mt-2 text-foreground max-w-3xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link href="/dashboard/appointments" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-4 cursor-pointer">
          <ArrowLeft size={16} /> Back to Hub
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Manual Booking</h1>
        <p className="text-muted-foreground text-sm font-medium mt-1">Quickly schedule an appointment for a walk-in or call-in patient.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="premium-card p-6 sm:p-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Section 1: Patient Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs border border-primary/20">1</span>
                Patient Details
              </h3>
              <div className="flex bg-muted rounded-lg p-1">
                <button 
                  type="button"
                  onClick={() => setIsNewPatient(false)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${!isNewPatient ? 'bg-card shadow-sm text-foreground border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Existing
                </button>
                <button 
                  type="button"
                  onClick={() => setIsNewPatient(true)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${isNewPatient ? 'bg-card shadow-sm text-foreground border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  New Patient
                </button>
              </div>
            </div>

            {!isNewPatient ? (
              <div className="space-y-4">
                {selectedPatient ? (
                  <div className="relative overflow-hidden premium-card p-5 border border-primary/20 bg-primary/5 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-lg text-primary shadow-inner">
                        {selectedPatient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{selectedPatient.name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><Phone size={14} /> {selectedPatient.phone}</span>
                          <span className="w-1 h-1 rounded-full bg-border"></span>
                          <span>{selectedPatient.age} yrs, {selectedPatient.gender}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        setSelectedPatient(null);
                        setValue("patientId", "");
                      }}
                      className="p-2 bg-background border border-border text-muted-foreground hover:text-red-500 hover:border-red-200 rounded-lg transition-colors shadow-sm cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    </div>
                    <input 
                      type="text" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                      placeholder="Search by name, phone..."
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    />
                    {searchFocused && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-xl shadow-lg p-2 z-20 max-h-60 overflow-y-auto">
                        {patients.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            {isSearching ? "Searching..." : "No patients found. Try a different search term or add a new patient."}
                          </div>
                        ) : (
                          patients.map((patient, index) => (
                            <div 
                              key={patient.id || `patient-${index}`}
                              className="p-3 hover:bg-muted rounded-lg cursor-pointer flex justify-between items-center transition-colors mb-1 border border-transparent hover:border-border"
                              onMouseDown={() => {
                                setSelectedPatient(patient);
                                setValue("patientId", patient.id);
                                setValue("name", patient.name);
                                setValue("phone", patient.phone);
                                setValue("age", patient.age);
                                setValue("gender", patient.gender);
                                setSearchFocused(false);
                                setSearchTerm("");
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">
                                  {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-sm">{patient.name}</p>
                                  <p className="text-xs text-muted-foreground">{patient.phone}</p>
                                </div>
                              </div>
                              {patient.visits?.length > 0 && (
                                <span className="text-[10px] bg-muted px-2 py-1 rounded font-semibold border border-border">
                                  Last visit: {new Date(patient.visits[0].date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <User size={18} />
                    </div>
                    <input 
                      type="text"
                      {...register('name')}
                      className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <Phone size={18} />
                    </div>
                    <input 
                      type="tel"
                      {...register('phone')}
                      className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Age</label>
                  <input 
                    type="number" min="1"
                    {...register('age')}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    placeholder="e.g. 34"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Gender</label>
                  <select 
                    {...register('gender')}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium outline-none appearance-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Appointment Logistics */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 border-b border-border pb-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs border border-primary/20">2</span>
              Schedule & Logistics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <CalendarIcon size={18} />
                  </div>
                  <input 
                    type="date"
                    {...register('date')}
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                  />
                </div>
                {errors.date && <p className="text-red-500 text-xs">{errors.date.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Clock size={18} />
                  </div>
                  <input 
                    type="time"
                    {...register('time')}
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                  />
                </div>
                {errors.time && <p className="text-red-500 text-xs">{errors.time.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold flex justify-between">
                  Duration <span className="text-primary">{durationVal}m</span>
                </label>
                <select 
                  {...register('duration')}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium outline-none appearance-none"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
                {errors.duration && <p className="text-red-500 text-xs">{errors.duration.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Select Branch</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Building2 size={18} />
                  </div>
                  <select 
                    {...register('facilityId')}
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium outline-none appearance-none"
                    disabled={isFacilitiesLoading || facilities.length === 0}
                  >
                    <option value="" disabled>Select Branch...</option>
                    {facilities.map((fac: any) => (
                      <option key={fac.id} value={fac.id}>{fac.name}</option>
                    ))}
                  </select>
                </div>
                {errors.facilityId && <p className="text-red-500 text-xs">{errors.facilityId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Assign to Doctor</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <User size={18} />
                  </div>
                  <select 
                    {...register('doctorId')}
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium outline-none appearance-none"
                    disabled={isDoctorsLoading || filteredDoctors.length === 0}
                  >
                    <option value="" disabled>Select Doctor...</option>
                    {filteredDoctors.map((doc: any) => (
                      <option key={doc.id} value={doc.id}>{doc.name}</option>
                    ))}
                  </select>
                </div>
                {errors.doctorId && <p className="text-red-500 text-xs">{errors.doctorId.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Reason for Visit</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <AlignLeft size={18} />
                  </div>
                  <input 
                    type="text"
                    {...register('reason')}
                    placeholder="e.g. Back pain consultation"
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                  />
                </div>
                {errors.reason && <p className="text-red-500 text-xs">{errors.reason.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Source</label>
                <select 
                  {...register('source')}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium outline-none appearance-none"
                >
                  <option value="walk-in">Walk-in</option>
                  <option value="call">Phone Call</option>
                  <option value="manual-online">Manual Online Booking</option>
                </select>
                {errors.source && <p className="text-red-500 text-xs">{errors.source.message}</p>}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Button 
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              isLoading={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {!isSubmitting && <CheckCircle size={18} />}
              Confirm Booking
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
