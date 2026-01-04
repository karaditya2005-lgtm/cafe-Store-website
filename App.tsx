
import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import CoffeeCard from './components/CoffeeCard';
import AIBarista from './components/AIBarista';
import LoginModal from './components/LoginModal';
import PaymentModal from './components/PaymentModal';
import { Page, Coffee, CartItem, PaymentMethod } from './types';
import { COFFEE_DATA, CATEGORIES } from './constants';
import { getUPILink, getQRCodeUrl, simulateGatewayRedirect } from './services/paymentService';
import { authService } from './services/authService';
import { db } from './services/db';
import { 
  Trash2, Plus, Minus, CreditCard, ChevronRight, 
  Sparkles, ShoppingCart, LogOut, Package, Heart, 
  Clock, MapPin, Settings, User as UserIcon,
  Coffee as CoffeeIcon, Search as SearchIcon,
  ShieldCheck, Lock, Smartphone, QrCode, RefreshCw,
  ExternalLink, Loader2, X, ChevronDown, CheckCircle2,
  Receipt, Calendar, CreditCard as PaymentIcon,
  Info, RotateCcw
} from 'lucide-react';

interface User {
  name: string;
  email: string;
  points: number;
  memberSince: string;
  picture?: string;
}

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>(Page.Home);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'verifying' | 'success'>('idle');
  const [showUPIDashboard, setShowUPIDashboard] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Constants
  const DELIVERY_FEE = 40;
  const PLATFORM_FEE = 10;
  const GST_RATE = 0.05;

  useEffect(() => {
    const session = authService.checkSession();
    if (session) setUser(session);
    
    // Load cart from session if needed (optional persistence)
    const savedCart = localStorage.getItem('rage_anurage_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('rage_anurage_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (user) setUserOrders(db.getOrdersByEmail(user.email));
    else setUserOrders([]);
  }, [user]);

  const filteredCoffees = useMemo(() => {
    let result = COFFEE_DATA;
    if (activeCategory !== 'All') result = result.filter(c => c.category === activeCategory);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.description.toLowerCase().includes(query)
      );
    }
    return result;
  }, [activeCategory, searchQuery]);

  const addToCart = (coffee: Coffee) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === coffee.id);
      if (existing) {
        return prev.map(item => item.id === coffee.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...coffee, quantity: 1, selectedSize: 'Medium' }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  // Billing Engine
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const gstAmount = Math.round(cartSubtotal * GST_RATE);
  const grandTotal = cartSubtotal + DELIVERY_FEE + PLATFORM_FEE + gstAmount;

  const handleCheckout = () => {
    if (!user) {
      setLoginModalMode('login');
      setIsLoginOpen(true);
      return;
    }
    setIsPaymentOpen(true);
  };

  const confirmPayment = async (method: PaymentMethod) => {
    setIsPaymentOpen(false);
    const orderId = Math.random().toString(36).substr(2, 9).toUpperCase();
    setCurrentOrderId(orderId);

    if (method === 'UPI') {
      const link = getUPILink(grandTotal, orderId);
      window.location.href = link;
      setShowUPIDashboard(true);
    } else {
      setPaymentStatus('processing');
      await simulateGatewayRedirect(method);
      completeOrder(orderId, method);
    }
  };

  const handleManualVerify = async () => {
    setPaymentStatus('verifying');
    await simulateGatewayRedirect('UPI');
    completeOrder(currentOrderId, 'UPI');
  };

  const completeOrder = (orderId: string, method: string) => {
    const newOrder = {
      orderId,
      userEmail: user?.email,
      items: [...cart],
      subtotal: cartSubtotal,
      deliveryFee: DELIVERY_FEE,
      platformFee: PLATFORM_FEE,
      gst: gstAmount,
      total: grandTotal,
      method,
      status: 'Delivered'
    };
    db.saveOrder(newOrder);
    
    setShowUPIDashboard(false);
    setPaymentStatus('success');
    
    setTimeout(() => {
      setPaymentStatus('idle');
      setCart([]);
      setActivePage(Page.Home);
      if (user) setUserOrders(db.getOrdersByEmail(user.email));
    }, 2500);
  };

  const handleReorder = (orderItems: CartItem[]) => {
    setCart(prev => {
      const newCart = [...prev];
      orderItems.forEach(newItem => {
        const existing = newCart.find(item => item.id === newItem.id && item.selectedSize === newItem.selectedSize);
        if (existing) {
          existing.quantity += newItem.quantity;
        } else {
          newCart.push({ ...newItem });
        }
      });
      return newCart;
    });
    setSelectedOrder(null);
    setActivePage(Page.Cart);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsLoginOpen(false);
    if (userOrders.length === 0) setUserOrders(db.getOrdersByEmail(userData.email));
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setActivePage(Page.Home);
    setCart([]);
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar activePage={activePage} setActivePage={setActivePage} cartCount={cartCount} user={user} onOpenLogin={() => { setLoginModalMode('login'); setIsLoginOpen(true); }} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <main className="container mx-auto px-6 pt-24 md:pt-32">
        {activePage === Page.Home && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <section className="relative h-[80vh] flex items-center rounded-[3rem] overflow-hidden shadow-2xl">
              <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=2000" alt="Premium Coffee" className="absolute inset-0 w-full h-full object-cover brightness-50 scale-105" />
              <div className="relative z-10 px-10 md:px-20 max-w-3xl text-left">
                <span className="text-[#D4AF37] font-bold tracking-[0.3em] uppercase mb-4 block">Crafted with Heart</span>
                <h1 className="text-5xl md:text-8xl font-serif-elegant font-bold text-white mb-6 leading-tight">রাগে অনুরাগে <br/><span className="text-[#D4AF37]">The Perfect Brew.</span></h1>
                <div className="flex flex-wrap gap-4">
                  <button onClick={() => setActivePage(Page.Menu)} className="bg-[#E63946] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-[#E63946] transition-all transform hover:scale-105 shadow-xl flex items-center gap-2">Order Now <ChevronRight size={20} /></button>
                </div>
              </div>
            </section>
            <AIBarista />
            <section>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-serif-elegant font-bold text-[#2C1B18]">Trending Passion</h2>
                  <div className="h-1.5 w-20 bg-[#D4AF37] rounded-full mt-2"></div>
                </div>
                <button onClick={() => setActivePage(Page.Menu)} className="text-[#E63946] font-bold flex items-center gap-1 hover:underline">View Full Menu <ChevronRight size={18} /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {COFFEE_DATA.slice(0, 3).map(coffee => <CoffeeCard key={coffee.id} coffee={coffee} onAddToCart={addToCart} />)}
              </div>
            </section>
          </div>
        )}

        {activePage === Page.Menu && (
          <div className="pt-10 space-y-10 animate-in fade-in duration-500">
            <div className="text-center space-y-4">
               <h2 className="text-4xl md:text-6xl font-serif-elegant font-bold text-[#2C1B18]">{searchQuery ? 'Search Results' : 'Choose Your Muse'}</h2>
               <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar justify-center">
                 {CATEGORIES.map(cat => (
                   <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-8 py-3 rounded-full font-bold transition-all whitespace-nowrap shadow-sm ${activeCategory === cat ? 'bg-[#2C1B18] text-white scale-110 shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>{cat}</button>
                 ))}
               </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
               {filteredCoffees.map(coffee => <CoffeeCard key={coffee.id} coffee={coffee} onAddToCart={addToCart} />)}
            </div>
          </div>
        )}

        {activePage === Page.Cart && (
          <div className="pt-10 max-w-6xl mx-auto animate-in fade-in duration-500">
            <h2 className="text-3xl font-serif-elegant font-bold mb-8 text-[#2C1B18]">Your Passion Basket</h2>
            {cart.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                 <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 size={48} className="text-gray-300" /></div>
                 <p className="text-gray-400 mb-8">Your basket is empty of feelings. Let's add some coffee.</p>
                 <button onClick={() => setActivePage(Page.Menu)} className="bg-[#2C1B18] text-white px-8 py-3 rounded-full hover:bg-[#E63946] transition-all font-bold">Start Shopping</button>
               </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                  {cart.map(item => (
                    <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
                      <img src={item.image} className="w-24 h-24 rounded-2xl object-cover shadow-md" />
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-[#2C1B18]">{item.name}</h4>
                        <p className="text-sm text-gray-400">{item.selectedSize}</p>
                      </div>
                      <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 gap-4">
                        <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-[#E63946] transition-colors"><Minus size={16} /></button>
                        <span className="font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="hover:text-[#E63946] transition-colors"><Plus size={16} /></button>
                      </div>
                      <div className="text-right font-bold text-lg text-[#2C1B18] min-w-[80px]">₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                  <button onClick={() => setCart([])} className="text-xs text-gray-400 font-bold flex items-center gap-1 hover:text-[#E63946] transition-colors ml-auto">
                    <Trash2 size={12} /> Clear Basket
                  </button>
                </div>
                <div className="bg-[#2C1B18] text-white p-8 rounded-[2.5rem] shadow-2xl h-fit sticky top-32">
                  <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Order Summary</h3>
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-white/60"><span>Item Total</span><span>₹{cartSubtotal}</span></div>
                    <div className="flex justify-between text-white/60"><span>GST (5%)</span><span>₹{gstAmount}</span></div>
                    <div className="flex justify-between text-white/60"><span>Delivery Fee</span><span>₹{DELIVERY_FEE}</span></div>
                    <div className="flex justify-between text-white/60"><span>Platform Fee</span><span>₹{PLATFORM_FEE}</span></div>
                    <div className="flex justify-between text-2xl font-bold border-t border-white/10 pt-4"><span>To Pay</span><span className="text-[#D4AF37]">₹{grandTotal}</span></div>
                  </div>
                  <button onClick={handleCheckout} className="w-full bg-[#E63946] text-white py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-[#E63946] transition-all flex items-center justify-center gap-2 shadow-xl transform active:scale-95"><CreditCard size={20} /> Checkout Now</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activePage === Page.Profile && user && (
          <div className="pt-10 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
            <div className="relative bg-gradient-to-br from-[#2C1B18] to-[#1a110f] p-10 md:p-16 rounded-[3rem] text-white overflow-hidden shadow-2xl">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#E63946] to-[#D4AF37] p-1 shadow-2xl relative">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[#2C1B18] text-4xl font-serif-elegant font-bold overflow-hidden">
                    {user.picture ? <img src={user.picture} className="w-full h-full object-cover" /> : user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-[#D4AF37] text-[#2C1B18] p-2 rounded-full border-2 border-[#2C1B18]"><Sparkles size={16} /></div>
                </div>
                <div className="flex-1">
                  <h2 className="text-4xl md:text-5xl font-serif-elegant font-bold mb-2">Hello, {user.name}!</h2>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                    <div className="bg-white/10 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"><Heart size={14} className="text-[#E63946]" /> 1,250 Passion Points</div>
                    <div className="bg-white/10 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"><Package size={14} className="text-[#D4AF37]" /> Coffee Member</div>
                  </div>
                </div>
                <button onClick={handleLogout} className="bg-white/5 hover:bg-red-500/20 text-white p-4 rounded-full transition-all border border-white/10 flex items-center gap-2 group">
                  <span className="text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Logout</span>
                  <LogOut size={24} />
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
               <h3 className="text-2xl font-serif-elegant font-bold text-[#2C1B18] flex items-center gap-2"><Clock className="text-[#8B4513]" /> Past Passion Journeys</h3>
               {userOrders.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {[...userOrders].reverse().map((order, idx) => (
                      <div 
                        key={idx} 
                        className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-stretch gap-6 text-left group"
                      >
                        <div className="flex items-center gap-6 cursor-pointer flex-1" onClick={() => setSelectedOrder(order)}>
                           <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-[#E63946]/10 transition-colors">
                             <CoffeeIcon size={24} className="text-[#8B4513] group-hover:text-[#E63946]" />
                           </div>
                           <div className="flex-1">
                             <div className="flex justify-between items-start">
                               <h4 className="font-bold group-hover:text-[#E63946] transition-colors">Order #{order.orderId}</h4>
                               <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded-full font-bold">DELIVERED</span>
                             </div>
                             <p className="text-xs text-gray-400 mt-1">{new Date(order.timestamp).toLocaleDateString()} at {new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                             <p className="text-[10px] mt-2 text-gray-400 uppercase tracking-tighter font-bold">{order.items.length} Passion Brews</p>
                           </div>
                           <div className="text-right">
                             <p className="font-black text-[#2C1B18] text-lg">₹{order.total}</p>
                             <ChevronRight size={16} className="text-gray-300 ml-auto mt-1" />
                           </div>
                        </div>
                        <div className="flex border-t border-gray-50 pt-4 mt-2">
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               handleReorder(order.items);
                             }}
                             className="w-full bg-[#2C1B18] text-white py-3 rounded-xl font-bold text-xs hover:bg-[#E63946] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                           >
                             <RotateCcw size={14} /> Reorder Journey
                           </button>
                        </div>
                      </div>
                   ))}
                 </div>
               ) : <div className="text-center py-20 bg-gray-50 rounded-[3rem] text-gray-400 border-2 border-dashed border-gray-200">No orders yet. Your story starts with the first cup.</div>}
            </div>
          </div>
        )}
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[500] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="relative bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="bg-[#2C1B18] p-8 text-white relative">
                 <button onClick={() => setSelectedOrder(null)} className="absolute top-8 right-8 text-white/30 hover:text-white hover:rotate-90 transition-all"><X size={24} /></button>
                 <div className="flex items-center gap-4">
                    <div className="bg-[#E63946] p-3 rounded-2xl shadow-lg shadow-[#E63946]/20"><Receipt size={24} /></div>
                    <div>
                       <h2 className="text-2xl font-serif-elegant font-bold">Passion Receipt</h2>
                       <p className="text-white/50 text-xs">Transaction ID: #{selectedOrder.orderId}</p>
                    </div>
                 </div>
              </div>

              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto no-scrollbar">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                       <Calendar className="text-[#8B4513]" size={18} />
                       <div><p className="text-[10px] text-gray-400 uppercase font-bold">Placed On</p><p className="text-sm font-bold">{new Date(selectedOrder.timestamp).toLocaleDateString()}</p></div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                       <PaymentIcon className="text-[#8B4513]" size={18} />
                       <div><p className="text-[10px] text-gray-400 uppercase font-bold">Paid via</p><p className="text-sm font-bold uppercase">{selectedOrder.method}</p></div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">Your Items</h3>
                    {selectedOrder.items.map((item: any, i: number) => (
                       <div key={i} className="flex items-center gap-4">
                          <img src={item.image} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                          <div className="flex-1">
                             <h4 className="text-sm font-bold text-[#2C1B18]">{item.name}</h4>
                             <p className="text-[10px] text-gray-400">{item.selectedSize} × {item.quantity}</p>
                          </div>
                          <p className="font-bold text-sm text-[#2C1B18]">₹{item.price * item.quantity}</p>
                       </div>
                    ))}
                 </div>

                 <div className="bg-gray-50 p-6 rounded-3xl space-y-3">
                    <div className="flex justify-between text-xs text-gray-500 font-medium"><span>Item Total</span><span>₹{selectedOrder.subtotal}</span></div>
                    <div className="flex justify-between text-xs text-gray-500 font-medium"><span>GST (5%)</span><span>₹{selectedOrder.gst}</span></div>
                    <div className="flex justify-between text-xs text-gray-500 font-medium"><span>Delivery & Handling</span><span>₹{selectedOrder.deliveryFee + selectedOrder.platformFee}</span></div>
                    <div className="flex justify-between font-black text-[#2C1B18] border-t border-gray-200 pt-4">
                       <span className="text-lg">Amount Charged</span>
                       <span className="text-xl text-[#E63946]">₹{selectedOrder.total}</span>
                    </div>
                 </div>
              </div>

              <div className="p-8 pt-0 flex gap-4">
                 <button onClick={() => setSelectedOrder(null)} className="flex-1 bg-gray-100 text-[#2C1B18] py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95">Close</button>
                 <button onClick={() => handleReorder(selectedOrder.items)} className="flex-[2] bg-[#E63946] text-white py-4 rounded-2xl font-bold hover:bg-[#2C1B18] transition-all shadow-xl shadow-[#E63946]/20 flex items-center justify-center gap-2 active:scale-95">
                    <RotateCcw size={18} /> Reorder Passion
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Payment Dashboard & Status Overlays */}
      {showUPIDashboard && (
        <div className="fixed inset-0 z-[700] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="max-w-sm w-full bg-[#f8faff] rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-8 flex flex-col items-center">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                       <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-2xl font-medium text-slate-700">Aditya Kar</span>
                 </div>
                 <div className="bg-white w-full rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center border border-slate-100">
                    <div className="relative mb-6">
                       <img src={getQRCodeUrl(grandTotal, currentOrderId)} className="w-56 h-56" />
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                             <img src="https://www.gstatic.com/images/branding/product/2x/google_pay_48dp.png" className="w-8 h-8" />
                          </div>
                       </div>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">UPI ID: <span className="text-slate-700 font-bold">karaditya2005-3@oksbi</span></p>
                 </div>
                 <div className="mt-12 w-full space-y-4">
                    <button onClick={handleManualVerify} className="w-full bg-[#2C1B18] text-white py-4 rounded-full font-bold hover:bg-[#E63946] transition-all shadow-lg flex items-center justify-center gap-2">I've Made the Payment <ChevronRight size={18} /></button>
                    <button onClick={() => setShowUPIDashboard(false)} className="w-full text-slate-400 text-xs font-bold uppercase tracking-widest">Cancel Payment</button>
                 </div>
              </div>
              <div className="py-4 bg-slate-50/50 flex items-center justify-center gap-2 opacity-50 border-t border-slate-100">
                 <ShieldCheck size={14} className="text-slate-400" /><span className="text-[10px] font-bold text-slate-400">SECURE UPI GATEWAY</span>
              </div>
           </div>
        </div>
      )}

      {(paymentStatus === 'processing' || paymentStatus === 'verifying') && (
        <div className="fixed inset-0 z-[800] bg-[#2C1B18]/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="text-center space-y-8">
            <div className="relative w-24 h-24 mx-auto">
               <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-t-[#E63946] rounded-full animate-spin"></div>
               <RefreshCw size={32} className="text-white animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h2 className="text-2xl font-serif-elegant font-bold text-white">{paymentStatus === 'verifying' ? 'Verifying with Bank...' : 'Confirming Order...'}</h2>
          </div>
        </div>
      )}

      {paymentStatus === 'success' && (
        <div className="fixed inset-0 z-[900] bg-white flex items-center justify-center p-6 animate-in zoom-in duration-500">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 animate-bounce shadow-xl shadow-green-100"><CheckCircle2 size={48} /></div>
            <h2 className="text-4xl font-serif-elegant font-bold text-[#2C1B18]">Brew Confirmed!</h2>
            <p className="text-gray-500 font-medium">Your coffee is being prepared with pure passion.</p>
          </div>
        </div>
      )}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLogin={handleLogin} initialMode={loginModalMode} />
      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} onConfirm={confirmPayment} totalAmount={grandTotal} />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
