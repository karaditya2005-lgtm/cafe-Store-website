
import React, { useState } from 'react';
import { X, Banknote, Smartphone, CreditCard, Building2, ChevronRight, CheckCircle2 } from 'lucide-react';
import { PaymentMethod } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: PaymentMethod) => void;
  totalAmount: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onConfirm, totalAmount }) => {
  const [selected, setSelected] = useState<PaymentMethod>('UPI');

  if (!isOpen) return null;

  const methods: { id: PaymentMethod; label: string; icon: React.ReactNode; description: string }[] = [
    { 
      id: 'COD', 
      label: 'Cash on Delivery', 
      icon: <Banknote size={24} />, 
      description: 'Pay when your coffee arrives' 
    },
    { 
      id: 'UPI', 
      label: 'UPI (GPay, PhonePe, etc.)', 
      icon: <Smartphone size={24} />, 
      description: 'Instant & Secure digital payment' 
    },
    { 
      id: 'CreditCard', 
      label: 'Credit Card', 
      icon: <CreditCard size={24} />, 
      description: 'Visa, Mastercard, Amex' 
    },
    { 
      id: 'DebitCard', 
      label: 'Debit Card', 
      icon: <CreditCard size={24} />, 
      description: 'All major banks supported' 
    },
    { 
      id: 'NetBanking', 
      label: 'Net Banking', 
      icon: <Building2 size={24} />, 
      description: 'Secure bank login' 
    },
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[#2C1B18]/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="bg-[#2C1B18] p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-3xl font-serif-elegant font-bold mb-2">Checkout</h2>
          <p className="text-white/60">Choose your preferred way to pay</p>
        </div>

        <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
          {methods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelected(method.id)}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all group ${
                selected === method.id 
                ? 'border-[#E63946] bg-[#E63946]/5' 
                : 'border-gray-100 hover:border-gray-200 bg-gray-50'
              }`}
            >
              <div className={`p-3 rounded-xl transition-colors relative group/icon ${
                selected === method.id ? 'bg-[#E63946] text-white' : 'bg-white text-gray-400'
              }`}>
                {method.icon}
                
                {/* Tooltip implementation */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#2C1B18] text-white text-[10px] font-bold rounded-lg shadow-xl opacity-0 group-hover/icon:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 transform translate-y-2 group-hover/icon:translate-y-0">
                  {method.label}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#2C1B18] rotate-45"></div>
                </div>
              </div>
              <div className="flex-1 text-left">
                <p className={`font-bold ${selected === method.id ? 'text-[#E63946]' : 'text-[#2C1B18]'}`}>
                  {method.label}
                </p>
                <p className="text-xs text-gray-500">{method.description}</p>
              </div>
              {selected === method.id && (
                <CheckCircle2 size={20} className="text-[#E63946] animate-in zoom-in duration-200" />
              )}
            </button>
          ))}
        </div>

        <div className="p-8 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-500 font-semibold">To Pay</span>
            <span className="text-2xl font-bold text-[#2C1B18]">₹{totalAmount}</span>
          </div>
          <button 
            onClick={() => onConfirm(selected)}
            className="w-full bg-[#2C1B18] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#E63946] transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
          >
            Confirm & Pay <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
