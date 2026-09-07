"use client";

import { useState } from "react";
import { usePatients } from "@/hooks/usePatients";
import { usePendingBills } from "@/hooks/useBilling";
import { Search, Plus, CreditCard, ShoppingCart, Loader2, Trash2, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

interface CartItem {
  id: string; // temporary id
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  isPrescription?: boolean;
}

export default function BillingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { patients, isLoading: isLoadingPatients } = usePatients(searchQuery);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  
  const { bills, isLoading: isLoadingBills, mutate } = usePendingBills(selectedPatientId);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Custom Line Item Form State
  const [customDesc, setCustomDesc] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [customQty, setCustomQty] = useState("1");

  const addCustomItem = () => {
    if (!customDesc || !customPrice) {
      toast.error("Please enter a description and price");
      return;
    }
    const price = parseFloat(customPrice);
    const qty = parseInt(customQty);
    
    if (price < 0 || qty < 1) return;
    
    const newItem: CartItem = {
      id: `custom-${Date.now()}`,
      description: customDesc,
      unitPrice: price,
      quantity: qty,
      discount: 0,
      totalPrice: price * qty,
    };
    
    setCart([...cart, newItem]);
    setCustomDesc("");
    setCustomPrice("");
    setCustomQty("1");
    toast.success("Item added to cart");
  };

  const removeCartItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Convert unbilled prescriptions to cart items
  const addPrescriptionToCart = (prescription: any) => {
    const newItems: CartItem[] = prescription.items.map((item: any) => {
      const price = item.inventory?.price || 0; // Assuming inventory has price, else 0
      const qty = item.quantity || 1;
      return {
        id: `rx-${item.id}`,
        description: item.inventory ? item.inventory.name : item.customMedicineName,
        unitPrice: price,
        quantity: qty,
        discount: 0,
        totalPrice: price * qty,
        isPrescription: true,
      };
    });
    
    setCart([...cart, ...newItems]);
    toast.success("Prescription items added to cart");
  };

  const subTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalDiscount = cart.reduce((sum, item) => sum + item.discount, 0);
  const grandTotal = subTotal - totalDiscount;

  const handleCheckout = async () => {
    if (!selectedPatientId) return;
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Create Invoice
      const invoiceRes = await api.post(`/billing/patients/${selectedPatientId}/invoice`, {
        items: cart.map(c => ({
          description: c.description,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
          discount: c.discount,
          totalPrice: c.totalPrice
        })),
        subTotal,
        discount: totalDiscount,
        totalAmount: grandTotal,
      });

      // 2. Process Payment
      await api.post(`/billing/invoice/${invoiceRes.data.id}/pay`, {
        paymentMethod: "Cash/Card" // TODO: Add toggle for payment method
      });

      toast.success("Invoice paid successfully!");
      setCart([]);
      mutate(); // Refresh pending bills
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Checkout failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Point of Sale (Billing)</h1>
          <p className="text-muted-foreground mt-1">Generate invoices and collect payments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Patient Selection & Pending Items */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Patient Selector */}
          <div className="premium-card p-6">
            <h2 className="text-xl font-bold mb-4">1. Select Patient</h2>
            {!selectedPatientId ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    placeholder="Search patients by name or phone..."
                    className="premium-input pl-10 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {isLoadingPatients ? (
                  <div className="flex justify-center p-4"><Loader2 className="animate-spin text-primary" /></div>
                ) : (
                  <div className="border border-border rounded-xl divide-y divide-border max-h-60 overflow-y-auto">
                    {patients.map((patient) => (
                      <div 
                        key={patient.id} 
                        className="p-3 hover:bg-muted/50 cursor-pointer flex justify-between items-center transition-colors"
                        onClick={() => setSelectedPatientId(patient.id)}
                      >
                        <div>
                          <p className="font-semibold">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">{patient.phone}</p>
                        </div>
                        <Button variant="secondary" size="sm">Select</Button>
                      </div>
                    ))}
                    {patients.length === 0 && (
                      <div className="p-4 text-center text-muted-foreground">No patients found.</div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-between items-center p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <div>
                  <p className="font-bold text-lg">{selectedPatient?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPatient?.phone}</p>
                </div>
                <Button variant="outline" onClick={() => setSelectedPatientId(null)}>Change Patient</Button>
              </div>
            )}
          </div>

          {/* Pending Items (Only show if patient selected) */}
          {selectedPatientId && (
            <div className="premium-card p-6">
              <h2 className="text-xl font-bold mb-4">2. Unbilled Items</h2>
              
              {isLoadingBills ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
              ) : bills?.unbilledPrescriptions?.length > 0 ? (
                <div className="space-y-4">
                  {bills.unbilledPrescriptions.map((rx: any) => (
                    <div key={rx.id} className="border border-border rounded-xl p-4 flex justify-between items-start">
                      <div>
                        <span className="inline-block px-2 py-1 bg-amber-500/10 text-amber-600 rounded text-xs font-bold mb-2">Unbilled Prescription</span>
                        <p className="font-semibold">Visit on {new Date(rx.visit.date).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">{rx.items.length} medicines dispensed</p>
                      </div>
                      <Button onClick={() => addPrescriptionToCart(rx)} variant="secondary" className="flex items-center gap-2">
                        <Plus size={16} /> Add to Cart
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={ShoppingCart}
                  title="No Pending Bills"
                  description="This patient has no unbilled dispensed prescriptions."
                />
              )}
              
              <div className="mt-8 border-t border-border pt-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Plus size={18} /> Add Custom Line Item
                </h3>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Description (e.g. Consultation)</label>
                    <input type="text" className="premium-input w-full" value={customDesc} onChange={e => setCustomDesc(e.target.value)} />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Qty</label>
                    <input type="number" min="1" className="premium-input w-full" value={customQty} onChange={e => setCustomQty(e.target.value)} />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Unit Price (₹)</label>
                    <input type="number" min="0" className="premium-input w-full" value={customPrice} onChange={e => setCustomPrice(e.target.value)} />
                  </div>
                  <Button onClick={addCustomItem}>Add</Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: The Cart */}
        <div className="space-y-6">
          <div className="premium-card p-0 overflow-hidden sticky top-6">
            <div className="bg-muted/50 p-4 border-b border-border">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart size={20} /> Current Invoice
              </h2>
            </div>
            
            <div className="p-4 min-h-[300px] flex flex-col">
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50 my-8">
                  <ShoppingCart size={48} className="mb-4" />
                  <p>Cart is empty</p>
                </div>
              ) : (
                <div className="flex-1 space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-start text-sm group">
                      <div className="flex-1 pr-4">
                        <p className="font-medium text-foreground">{item.description}</p>
                        <p className="text-muted-foreground text-xs">{item.quantity} x ₹{item.unitPrice}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">₹{item.totalPrice}</span>
                        <button onClick={() => removeCartItem(item.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="border-t border-border mt-6 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{subTotal}</span>
                </div>
                <div className="flex justify-between text-sm text-emerald-500">
                  <span>Discount</span>
                  <span>-₹{totalDiscount}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-foreground mt-2 pt-2 border-t border-border/50">
                  <span>Grand Total</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>

              <Button 
                onClick={handleCheckout} 
                isLoading={isProcessing}
                disabled={cart.length === 0 || !selectedPatientId}
                className="w-full mt-6 h-12 text-lg"
              >
                <CreditCard className="mr-2" /> Checkout & Pay
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
