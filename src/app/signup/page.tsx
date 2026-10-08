"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Stethoscope, Building2, User, Mail, Lock, ArrowRight, Loader2, Sparkles, Database } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    orgName: "",
    address: "",
    doctorName: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/signup', formData);
      const { user, organization } = response.data;
      
      login(user, organization);
      toast.success("Welcome to Vaidya OS! Your isolated workspace is ready.");
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden selection:bg-emerald-500/20 selection:text-emerald-500">
      
      {/* Left side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-card to-background items-center justify-center p-12 border-r border-border/50">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-emerald-500/10 blur-[120px] mix-blend-screen animate-pulse duration-10000" />
        <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] rounded-full bg-blue-500/10 blur-[100px] mix-blend-screen" />
        
        <div className="relative z-10 w-full max-w-lg">
          <Link href="/" className="inline-flex flex-col mb-16 group">
            <span className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground group-hover:from-emerald-500 group-hover:to-blue-500 transition-all duration-500">
              Vaidya OS
            </span>
            <span className="text-[10px] font-bold text-muted-foreground tracking-widest mt-1 opacity-70 uppercase">powered by weblystics</span>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-6 uppercase tracking-wider">
              <Database size={14} /> Mathematical Isolation
            </div>
            <h1 className="text-5xl font-black tracking-tighter leading-[1.1] mb-6">
              A secure, isolated home for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">your patients.</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
              Every clinic gets an independently isolated database instance. Your patient records, inventory, and prescriptions are 100% private.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative z-10 bg-background/50 backdrop-blur-xl h-screen overflow-y-auto">
        <div className="w-full max-w-md my-auto pb-12">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-10 pt-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-sm">
               <Stethoscope size={32} />
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-2 text-foreground">Create Workspace</h2>
            <p className="text-muted-foreground font-medium">Join Vaidya OS today.</p>
          </div>

          <motion.form 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="hidden lg:flex w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 items-center justify-center mb-8 shadow-sm">
              <Stethoscope size={28} />
            </div>
            <h3 className="hidden lg:block text-2xl font-bold mb-8 tracking-tight text-foreground">Create your Workspace</h3>

            <div className="space-y-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Clinic Details</h3>
              
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-emerald-500 transition-colors">
                  <Building2 size={18} />
                </div>
                <input
                  type="text"
                  name="orgName"
                  required
                  value={formData.orgName}
                  onChange={handleChange}
                  placeholder="Clinic / Organization Name"
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium shadow-sm"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-emerald-500 transition-colors opacity-70">
                  <Building2 size={18} />
                </div>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Clinic Address (Optional)"
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-4 bg-card p-6 rounded-2xl border border-border shadow-sm mt-6">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Doctor Details</h3>
              
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-emerald-500 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="doctorName"
                  required
                  value={formData.doctorName}
                  onChange={handleChange}
                  placeholder="Doctor's Full Name"
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium shadow-sm"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-emerald-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium shadow-sm"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-emerald-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a Password"
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium shadow-sm"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-foreground text-background py-4 mt-8 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-foreground/10 hover:bg-emerald-500 hover:text-white hover:shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Creating Workspace...
                </>
              ) : (
                <>
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </motion.form>

          <p className="text-center text-sm font-medium text-muted-foreground mt-8">
            Already have a clinic workspace?{" "}
            <Link href="/login" className="text-foreground hover:text-emerald-500 hover:underline font-bold transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
