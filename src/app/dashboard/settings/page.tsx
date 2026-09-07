"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useFacilities } from "@/hooks/useFacilities";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, User, Mail, MapPin, ShieldCheck, CreditCard } from "lucide-react";
import { TeamManagement } from "./TeamManagement";

export default function SettingsPage() {
  const { user, organization } = useAuth();
  const { facilities, createFacility, switchFacility, isLoading } = useFacilities();
  const [activeFacilityId, setActiveFacilityId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setActiveFacilityId(localStorage.getItem('vaidyaos_facility'));
    }
  }, []);

  if (!user || !organization) {
    return null; // Layout handles loading state
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your clinic preferences and workspace.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Organization Profile */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 space-y-6"
        >
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border flex items-center gap-4 bg-muted/30">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Building2 size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{organization.name}</h2>
                <p className="text-sm text-muted-foreground">Workspace ID: <span className="font-mono text-xs">{organization.id.split('-')[0]}...</span></p>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Clinic Name</label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                    <Building2 size={16} className="text-muted-foreground" />
                    <span className="font-medium">{organization.name}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Address</label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                    <MapPin size={16} className="text-muted-foreground" />
                    <span className="font-medium">{organization.address || "No address provided"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border flex items-center gap-4 bg-muted/30">
              <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                <User size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Doctor Profile</h2>
                <p className="text-sm text-muted-foreground">Your personal account details</p>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                    <User size={16} className="text-muted-foreground" />
                    <span className="font-medium">{user.name}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                    <Mail size={16} className="text-muted-foreground" />
                    <span className="font-medium">{user.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm mt-6">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                  <Building2 size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Clinics & Branches</h2>
                  <p className="text-sm text-muted-foreground">Manage your multiple facilities</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  const name = prompt("Enter new clinic name (e.g. Ayurveda Panchakarma Center):");
                  if (name) {
                    createFacility({ name });
                  }
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm"
              >
                + Add Branch
              </button>
            </div>
            
            <div className="p-0 divide-y divide-border">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading branches...</div>
              ) : facilities.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No additional branches found.</div>
              ) : (
                facilities.map((fac: any) => (
                  <div key={fac.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div>
                      <h4 className="font-bold text-lg">{fac.name}</h4>
                      <p className="text-sm text-muted-foreground">{fac.type || 'Clinic'}</p>
                    </div>
                    {fac.id === activeFacilityId ? (
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase rounded-full">
                        Active Context
                      </span>
                    ) : (
                      <button 
                        onClick={() => switchFacility(fac.id)}
                        className="px-4 py-2 border border-border hover:bg-muted rounded-lg text-sm font-medium transition-colors"
                      >
                        Switch To Branch
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <TeamManagement />
        </motion.div>

        {/* Sidebar Cards */}
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="text-primary" size={24} />
              <h3 className="font-bold text-lg text-primary">Security Status</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Your clinic is currently utilizing mathematically isolated schemas. Patient data is encrypted and separated.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Isolated Workspace Active
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="text-foreground" size={20} />
              <h3 className="font-bold text-lg">Subscription</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              You are on the <strong>Early Access</strong> plan.
            </p>
            <button className="w-full py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm font-medium transition-colors border border-border">
              Manage Billing
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
