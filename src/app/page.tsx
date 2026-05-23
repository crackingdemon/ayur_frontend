"use client";

import { motion } from "framer-motion";
import { ArrowRight, Stethoscope, Users, Calendar, Activity } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 bg-background">
      {/* Refined subtle background gradients */}
      <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl text-center z-10 mt-20"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm font-medium mb-8 text-foreground shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          Vaidya Management Platform v2.0
        </motion.div>

        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-8 text-foreground">
          The Next-Generation <br className="hidden sm:block" />
          <span className="gradient-text">Clinic Experience</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Streamline appointments, manage inventory seamlessly, and provide world-class patient care with our all-in-one smart platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/login" className="w-full sm:w-auto">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-primary-foreground px-8 py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg"
            >
              Get Started <ArrowRight size={20} />
            </motion.button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-8 py-4 rounded-xl font-medium border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer shadow-sm"
            >
              View Dashboard
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Feature Cards Showcase */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-24 mb-20 max-w-5xl w-full z-10"
      >
        {[
          { icon: Calendar, title: "Smart Queues", desc: "Live waiting room and multi-channel booking." },
          { icon: Users, title: "Patient EMR", desc: "Complete medical history and vitals tracking." },
          { icon: Activity, title: "E-Prescriptions", desc: "Digital prescriptions linked to your inventory." },
          { icon: Stethoscope, title: "Multi-Tenant", desc: "Isolated workspaces for different clinics." },
        ].map((feature, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="premium-card p-6"
          >
            <div className="bg-muted w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-foreground border border-border">
              <feature.icon size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">{feature.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
