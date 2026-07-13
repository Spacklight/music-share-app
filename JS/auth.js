// Handles register/login/session via the Apps Script backend.
// No GitHub token ever touches the browser.

const AUTH = {
  SESSION_KEY: "musicshare_session",
  USERNAME_KEY: "musicshare_username",

  getSessionToken() {
    return localStorage.getItem(this.SESSION_KEY);
  },

  getUsername() {
    return localStorage.getItem(this.USERNAME_KEY);
  },

  isLoggedIn() {
    return !!this.getSessionToken();
  },

  saveSession(sessionToken, username) {
    localStorage.setItem(this.SESSION_KEY, sessionToken);
    localStorage.setItem(this.USERNAME_KEY, username);
  },

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
  },

  async register(username, password) {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "register", username, password })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Registration failed");
    return data;
  },

  async login(username, password) {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "login", username, password })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Login failed");
    this.saveSession(data.sessionToken, data.username);
    return data;
  }
};
