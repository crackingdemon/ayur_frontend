"use client";

import { motion } from "framer-motion";
import { ArrowRight, Leaf, Activity, CalendarClock, Pill, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] rounded-full bg-amber-500/5 blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 w-full border-b border-border/50 bg-background/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex flex-col items-start justify-center leading-none">
            <span className="text-2xl font-black tracking-tighter">Vaidya OS</span>
            <span className="text-[10px] font-bold text-muted-foreground tracking-widest mt-1">powered by weblystics</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Doctor Login
            </Link>
            <Link href="/dashboard">
              <button className="px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-bold shadow-sm hover:scale-105 transition-transform cursor-pointer">
                Launch App
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold mb-8 uppercase tracking-wider"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            The Definitive Ayurvedic OS
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl sm:text-8xl font-black tracking-tighter leading-[1.1] mb-8 max-w-5xl"
          >
            Effortlessly Manage Your <br className="hidden lg:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">
              Ayurvedic Clinic
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-12 font-medium"
          >
            A world-class SaaS platform engineered exclusively for Vaidyas. Featuring dual-EMR charting, industry-grade Gantt timelines, and intelligent inventory dispensing.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link href="/dashboard" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all cursor-pointer">
                Enter Workspace <ArrowRight size={18} />
              </button>
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-card border border-border font-bold hover:bg-muted transition-colors cursor-pointer flex items-center justify-center gap-2">
              Book a Demo
            </button>
          </motion.div>
        </section>

        {/* Real Features Showcase */}
        <section className="py-24 px-6 max-w-7xl mx-auto border-t border-border/50">
          <div className="mb-16 text-center sm:text-left">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">Unrivaled Clinical Architecture.</h2>
            <p className="text-muted-foreground text-lg max-w-2xl">Not just another generic CRM. Vaidya OS is built from the ground up to solve the unique operational complexities of Ayurvedic clinics.</p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Feature 1 */}
            <motion.div variants={itemVariants} className="premium-card p-10 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Leaf size={28} />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-3">Dual Master EMRs</h3>
                <p className="text-muted-foreground font-medium mb-6 leading-relaxed">
                  Record modern clinical vitals alongside profound Ayurvedic assessments. Integrated Dashavidha and Ashtavidha Pariksha tracking right out of the box.
                </p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm font-semibold"><CheckCircle2 size={16} className="text-emerald-500" /> Dosha quantification algorithms</li>
                <li className="flex items-center gap-3 text-sm font-semibold"><CheckCircle2 size={16} className="text-emerald-500" /> Real-time pathya/apathya formulation</li>
              </ul>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={itemVariants} className="premium-card p-10 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CalendarClock size={28} />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-3">Smart 24/7 Gantt Hub</h3>
                <p className="text-muted-foreground font-medium mb-6 leading-relaxed">
                  An industry-grade timeline interface that visually auto-resolves overlapping appointments. Manage waiting rooms, consultations, and schedules with surgical precision.
                </p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm font-semibold"><CheckCircle2 size={16} className="text-blue-500" /> Overlap resolution engine</li>
                <li className="flex items-center gap-3 text-sm font-semibold"><CheckCircle2 size={16} className="text-blue-500" /> Floating portal tooltips</li>
              </ul>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={itemVariants} className="premium-card p-10 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Pill size={28} />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-3">Pharmacy POS & Dispensing</h3>
                <p className="text-muted-foreground font-medium mb-6 leading-relaxed">
                  Bridge the gap between prescription and checkout. One-click medicine dispensing securely deducts inventory and generates pristine financial invoices.
                </p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm font-semibold"><CheckCircle2 size={16} className="text-amber-500" /> Real-time stock auto-deduction</li>
                <li className="flex items-center gap-3 text-sm font-semibold"><CheckCircle2 size={16} className="text-amber-500" /> Custom un-inventoried pricing logic</li>
              </ul>
            </motion.div>

            {/* Feature 4 */}
            <motion.div variants={itemVariants} className="premium-card p-10 flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Activity size={28} />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-3">Chronological Patient Snapshots</h3>
                <p className="text-muted-foreground font-medium mb-6 leading-relaxed">
                  Never dig through files again. Patient overviews instantly render gorgeous historical snapshots of previous vitals, diagnosis, and prakruti evolution.
                </p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm font-semibold"><CheckCircle2 size={16} className="text-purple-500" /> Parallel database transaction saving</li>
                <li className="flex items-center gap-3 text-sm font-semibold"><CheckCircle2 size={16} className="text-purple-500" /> Master record extraction architecture</li>
              </ul>
            </motion.div>
          </motion.div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 text-center bg-muted/20">
        <div className="flex flex-col items-center justify-center">
          <span className="text-2xl font-black tracking-tighter mb-1">Vaidya OS</span>
          <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-6">powered by weblystics</span>
          <p className="text-sm text-muted-foreground font-medium">&copy; {new Date().getFullYear()} Weblystics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
