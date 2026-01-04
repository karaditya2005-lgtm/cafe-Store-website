
import React, { useState } from 'react';
import { ShoppingCart, User, Coffee, Search, ChevronDown, X } from 'lucide-react';
import { Page } from '../types';

interface NavbarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  cartCount: number;
  user: { name: string } | null;
  onOpenLogin: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  activePage, 
  setActivePage, 
  cartCount, 
  user, 
  onOpenLogin,
  searchQuery,
  onSearchChange
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 md:px-6 py-4 flex items-center justify-between shadow-sm">
      {/* Branding Section */}
      <div 
        className="flex items-center gap-2 md:gap-3 cursor-pointer group flex-shrink-0"
        onClick={() => {
          setActivePage(Page.Home);
          onSearchChange('');
        }}
      >
        <div className="bg-[#8B4513] p-2 md:p-2.5 rounded-xl text-white transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-[#8B4513]/20">
          <Coffee size={24} className="md:w-7 md:h-7" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg md:text-2xl font-bengali font-bold text-[#2C1B18] tracking-tight leading-none group-hover:text-[#E63946] transition-colors">
            রাগে অনুরাগে
          </h1>
          <p className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold mt-0.5 md:mt-1">
            Passion in every cup
          </p>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className={`mx-2 md:mx-4 transition-all duration-500 relative flex-1 max-w-[120px] sm:max-w-md ${isSearchFocused ? 'max-w-[180px] sm:max-w-lg' : ''}`}>
        <div className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-2xl border transition-all duration-300 ${isSearchFocused ? 'bg-white border-[#E63946] shadow-md ring-4 ring-[#E63946]/5' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
          <Search size={16} className={isSearchFocused ? 'text-[#E63946]' : 'text-gray-400'} />
          <input 
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (activePage !== Page.Menu && e.target.value.length > 0) {
                setActivePage(Page.Menu);
              }
            }}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="bg-transparent border-none outline-none w-full text-xs md:text-sm font-medium text-[#2C1B18] placeholder:text-gray-400"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              className="text-gray-400 hover:text-[#E63946] transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Desktop Menu */}
      <div className="hidden lg:flex items-center gap-6 text-sm font-bold text-[#5D2E0C] mx-4 flex-shrink-0">
        {[Page.Home, Page.Menu].map((page) => (
          <button
            key={page}
            onClick={() => {
              setActivePage(page);
              if (page === Page.Home) onSearchChange('');
            }}
            className={`capitalize hover:text-[#E63946] transition-all relative py-1 ${
              activePage === page ? 'text-[#E63946]' : ''
            }`}
          >
            {page}
            {activePage === page && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E63946] rounded-full animate-in slide-in-from-left duration-300"></span>
            )}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
        <button 
          className="p-2 md:p-2.5 hover:bg-gray-100 rounded-full text-gray-600 transition-colors relative"
          onClick={() => setActivePage(Page.Cart)}
        >
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span className="absolute top-0.5 right-0.5 bg-[#E63946] text-white text-[9px] font-bold w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full animate-bounce shadow-sm border-2 border-white">
              {cartCount}
            </span>
          )}
        </button>
        
        {user ? (
          <button 
            onClick={() => setActivePage(Page.Profile)}
            className={`flex items-center gap-2 p-1 md:pr-4 rounded-full transition-all border-2 ${
              activePage === Page.Profile ? 'bg-[#2C1B18] text-white border-[#2C1B18]' : 'bg-white border-gray-100 hover:bg-gray-50'
            }`}
          >
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-[#E63946] to-[#D4AF37] flex items-center justify-center text-white text-[10px] md:text-xs font-bold shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs md:text-sm font-bold hidden sm:inline">{user.name}</span>
            <ChevronDown size={14} className="hidden md:inline opacity-50" />
          </button>
        ) : (
          <button 
            onClick={onOpenLogin}
            className="flex items-center gap-2 bg-[#2C1B18] text-white px-3 md:px-5 py-2 md:py-2.5 rounded-full hover:bg-[#5D2E0C] transition-all transform active:scale-95 shadow-lg shadow-[#2C1B18]/10"
          >
            <User size={16} />
            <span className="text-xs md:text-sm font-bold hidden xs:inline">Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
