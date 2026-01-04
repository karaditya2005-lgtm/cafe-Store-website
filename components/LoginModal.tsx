
import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, ChevronRight, AlertCircle, User as UserIcon, ShieldCheck, Fingerprint, Sparkles } from 'lucide-react';
import { authService } from '../services/authService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: any) => void;
  initialMode?: 'login' | 'signup';
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, initialMode = 'login' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID_HERE.apps.googleusercontent.com";

  useEffect(() => {
    const google = (window as any).google;
    if (isOpen && google) {
      try {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            setIsLoggingIn(true);
            setAuthError(null);
            try {
              const userData = await authService.handleGoogleCallback(response.credential);
              onLogin(userData);
            } catch (error) {
              setAuthError('Google authentication failed. Please try again.');
            } finally {
              setIsLoggingIn(false);
            }
          },
          auto_select: false,
          itp_support: true,
          cancel_on_tap_outside: true,
        });

        google.accounts.id.prompt();

        if (googleBtnRef.current) {
          google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_blue',
            size: 'large',
            width: googleBtnRef.current.offsetWidth || 340,
            shape: 'pill',
            text: 'continue_with',
            logo_alignment: 'left'
          });
        }
      } catch (err) {
        console.warn("Google Identity Services failed to load.");
      }
    }
  }, [isOpen, GOOGLE_CLIENT_ID]);

  useEffect(() => {
    if (isOpen) {
      setIsSignUp(initialMode === 'signup');
      setAuthError(null);
      setIsLoggingIn(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const userData = await authService.login(email, isSignUp ? name : undefined);
      onLogin(userData);
    } catch (error) {
      setAuthError('Invalid credentials. Please try again. (ভুল তথ্য, আবার চেষ্টা করুন)');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSimulatedGoogleLogin = () => {
    setIsLoggingIn(true);
    setTimeout(() => {
      const mockGoogleUser = {
        name: "Aditya Kar",
        email: "karaditya2005@gmail.com",
        picture: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150",
        points: 1250,
        memberSince: "February 2025"
      };
      onLogin(mockGoogleUser);
      setIsLoggingIn(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[#1a110f]/90 backdrop-blur-xl animate-in fade-in duration-700"
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-lg rounded-[3.5rem] overflow-hidden shadow-[0_40px_100px_-15px_rgba(0,0,0,0.6)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        {/* Left Side Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#E63946]/10 to-transparent blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#D4AF37]/10 to-transparent blur-3xl rounded-full -ml-32 -mb-32 pointer-events-none" />

        {/* Header Section */}
        <div className="bg-[#2C1B18] p-12 text-white relative overflow-hidden">
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          
          <button 
            onClick={onClose}
            className="absolute top-10 right-10 text-white/20 hover:text-white transition-all hover:rotate-90 z-20 p-2 hover:bg-white/5 rounded-full"
          >
            <X size={24} />
          </button>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-tr from-[#E63946] to-[#D4AF37] p-2.5 rounded-2xl shadow-lg shadow-[#E63946]/20">
                <Fingerprint size={28} className="text-white" />
              </div>
              <div className="h-px w-12 bg-white/20 rounded-full" />
            </div>
            
            <h2 className="text-4xl font-serif-elegant font-bold tracking-tight">
              {isSignUp ? (
                <>New Journey <span className="text-white/40 block text-lg font-sans font-normal mt-1">(নতুন যাত্রা)</span></>
              ) : (
                <>Welcome Back <span className="text-white/40 block text-lg font-sans font-normal mt-1">(স্বাগতম)</span></>
              )}
            </h2>
            <p className="text-white/50 text-base font-medium max-w-xs leading-relaxed">
              {isSignUp ? 'Begin your story with রাগে অনুরাগে.' : 'Your favorite passion brew is just a few clicks away.'}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-12 space-y-10 bg-white">
          {authError && (
            <div className="bg-red-50 border border-red-100 p-5 rounded-[2rem] flex items-center gap-4 text-red-600 text-sm animate-in slide-in-from-top-4 duration-500 shadow-sm">
              <div className="bg-red-100 p-2 rounded-xl">
                <AlertCircle size={20} />
              </div>
              <span className="font-bold">{authError}</span>
            </div>
          )}

          {/* Social Auth */}
          <div className="space-y-4">
            <div ref={googleBtnRef} className="w-full flex justify-center min-h-[50px]"></div>
            
            <button 
              onClick={handleSimulatedGoogleLogin}
              className="w-full py-5 px-6 border border-gray-100 rounded-[1.8rem] flex items-center justify-center gap-4 text-gray-700 text-sm font-black bg-white hover:bg-gray-50 transition-all active:scale-[0.98] shadow-sm hover:shadow-md hover:border-gray-200 group"
            >
              <img src="https://www.gstatic.com/images/branding/googleg/80/googleg_standard_color_128dp.png" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
              Continue with Google (গুগল দিয়ে প্রবেশ করুন)
            </button>
            
            <div className="relative flex items-center justify-center w-full py-4">
              <div className="absolute w-full h-px bg-gray-100"></div>
              <span className="relative bg-white px-8 text-[11px] text-gray-300 uppercase tracking-[0.4em] font-black">Or secure entry</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {isSignUp && (
                <div className="relative group animate-in slide-in-from-left-4 duration-500 delay-75">
                  <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#E63946] transition-all" size={20} />
                  <input 
                    type="text" 
                    placeholder="Full Name (পূর্ণ নাম)"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E63946]/20 focus:bg-white rounded-[2rem] py-5.5 pl-16 pr-8 outline-none transition-all text-[#2C1B18] font-bold placeholder:font-medium placeholder:text-gray-300 text-sm shadow-sm hover:bg-gray-100/50"
                  />
                </div>
              )}
              
              <div className="relative group animate-in slide-in-from-left-4 duration-500 delay-100">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#E63946] transition-all" size={20} />
                <input 
                  type="email" 
                  placeholder="Email Address (ইমেইল ঠিকানা)"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E63946]/20 focus:bg-white rounded-[2rem] py-5.5 pl-16 pr-8 outline-none transition-all text-[#2C1B18] font-bold placeholder:font-medium placeholder:text-gray-300 text-sm shadow-sm hover:bg-gray-100/50"
                />
              </div>

              <div className="relative group animate-in slide-in-from-left-4 duration-500 delay-150">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#E63946] transition-all" size={20} />
                <input 
                  type="password" 
                  placeholder="Secret Password (গোপন পাসওয়ার্ড)"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#E63946]/20 focus:bg-white rounded-[2rem] py-5.5 pl-16 pr-8 outline-none transition-all text-[#2C1B18] font-bold placeholder:font-medium placeholder:text-gray-300 text-sm shadow-sm hover:bg-gray-100/50"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#E63946] text-white py-6 rounded-[2.2rem] font-black text-xl hover:bg-[#2C1B18] transition-all transform active:scale-95 shadow-[0_20px_40px_-10px_rgba(230,57,70,0.3)] flex items-center justify-center gap-4 disabled:opacity-70 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              {isLoggingIn ? (
                <div className="w-7 h-7 border-[4px] border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="relative z-10 flex items-center gap-2">
                    {isSignUp ? 'Create Passion Account' : 'Step into Passion'}
                    <span className="text-white/40 text-sm font-normal">({isSignUp ? 'অ্যাকাউন্ট খুলুন' : 'প্রবেশ করুন'})</span>
                  </span>
                  <ChevronRight size={24} className="group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="flex flex-col items-center gap-6 pt-2">
             <div className="flex flex-col items-center gap-2">
               <p className="text-center text-sm font-medium text-gray-400">
                 {isSignUp ? 'Already have an account? (অ্যাকাউন্ট আছে?)' : "Don't have an account? (অ্যাকাউন্ট নেই?)"} 
               </p>
               <button 
                 type="button"
                 onClick={() => setIsSignUp(!isSignUp)}
                 className="text-[#E63946] font-black text-base hover:underline flex items-center gap-2 group/switch"
               >
                 <Sparkles size={16} className="text-[#D4AF37] group-hover:rotate-12 transition-transform" />
                 {isSignUp ? 'Sign In Now (প্রবেশ করুন)' : 'Join Us Today (নিবন্ধন করুন)'}
               </button>
             </div>
             
             <div className="flex items-center gap-2 text-[11px] text-gray-300 uppercase tracking-[0.3em] font-black border-t border-gray-50 pt-6 w-full justify-center">
               <ShieldCheck size={14} className="text-green-400/50" /> Secure 256-bit Encrypted
             </div>
          </div>
        </div>
      </div>

      <style>{`
        input::placeholder {
          transition: all 0.3s ease;
        }
        input:focus::placeholder {
          opacity: 0;
          transform: translateX(10px);
        }
        .py-5\.5 {
          padding-top: 1.375rem;
          padding-bottom: 1.375rem;
        }
      `}</style>
    </div>
  );
};

export default LoginModal;
