import { useState } from 'react';
import { Users, UserPlus, Building2 } from 'lucide-react';
import { useStaff } from '@/hooks/useStaff';
import { useFacilities } from '@/hooks/useFacilities';

export function TeamManagement() {
  const { staff, isLoading, addStaff, toggleFacilityAccess } = useStaff();
  const { facilities } = useFacilities();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'DOCTOR' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addStaff(newStaff);
    if (success) {
      setShowAddModal(false);
      setNewStaff({ name: '', email: '', password: '', role: 'DOCTOR' });
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm mt-6">
      <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 border border-indigo-500/20">
            <Users size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Team & Staff</h2>
            <p className="text-sm text-muted-foreground">Manage doctors and receptionists</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm flex items-center gap-2"
        >
          <UserPlus size={16} /> Add Staff
        </button>
      </div>
      
      <div className="p-0 divide-y divide-border">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading staff...</div>
        ) : staff.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No staff members found.</div>
        ) : (
          staff.map((user: any) => (
            <div key={user.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
              <div>
                <h4 className="font-bold text-lg">{user.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{user.role}</span>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
              </div>
              
              <div className="w-full sm:w-auto">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Branch Access</p>
                <div className="flex flex-wrap gap-2">
                  {facilities.map((fac: any) => {
                    const hasAccess = user.facilityAccess?.some((f: any) => f.facilityId === fac.id);
                    return (
                      <label key={fac.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${hasAccess ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'}`}>
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={hasAccess || false}
                          onChange={(e) => toggleFacilityAccess(user.id, fac.id, e.target.checked)}
                        />
                        <Building2 size={12} /> {fac.name}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border">
              <h3 className="text-xl font-bold">Add New Staff</h3>
              <p className="text-sm text-muted-foreground">Create an account for a new team member.</p>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold block mb-1">Full Name</label>
                <input 
                  required type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1">Email Address</label>
                <input 
                  required type="email" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1">Temporary Password</label>
                <input 
                  required type="password" value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1">Role</label>
                <select 
                  value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="DOCTOR">Doctor</option>
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="PHARMACIST">Pharmacist</option>
                </select>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 rounded-lg font-semibold border border-border bg-muted hover:bg-muted/80">Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-lg font-semibold bg-primary text-primary-foreground hover:opacity-90">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
