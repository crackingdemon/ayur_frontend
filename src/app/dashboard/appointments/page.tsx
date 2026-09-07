"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Clock, Plus, LayoutGrid, List, AlignJustify, Search, MoreVertical, ChevronLeft, ChevronRight, User, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useAppointmentsToday, useAppointmentsPaginated } from "@/hooks/useAppointments";
import { format } from "date-fns";
import { EmptyState } from "@/components/ui/EmptyState";

const KanbanColumn = ({ title, status, appointments }: { title: string, status: string, appointments: any[] }) => {
  const colApps = appointments.filter((a: any) => a.status === status);
  
  return (
    <div className="flex-1 min-w-[300px] bg-muted/30 rounded-xl p-4 border border-border flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-foreground flex items-center gap-2 tracking-tight">
          <span className={`w-2 h-2 rounded-full ${
            status === 'Scheduled' ? 'bg-zinc-400' :
            status === 'Waiting' ? 'bg-amber-500' : 
            status === 'In Consultation' ? 'bg-blue-500' : 
            status === 'Completed' ? 'bg-emerald-500' : 'bg-red-500'
          }`} />
          {title}
        </h3>
        <span className="px-2 py-0.5 rounded-full bg-background border border-border text-xs font-semibold">{colApps.length}</span>
      </div>
      
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div 
            {...provided.droppableProps} 
            ref={provided.innerRef}
            className={`space-y-3 flex-1 overflow-y-auto pr-1 ${snapshot.isDraggingOver ? 'bg-muted/50 rounded-lg' : ''}`}
          >
            {colApps.map((app: any, index: number) => (
              <Draggable key={app.id} draggableId={app.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`premium-card p-4 hover:border-primary/30 transition-colors ${snapshot.isDragging ? 'shadow-xl scale-[1.02] rotate-1' : 'shadow-sm'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border uppercase tracking-wider">
                        {format(new Date(app.date), 'hh:mm a')}
                      </span>
                      <button className="text-muted-foreground hover:text-foreground cursor-pointer"><MoreVertical size={16} /></button>
                    </div>
                    <h4 className="font-bold text-foreground text-lg mb-1">{app.patient?.name || 'Unknown Patient'}</h4>
                    <p className="text-sm text-muted-foreground font-medium mb-3">{app.reason}</p>
                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <Clock size={12} /> {app.duration || 30}m
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <User size={12} /> {app.type || 'Walk-in'}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">
                        <User size={12} /> {app.doctor || 'Dr. Default'}
                      </div>
                    </div>
                    {app.status === 'In Consultation' && app.patientId && (
                      <div className="mt-4 flex gap-2 w-full pt-2 border-t border-border/50">
                        <Link href={`/dashboard/patients/${app.patientId}/prescribe`} className="flex-1">
                          <button className="w-full flex items-center justify-center gap-1.5 text-xs font-bold px-2 py-2 rounded-md bg-primary text-primary-foreground shadow-sm hover:opacity-90 transition-opacity cursor-pointer text-center">
                            Write Prescription
                          </button>
                        </Link>
                        <Link href={`/dashboard/patients/${app.patientId}`} className="flex-1">
                          <button className="w-full flex items-center justify-center gap-1.5 text-xs font-bold px-2 py-2 rounded-md bg-secondary text-secondary-foreground border border-border shadow-sm hover:bg-muted transition-colors cursor-pointer text-center">
                            Open EMR
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            
            {colApps.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-24 flex items-center justify-center border-2 border-dashed border-border rounded-xl text-sm font-medium text-muted-foreground">
                Empty
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default function AppointmentsHub() {
  const [view, setView] = useState<"timeline" | "kanban" | "list">("kanban");
  const [page, setPage] = useState(1);
  const { appointments, isLoading, updateStatus } = useAppointmentsToday();
  const { appointments: paginatedApps, meta: paginatedMeta, isLoading: isListLoading } = useAppointmentsPaginated(page, 10);

  // Date formatted for display
  const dateDisplay = format(new Date(), "EEEE, MMMM d");

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // The droppableId is the new status
    const newStatus = destination.droppableId;
    updateStatus(draggableId, newStatus);
  };



  const TimelineView = () => {
    // Generate hours from 0 (12 AM) to 23 (11 PM)
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    // Live Current Time Indicator
    const [now, setNow] = useState(new Date());
    useEffect(() => {
      const interval = setInterval(() => setNow(new Date()), 60000);
      return () => clearInterval(interval);
    }, []);
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    const currentOffset = ((currentH * 60 + currentM) / (24 * 60)) * 100;
    
    // Tooltip State
    const [hoveredApp, setHoveredApp] = useState<{app: any, rect: DOMRect} | null>(null);

    // Overlap Resolution Algorithm (Industry Standard Gantt)
    const rows: any[][] = [];
    const sortedApps = [...appointments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sortedApps.forEach(app => {
      const start = new Date(app.date).getTime();
      const duration = app.duration || 30;
      const end = start + duration * 60000;
      
      let placed = false;
      for (let i = 0; i < rows.length; i++) {
        const lastAppInRow = rows[i][rows[i].length - 1];
        const lastEnd = new Date(lastAppInRow.date).getTime() + (lastAppInRow.duration || 30) * 60000;
        // Add 5 mins buffer between blocks for neatness
        if (start >= lastEnd + 5 * 60000) {
          rows[i].push(app);
          app._rowIndex = i;
          placed = true;
          break;
        }
      }
      if (!placed) {
        rows.push([app]);
        app._rowIndex = rows.length - 1;
      }
    });

    // Calculate height dynamically based on overlapping rows
    const containerHeight = Math.max(400, rows.length * 70 + 40);

    return (
      <div 
        className="premium-card p-6 overflow-auto h-full styled-scrollbar relative"
        onScroll={() => setHoveredApp(null)}
      >
        <div className="min-w-[2000px] relative">
          {/* Time Grid */}
          <div className="ml-20 border-b border-border flex">
            {hours.map(hour => {
              const displayHour = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
              return (
                <div key={hour} className="flex-1 border-l border-border/50 pl-2 pb-2">
                  <span className="text-xs font-semibold text-muted-foreground">{displayHour}</span>
                </div>
              );
            })}
          </div>
          
          {/* Appointments Track Container */}
          <div className="relative mt-4" style={{ height: `${containerHeight}px` }}>
            {/* Current Time Indicator */}
            <div 
              className="absolute top-[-16px] bottom-0 w-[2px] bg-red-500/80 z-20"
              style={{ left: `calc(5rem + ${currentOffset}%)` }}
            >
              <div className="absolute top-0 left-[-4px] w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            </div>

            {/* Vertical Grid Lines mapping to hours */}
            <div className="absolute inset-0 ml-20 flex pointer-events-none">
              {hours.map(hour => (
                <div key={`grid-${hour}`} className="flex-1 border-l border-border/20 h-full" />
              ))}
            </div>

            {/* Plot Appointments */}
            {sortedApps.map((app: any) => {
              const appDate = new Date(app.date);
              const h = appDate.getHours();
              const m = appDate.getMinutes();
              const duration = app.duration || 30;
              
              const startOffset = ((h * 60 + m) / (24 * 60)) * 100;
              const width = (duration / (24 * 60)) * 100;

              return (
                <div 
                  key={app.id} 
                  className={`absolute h-14 rounded-lg flex flex-col justify-center cursor-pointer z-10 group`}
                  style={{ 
                    left: `calc(5rem + ${startOffset}%)`, 
                    width: `${width}%`,
                    top: `${app._rowIndex * 70}px`
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredApp({ app, rect });
                  }}
                  onMouseLeave={() => setHoveredApp(null)}
                >
                  {/* Background Layer (Clips bounds) */}
                  <div className="absolute inset-0 rounded-lg overflow-hidden hover:shadow-lg transition-all">
                    <div className={`absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity ${
                      app.status === 'Scheduled' ? 'bg-zinc-400' :
                      app.status === 'Waiting' ? 'bg-amber-500' : 
                      app.status === 'In Consultation' ? 'bg-blue-500' : 
                      app.status === 'Completed' ? 'bg-emerald-500' : 'bg-red-500'
                    }`} />
                    <div className={`absolute inset-0 border ${
                      app.status === 'Scheduled' ? 'border-zinc-400/50 group-hover:border-zinc-400' :
                      app.status === 'Waiting' ? 'border-amber-500/50 group-hover:border-amber-500' : 
                      app.status === 'In Consultation' ? 'border-blue-500/50 group-hover:border-blue-500' : 
                      app.status === 'Completed' ? 'border-emerald-500/50 group-hover:border-emerald-500' : 'border-red-500/50 group-hover:border-red-500'
                    } transition-colors rounded-lg`} />
                    
                    {/* Progress Bar (if in consultation) */}
                    {app.status === 'In Consultation' && (
                      <div className="absolute bottom-0 left-0 h-1 bg-blue-500/50" style={{ width: '45%' }} />
                    )}
                  </div>

                  {/* Text Layer */}
                  <div className="relative z-10 truncate flex flex-col justify-center h-full px-3 pt-0.5 pointer-events-none">
                    <p className="font-bold text-[13px] text-foreground truncate leading-tight">{app.patient?.name}</p>
                    <p className="text-[11px] text-muted-foreground font-medium truncate flex items-center gap-1">
                      {format(appDate, 'h:mm a')} <span className="opacity-50">•</span> {app.reason}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fixed Portal Tooltip to prevent any clipping! */}
        {hoveredApp && (
          <div 
            className="fixed z-[100] w-max max-w-[250px] p-3 bg-foreground text-background rounded-lg shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-8px] animate-in fade-in zoom-in-95 duration-200"
            style={{ 
              left: hoveredApp.rect.left + hoveredApp.rect.width / 2, 
              top: hoveredApp.rect.top 
            }}
          >
            <p className="font-bold text-sm mb-1">{hoveredApp.app.patient?.name || 'Unknown Patient'}</p>
            <div className="flex flex-col gap-1 text-xs text-background/80 font-medium">
              <p className="flex items-center gap-1.5"><Clock size={12} /> {format(new Date(hoveredApp.app.date), 'h:mm a')} ({hoveredApp.app.duration || 30} mins)</p>
              <p className="flex items-center gap-1.5"><AlignJustify size={12} /> {hoveredApp.app.reason}</p>
              <p className="flex items-center gap-1.5"><CheckCircle size={12} /> {hoveredApp.app.status}</p>
            </div>
            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
          </div>
        )}
      </div>
    );
  };
  const PaginatedListView = () => {
    return (
      <div className="premium-card flex flex-col h-full overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold rounded-tl-xl">Patient</th>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
                <th className="px-6 py-4 font-semibold">Reason</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Source & Provider</th>
                <th className="px-6 py-4 font-semibold rounded-tr-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isListLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : paginatedApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <EmptyState 
                      icon={CalendarIcon} 
                      title="No appointments found" 
                      description="You don't have any appointments scheduled for this view. Create a new booking to get started."
                      action={<Link href="/dashboard/appointments/new"><button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold">New Booking</button></Link>}
                    />
                  </td>
                </tr>
              ) : (
                paginatedApps.map((app: any) => (
                  <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{app.patient?.name || 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground">{app.patient?.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{format(new Date(app.date), 'MMM d, yyyy')}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock size={10}/> {format(new Date(app.date), 'hh:mm a')} ({app.duration}m)</div>
                    </td>
                    <td className="px-6 py-4 text-foreground font-medium">{app.reason}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                        app.status === 'Scheduled' ? 'bg-zinc-400/10 text-zinc-600 border-zinc-400/20' :
                        app.status === 'Waiting' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                        app.status === 'In Consultation' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 
                        app.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{app.type || 'Walk-in'}</div>
                      <div className="text-xs text-primary font-bold mt-0.5">{app.doctor || 'Dr. Default'}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {app.status === 'In Consultation' && app.patientId ? (
                        <div className="flex items-center justify-end gap-3">
                          <Link href={`/dashboard/patients/${app.patientId}/prescribe`}>
                            <button className="text-primary font-bold hover:underline text-xs bg-primary/10 px-3 py-1.5 rounded-md">Write Prescription</button>
                          </Link>
                          <Link href={`/dashboard/patients/${app.patientId}`}>
                            <button className="text-foreground font-semibold hover:underline text-xs bg-muted px-3 py-1.5 rounded-md border border-border">Open EMR</button>
                          </Link>
                        </div>
                      ) : (
                        <Link href={app.patientId ? `/dashboard/patients/${app.patientId}` : '#'}>
                          <button className="text-primary font-medium hover:underline text-xs">View Details</button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="border-t border-border p-4 flex items-center justify-between bg-muted/20">
          <span className="text-sm text-muted-foreground font-medium">
            Showing <span className="text-foreground font-bold">{paginatedApps.length}</span> of <span className="text-foreground font-bold">{paginatedMeta.total}</span> appointments
          </span>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded border border-border bg-card text-sm font-semibold disabled:opacity-50 hover:bg-muted transition-colors cursor-pointer"
            >
              Previous
            </button>
            <div className="px-3 py-1.5 text-sm font-bold border border-border rounded bg-muted">
              {page} / {paginatedMeta.totalPages}
            </div>
            <button 
              disabled={page === paginatedMeta.totalPages || paginatedMeta.totalPages === 0}
              onClick={() => setPage(p => Math.min(paginatedMeta.totalPages, p + 1))}
              className="px-3 py-1.5 rounded border border-border bg-card text-sm font-semibold disabled:opacity-50 hover:bg-muted transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-2 text-foreground h-[calc(100vh-6rem)] flex flex-col">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0"
      >
        <div>
          <h1 className="text-3xl font-bold mb-1 tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-primary" size={28} /> Appointments Hub
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center bg-card border border-border rounded-lg p-1 shadow-sm">
              <button className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded cursor-pointer"><ChevronLeft size={16} /></button>
              <span className="text-sm font-bold px-3">{dateDisplay}</span>
              <button className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded cursor-pointer"><ChevronRight size={16} /></button>
            </div>
            <span className="text-sm font-semibold px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors">Today</span>
            {isLoading && <Loader2 size={14} className="animate-spin text-muted-foreground ml-2" />}
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
            <button 
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${view === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <AlignJustify size={16} /> List
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
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-4 overflow-x-auto h-full pb-4">
                  <KanbanColumn title="Scheduled" status="Scheduled" appointments={appointments} />
                  <KanbanColumn title="Waiting List" status="Waiting" appointments={appointments} />
                  <KanbanColumn title="In Consultation" status="In Consultation" appointments={appointments} />
                  <KanbanColumn title="Completed" status="Completed" appointments={appointments} />
                </div>
              </DragDropContext>
            ) : view === "timeline" ? (
              <TimelineView />
            ) : (
              <PaginatedListView />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
