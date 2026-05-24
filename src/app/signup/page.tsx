"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Stethoscope, Building2, User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
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
      const { token, user, organization } = response.data;
      
      login(token, user, organization);
      toast.success("Welcome to Vaidya OS! Your isolated workspace is ready.");
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary border border-primary/20"
            >
              <Stethoscope size={32} />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Create your Workspace</h1>
            <p className="text-muted-foreground text-sm font-medium">Join Vaidya OS and modernize your practice today.</p>
          </div>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
            onSubmit={handleSubmit}
          >
            <div className="space-y-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Clinic Details</h3>
              
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  name="orgName"
                  required
                  value={formData.orgName}
                  onChange={handleChange}
                  placeholder="Clinic / Organization Name"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm font-medium"
                />
              </div>

              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-5 w-5 text-muted-foreground opacity-50" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Clinic Address (Optional)"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-4 bg-card p-6 rounded-2xl border border-border shadow-sm mt-6">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Doctor Details</h3>
              
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  name="doctorName"
                  required
                  value={formData.doctorName}
                  onChange={handleChange}
                  placeholder="Doctor's Full Name"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm font-medium"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm font-medium"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a Password"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-8"
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
            </button>
          </motion.form>

          <p className="text-center text-sm font-medium text-muted-foreground mt-8">
            Already have a clinic workspace?{" "}
            <Link href="/login" className="text-primary hover:underline font-bold">
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Image/Branding */}
      <div className="hidden lg:flex flex-1 relative bg-muted items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-emerald-500/10 to-blue-500/10" />
        <div className="absolute w-[40vw] h-[40vw] bg-primary/20 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        
        <div className="relative z-10 text-center px-12">
          <h2 className="text-4xl font-black tracking-tight mb-4 text-foreground">
            A secure, isolated home <br/> for your patients.
          </h2>
          <p className="text-lg text-muted-foreground font-medium max-w-md mx-auto">
            Every clinic gets a mathematically isolated database instance. Your patient records, inventory, and prescriptions are 100% private.
          </p>
        </div>
      </div>
    </div>
  );
}
