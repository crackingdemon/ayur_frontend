"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Clock, Plus, LayoutGrid, List, Search, MoreVertical, ChevronLeft, ChevronRight, User } from "lucide-react";
import Link from "next/link";

export default function AppointmentsHub() {
  const [view, setView] = useState<"timeline" | "kanban">("kanban");
  const [date, setDate] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));

  const appointments = [
    { id: 1, patientName: "Rahul Verma", time: "09:00 AM", duration: 30, status: "waiting", reason: "Follow-up", type: "Walk-in" },
    { id: 2, patientName: "Priya Singh", time: "09:30 AM", duration: 45, status: "in-progress", reason: "Consultation", type: "Online" },
    { id: 3, patientName: "Amit Kumar", time: "10:15 AM", duration: 30, status: "completed", reason: "Routine Checkup", type: "Call" },
    { id: 4, patientName: "Sunita Sharma", time: "11:00 AM", duration: 60, status: "waiting", reason: "PCOS Evaluation", type: "Online" },
    { id: 5, patientName: "Vikram Malhotra", time: "12:00 PM", duration: 30, status: "cancelled", reason: "Fever", type: "Walk-in" },
  ];

  const KanbanColumn = ({ title, status }: { title: string, status: string }) => {
    const colApps = appointments.filter(a => a.status === status);
    return (
      <div className="flex-1 min-w-[300px] bg-muted/30 rounded-xl p-4 border border-border flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-foreground flex items-center gap-2 tracking-tight">
            <span className={`w-2 h-2 rounded-full ${
              status === 'waiting' ? 'bg-amber-500' : 
              status === 'in-progress' ? 'bg-blue-500' : 
              status === 'completed' ? 'bg-emerald-500' : 'bg-red-500'
            }`} />
            {title}
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-background border border-border text-xs font-semibold">{colApps.length}</span>
        </div>
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {colApps.map(app => (
            <div key={app.id} className="premium-card p-4 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border uppercase tracking-wider">{app.time}</span>
                <button className="text-muted-foreground hover:text-foreground cursor-pointer"><MoreVertical size={16} /></button>
              </div>
              <h4 className="font-bold text-foreground text-lg mb-1">{app.patientName}</h4>
              <p className="text-sm text-muted-foreground font-medium mb-3">{app.reason}</p>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <Clock size={12} /> {app.duration}m
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <User size={12} /> {app.type}
                </div>
              </div>
            </div>
          ))}
          {colApps.length === 0 && (
            <div className="h-24 flex items-center justify-center border-2 border-dashed border-border rounded-xl text-sm font-medium text-muted-foreground">
              Empty
            </div>
          )}
        </div>
      </div>
    );
  };

  const TimelineView = () => {
    // Generate hours from 9 AM to 6 PM
    const hours = Array.from({ length: 10 }, (_, i) => i + 9);
    
    return (
      <div className="premium-card p-6 overflow-x-auto h-full">
        <div className="min-w-[800px] relative">
          {/* Time Grid */}
          <div className="ml-20 border-b border-border flex">
            {hours.map(hour => (
              <div key={hour} className="flex-1 border-l border-border/50 pl-2 pb-2">
                <span className="text-xs font-semibold text-muted-foreground">{hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}</span>
              </div>
            ))}
          </div>
          
          {/* Appointments Track */}
          <div className="relative mt-4 h-[400px]">
            {appointments.map((app, i) => {
              // Very rough positioning logic for demo purposes
              const timeParts = app.time.split(' ');
              const [h, m] = timeParts[0].split(':').map(Number);
              const hour24 = timeParts[1] === 'PM' && h !== 12 ? h + 12 : h;
              
              const startOffset = ((hour24 - 9) * 60 + m) / (10 * 60) * 100;
              const width = app.duration / (10 * 60) * 100;

              return (
                <div 
                  key={app.id} 
                  className={`absolute top-${i * 16} h-14 rounded-lg border flex flex-col justify-center px-3 cursor-pointer hover:shadow-md transition-shadow z-10`}
                  style={{ 
                    left: `calc(5rem + ${startOffset}%)`, 
                    width: `${width}%`,
                    top: `${i * 70}px`
                  }}
                >
                  <div className={`absolute inset-0 rounded-lg opacity-20 ${
                    app.status === 'waiting' ? 'bg-amber-500' : 
                    app.status === 'in-progress' ? 'bg-blue-500' : 
                    app.status === 'completed' ? 'bg-emerald-500' : 'bg-red-500'
                  }`} />
                  <div className={`absolute inset-0 rounded-lg border ${
                    app.status === 'waiting' ? 'border-amber-500/50' : 
                    app.status === 'in-progress' ? 'border-blue-500/50' : 
                    app.status === 'completed' ? 'border-emerald-500/50' : 'border-red-500/50'
                  }`} />
                  <div className="relative z-10 truncate">
                    <p className="font-bold text-sm text-foreground truncate">{app.patientName}</p>
                    <p className="text-xs text-muted-foreground font-medium truncate">{app.time} • {app.reason}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 mt-2 text-foreground h-[calc(100vh-6rem)] flex flex-col">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold mb-1 tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-primary" size={28} /> Appointments Hub
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center bg-card border border-border rounded-lg p-1 shadow-sm">
              <button className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded cursor-pointer"><ChevronLeft size={16} /></button>
              <span className="text-sm font-bold px-3">{date}</span>
              <button className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded cursor-pointer"><ChevronRight size={16} /></button>
            </div>
            <span className="text-sm font-semibold px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors">Today</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-card border border-border p-1 rounded-lg flex shadow-sm">
            <button 
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${view === 'kanban' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid size={16} /> Board
            </button>
            <button 
              onClick={() => setView("timeline")}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${view === 'timeline' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List size={16} /> Timeline
            </button>
          </div>
          <Link href="/dashboard/appointments/new">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer">
              <Plus size={18} /> New Booking
            </button>
          </Link>
        </div>
      </motion.div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col"
          >
            {view === "kanban" ? (
              <div className="flex gap-4 overflow-x-auto h-full pb-4">
                <KanbanColumn title="Waiting List" status="waiting" />
                <KanbanColumn title="In Consultation" status="in-progress" />
                <KanbanColumn title="Completed" status="completed" />
                <KanbanColumn title="Cancelled" status="cancelled" />
              </div>
            ) : (
              <TimelineView />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
