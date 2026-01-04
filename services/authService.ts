
import { db } from './db';

/**
 * Decodes a Google JWT without external libraries
 */
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const authService = {
  /**
   * Processes Google Identity Services Credential
   */
  async handleGoogleCallback(credential: string) {
    const payload = parseJwt(credential);
    if (!payload) throw new Error('Invalid Google Credential');

    const userData = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      points: 500, // New user bonus
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };

    db.saveUser(userData);
    db.setSession(userData);
    return userData;
  },

  async login(email: string, name?: string) {
    const users = db.getUsers();
    let user = users.find((u: any) => u.email === email);

    if (!user) {
      user = {
        name: name || email.split('@')[0],
        email,
        points: 100,
        memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      };
      db.saveUser(user);
    }

    db.setSession(user);
    return user;
  },

  logout() {
    db.clearSession();
  },

  checkSession() {
    return db.getCurrentSession();
  }
};
