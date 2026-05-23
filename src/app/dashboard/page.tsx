"use client";

import { motion } from "framer-motion";
import { Users, IndianRupee, TrendingUp, Calendar as CalendarIcon, Clock, ArrowUpRight, ArrowDownRight, MoreHorizontal } from "lucide-react";

export default function DashboardOverview() {
  const stats = [
    { 
      title: "Today's Appointments", 
      value: "24", 
      icon: CalendarIcon, 
      trend: "+12%", 
      isPositive: true,
      description: "vs last Tuesday",
      chartData: [40, 30, 50, 40, 70, 60, 85]
    },
    { 
      title: "Total Patients", 
      value: "1,204", 
      icon: Users, 
      trend: "+4%", 
      isPositive: true,
      description: "vs last month",
      chartData: [20, 30, 25, 40, 45, 60, 75]
    },
    { 
      title: "Revenue (Today)", 
      value: "₹12,450", 
      icon: IndianRupee, 
      trend: "+23%", 
      isPositive: true,
      description: "vs yesterday",
      chartData: [30, 20, 40, 50, 45, 80, 95]
    },
    { 
      title: "Prescriptions", 
      value: "18", 
      icon: TrendingUp, 
      trend: "-2%", 
      isPositive: false,
      description: "vs yesterday",
      chartData: [80, 70, 60, 50, 40, 30, 25]
    },
  ];

  return (
    <div className="space-y-8 mt-2 text-foreground">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold mb-1 tracking-tight">Overview</h1>
          <p className="text-muted-foreground text-sm font-medium">Welcome back, Dr. Sharma. Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-semibold hover:bg-muted transition-colors cursor-pointer shadow-sm">
            Export Report
          </button>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:shadow-md transition-all cursor-pointer">
            + New Booking
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative overflow-hidden premium-card p-5 group flex flex-col justify-between"
          >
            {/* Subtle Gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 rounded-xl bg-muted border border-border text-foreground shadow-sm group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors duration-300">
                  <stat.icon size={18} />
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <MoreHorizontal size={18} />
                </button>
              </div>
              
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">{stat.title}</p>
              <div className="flex items-end gap-3 mb-4">
                <h3 className="text-3xl font-bold tracking-tight leading-none">{stat.value}</h3>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${stat.isPositive ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/15 text-red-600 dark:text-red-400'}`}>
                    {stat.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {stat.trend}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">{stat.description}</span>
                </div>
                
                {/* Mini Sparkline Chart */}
                <div className="h-8 w-full mt-2 flex items-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  {stat.chartData.map((val, idx) => (
                    <div 
                      key={idx} 
                      className={`flex-1 rounded-t-sm ${stat.isPositive ? 'bg-emerald-500/40 group-hover:bg-emerald-500' : 'bg-red-500/40 group-hover:bg-red-500'} transition-all duration-300`}
                      style={{ height: `${val}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Live Waiting Room Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="premium-card lg:col-span-2 flex flex-col overflow-hidden"
        >
          <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold tracking-tight">Live Waiting Room</h2>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <button className="text-sm text-primary font-semibold hover:underline cursor-pointer">View All</button>
          </div>
          <div className="p-2 flex-1">
            {[
              { name: "Rahul Verma", time: "10:00 AM", status: "In Progress", type: "Follow up", avatar: "RV" },
              { name: "Priya Singh", time: "10:30 AM", status: "Waiting", type: "Consultation", avatar: "PS" },
              { name: "Amit Kumar", time: "11:00 AM", status: "Waiting", type: "Walk-in", avatar: "AK" },
            ].map((patient, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    {patient.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">{patient.name}</p>
                    <p className="text-xs text-muted-foreground font-medium">{patient.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-1.5 justify-end mb-0.5 text-muted-foreground">
                      <Clock size={12} />
                      <p className="font-medium text-xs text-foreground">{patient.time}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold min-w-[90px] text-center border ${
                    patient.status === 'In Progress' 
                      ? 'bg-accent/10 text-accent border-accent/20' 
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  }`}>
                    {patient.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="premium-card flex flex-col overflow-hidden"
        >
          <div className="p-6 border-b border-border bg-muted/30">
            <h2 className="text-lg font-bold tracking-tight">Quick Actions</h2>
          </div>
          <div className="p-6 flex flex-col gap-3">
            <button className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold shadow-sm hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2 text-sm">
              <CalendarIcon size={16} /> New Appointment
            </button>
            <button className="w-full bg-card border border-border py-3 rounded-xl font-semibold hover:bg-muted hover:border-muted-foreground/30 transition-all cursor-pointer text-foreground text-sm flex items-center justify-center gap-2">
              <Users size={16} /> Add Patient
            </button>
            <button className="w-full bg-card border border-border py-3 rounded-xl font-semibold hover:bg-muted hover:border-muted-foreground/30 transition-all cursor-pointer text-foreground text-sm flex items-center justify-center gap-2">
              <TrendingUp size={16} /> Write Prescription
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
