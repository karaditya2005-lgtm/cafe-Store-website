
export interface Coffee {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Classic' | 'Specialty' | 'Iced' | 'Seasonal';
  image: string;
  rating: number;
  prepTime: string;
}

export interface CartItem extends Coffee {
  quantity: number;
  selectedSize: 'Small' | 'Medium' | 'Large';
}

export enum Page {
  Home = 'home',
  Menu = 'menu',
  Cart = 'cart',
  Profile = 'profile'
}

export type PaymentMethod = 'COD' | 'UPI' | 'CreditCard' | 'DebitCard' | 'NetBanking';
