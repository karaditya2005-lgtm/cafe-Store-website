
import React, { useState } from 'react';
import { Sparkles, Send, Coffee as CoffeeIcon } from 'lucide-react';
import { getAIRecommendation } from '../services/geminiService';

const AIBarista: React.FC = () => {
  const [mood, setMood] = useState('');
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!mood.trim()) return;
    setLoading(true);
    const rec = await getAIRecommendation(mood);
    setRecommendation(rec);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-[#2C1B18] to-[#5D2E0C] p-8 md:p-12 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 blur-[80px] -mr-32 -mt-32 rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E63946]/10 blur-[80px] -ml-32 -mb-32 rounded-full"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6 text-[#D4AF37]">
            <Sparkles size={18} />
            <span className="text-xs font-bold tracking-widest uppercase">Gemini AI Assistant</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif-elegant font-bold mb-4 leading-tight">
            The AI Barista Knows Your Soul.
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-lg">
            Tell us how you're feeling today, and we'll brew the perfect recommendation to match your passion.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="e.g., I'm feeling romantic and adventurous..."
              className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all text-white placeholder:text-white/40"
            />
            <button 
              onClick={handleAsk}
              disabled={loading}
              className="bg-[#D4AF37] text-[#2C1B18] font-bold px-8 py-4 rounded-2xl hover:bg-white transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#2C1B18] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send size={18} />
                  <span>Brew Idea</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="w-full md:w-80 bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 min-h-[200px] flex flex-col items-center justify-center text-center">
          {recommendation ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-white/20 p-3 rounded-full mb-4 inline-block">
                <CoffeeIcon size={32} className="text-[#D4AF37]" />
              </div>
              <p className="italic text-white/90 font-serif-elegant leading-relaxed">
                "{recommendation}"
              </p>
            </div>
          ) : (
            <div className="text-white/30">
              <CoffeeIcon size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm">Enter your mood to see the AI Barista's pick.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIBarista;
