"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, User, Phone, CheckCircle } from "lucide-react";

export default function PublicBookingPage({ params }: { params: { org_slug: string } }) {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
  });

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 text-foreground">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="premium-card p-8 rounded-2xl text-center max-w-md w-full"
        >
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2 tracking-tight">Appointment Confirmed!</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            We have received your appointment request for <span className="font-semibold text-foreground">{formData.date}</span> at <span className="font-semibold text-foreground">{formData.time}</span>. We will send you a reminder via WhatsApp shortly.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            Book Another
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden text-foreground">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-96 bg-accent/5 blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card w-full max-w-md p-8 sm:p-10 z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4 text-foreground font-bold text-2xl border border-border">
            {params.org_slug.substring(0, 1).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold mb-2 capitalize tracking-tight">{params.org_slug.replace('-', ' ')} Clinic</h2>
          <p className="text-muted-foreground text-sm">Book your consultation online</p>
        </div>

        <form onSubmit={handleBook} className="space-y-6">
          {step === 1 ? (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
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
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Preferred Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <CalendarIcon size={18} />
                  </div>
                  <input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Preferred Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Clock size={18} />
                  </div>
                  <input 
                    type="time" 
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div className="pt-2 flex gap-3">
            {step === 2 && (
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="w-full bg-card border border-border py-2.5 rounded-lg font-semibold hover:bg-muted transition-colors cursor-pointer"
              >
                Back
              </button>
            )}
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              {step === 1 ? "Next Step" : "Confirm Booking"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
