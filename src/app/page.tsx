"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Leaf, Activity, CalendarClock, Pill, ChevronRight, CheckCircle2, ShieldCheck, Sparkles, Database } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);
  
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-emerald-500/20 selection:text-emerald-500">
      
      {/* Ultra-Dynamic Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div style={{ y: y1 }} className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/10 blur-[120px] mix-blend-screen" />
        <motion.div style={{ y: y2 }} className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/10 blur-[120px] mix-blend-screen" />
        <div className="absolute top-[30%] left-[50%] w-[40vw] h-[40vw] rounded-full bg-amber-500/5 blur-[100px] mix-blend-screen animate-pulse duration-10000" />
      </div>

      {/* Glassmorphic Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-background/70 backdrop-blur-2xl border-b border-border/50 shadow-sm py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex flex-col items-start justify-center leading-none group cursor-pointer">
            <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground group-hover:from-emerald-500 group-hover:to-blue-500 transition-all duration-500">
              Vaidya OS
            </span>
            <span className="text-[10px] font-bold text-muted-foreground tracking-widest mt-1 opacity-70">powered by weblystics</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-emerald-500 transition-colors hidden sm:block">
              Doctor Login
            </Link>
            <Link href="/dashboard">
              <button className="px-6 py-2.5 rounded-xl bg-foreground text-background text-sm font-bold shadow-lg shadow-foreground/10 hover:shadow-emerald-500/20 hover:bg-emerald-500 hover:text-white hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex items-center gap-2">
                Launch App <ChevronRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-24">
        {/* Hero Section */}
        <section className="pt-24 pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-10 uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.1)] backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            The Definitive Ayurvedic OS <Sparkles size={14} />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[1.05] mb-8 max-w-5xl"
          >
            Master Your Clinic with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 block mt-2 pb-2">
              Ancient Wisdom & Modern Tech.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-12 font-medium leading-relaxed"
          >
            A world-class SaaS platform engineered exclusively for Vaidyas. Featuring dual-EMR charting, industry-grade Gantt timelines, and intelligent inventory dispensing.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link href="/signup" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_10px_40px_rgba(16,185,129,0.5)] hover:-translate-y-1 transition-all cursor-pointer">
                Start Your Workspace <ArrowRight size={18} />
              </button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/60 font-bold hover:bg-muted/80 hover:border-border transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm">
                Login to Dashboard
              </button>
            </Link>
          </motion.div>
        </section>

        {/* Bento Grid Features Showcase */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">Unrivaled Clinical Architecture.</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Not just another generic CRM. Vaidya OS is built from the ground up to solve the unique operational complexities of Ayurvedic clinics.</p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]"
          >
            {/* Bento Box 1: Dual Master EMRs (Large) */}
            <motion.div variants={itemVariants} className="md:col-span-2 md:row-span-2 premium-card p-10 flex flex-col justify-between group bg-gradient-to-br from-card to-emerald-500/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-emerald-500/20 transition-colors duration-700" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <Leaf size={28} />
                </div>
                <h3 className="text-3xl font-bold tracking-tight mb-4">Dual Master EMRs</h3>
                <p className="text-muted-foreground text-lg font-medium mb-8 leading-relaxed max-w-md">
                  Record modern clinical vitals alongside profound Ayurvedic assessments. Integrated Dashavidha and Ashtavidha Pariksha tracking right out of the box.
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 bg-background/50 backdrop-blur-sm p-3 rounded-xl border border-border/50 w-fit"><CheckCircle2 size={18} className="text-emerald-500" /> <span className="font-semibold text-sm">Dosha quantification algorithms</span></div>
                  <div className="flex items-center gap-3 bg-background/50 backdrop-blur-sm p-3 rounded-xl border border-border/50 w-fit"><CheckCircle2 size={18} className="text-emerald-500" /> <span className="font-semibold text-sm">Real-time pathya/apathya formulation</span></div>
                </div>
              </div>
            </motion.div>

            {/* Bento Box 2: Smart Gantt Hub */}
            <motion.div variants={itemVariants} className="premium-card p-8 flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] translate-y-1/3 translate-x-1/3 group-hover:bg-blue-500/20 transition-colors duration-700" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-5 group-hover:scale-110 -group-hover:rotate-3 transition-transform duration-500">
                  <CalendarClock size={24} />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2">Smart 24/7 Gantt Hub</h3>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                  Industry-grade timeline interface visually auto-resolves overlapping appointments.
                </p>
              </div>
            </motion.div>

            {/* Bento Box 3: POS & Dispensing */}
            <motion.div variants={itemVariants} className="premium-card p-8 flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute top-0 left-0 w-40 h-40 bg-amber-500/10 rounded-full blur-[60px] -translate-y-1/3 -translate-x-1/3 group-hover:bg-amber-500/20 transition-colors duration-700" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <Pill size={24} />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2">Pharmacy POS</h3>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                  One-click medicine dispensing securely deducts inventory and generates pristine invoices.
                </p>
              </div>
            </motion.div>

            {/* Bento Box 4: Architecture */}
            <motion.div variants={itemVariants} className="md:col-span-3 premium-card p-10 flex flex-col md:flex-row items-center justify-between group bg-gradient-to-r from-card via-card to-purple-500/5 relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
               <div className="relative z-10 max-w-2xl mb-8 md:mb-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center">
                    <Database size={20} />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">Isolated Database Tenancy</h3>
                </div>
                <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                  Every clinic gets a mathematically isolated PostgreSQL schema. Your patient records, inventory, and financial data are 100% private and protected by industry-leading encryption.
                </p>
               </div>
               <div className="relative z-10 flex gap-4">
                  <div className="flex flex-col items-center justify-center w-32 h-32 rounded-2xl bg-background border border-border shadow-sm">
                     <ShieldCheck size={32} className="text-emerald-500 mb-2" />
                     <span className="text-sm font-bold">HIPAA Ready</span>
                  </div>
                  <div className="flex flex-col items-center justify-center w-32 h-32 rounded-2xl bg-background border border-border shadow-sm">
                     <Activity size={32} className="text-blue-500 mb-2" />
                     <span className="text-sm font-bold">99.9% Uptime</span>
                  </div>
               </div>
            </motion.div>

          </motion.div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 pt-16 pb-8 bg-card/30 backdrop-blur-lg relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-2xl font-black tracking-tighter mb-1">Vaidya OS</span>
            <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">powered by weblystics</span>
          </div>
          <div className="text-sm text-muted-foreground font-medium flex gap-6">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            &copy; {new Date().getFullYear()} Weblystics. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
