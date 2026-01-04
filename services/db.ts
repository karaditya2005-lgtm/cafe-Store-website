
/**
 * Mock Backend Database Service
 * Persists data to LocalStorage to simulate a real database.
 */

const DB_KEYS = {
  USERS: 'rage_anurage_users',
  ORDERS: 'rage_anurage_orders',
  CURRENT_USER: 'rage_anurage_session'
};

export const db = {
  getUsers: () => JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]'),
  
  saveUser: (user: any) => {
    const users = db.getUsers();
    const existingIndex = users.findIndex((u: any) => u.email === user.email);
    if (existingIndex > -1) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.push(user);
    }
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  },

  getCurrentSession: () => JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_USER) || 'null'),

  setSession: (user: any) => {
    localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  clearSession: () => {
    localStorage.removeItem(DB_KEYS.CURRENT_USER);
  },

  saveOrder: (order: any) => {
    const orders = JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
    orders.push({ ...order, timestamp: new Date().toISOString() });
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
  },

  getOrdersByEmail: (email: string) => {
    const orders = JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
    return orders.filter((o: any) => o.userEmail === email);
  }
};
