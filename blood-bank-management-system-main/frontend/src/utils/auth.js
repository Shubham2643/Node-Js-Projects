import { toast } from "react-hot-toast";

// Token management
export const setAuthToken = (token) => {
  localStorage.setItem("token", token);
};

export const getAuthToken = () => {
  return localStorage.getItem("token");
};

export const removeAuthToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const setUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

export const isAuthenticated = () => {
  return !!getAuthToken() && isTokenValid();
};

export const isTokenValid = () => {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Date.now() / 1000;

    return payload.exp > currentTime;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};

export const handleAuthError = (navigate) => {
  removeAuthToken();
  toast.error("Session expired. Please login again.");
  navigate("/login");
};

// API helper with auth header and retry logic
export const apiRequest = async (url, options = {}, navigate, retries = 3) => {
  const token = getAuthToken();

  if (!token || !isTokenValid()) {
    handleAuthError(navigate);
    throw new Error("No valid authentication token found");
  }

  const defaultHeaders = {
    Authorization: `Bearer ${token}`,
  };

  // Don't set Content-Type for FormData
  if (!(options.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  const requestOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.log("Authentication failed, clearing token");
          handleAuthError(navigate);
          throw new Error("Authentication failed");
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`,
        );
      }

      return response;
    } catch (error) {
      lastError = error;
      if (error.message.includes("Authentication failed")) {
        throw error;
      }
      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, i) * 1000),
      );
    }
  }

  throw lastError;
};

// WebSocket connection manager
export class WebSocketManager {
  constructor(url, token, onMessage, onError) {
    this.url = url;
    this.token = token;
    this.onMessage = onMessage;
    this.onError = onError;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
  }

  connect() {
    try {
      this.ws = new WebSocket(`${this.url}?token=${this.token}`);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessage(data);
        } catch (error) {
          console.error("WebSocket message parse error:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        if (this.onError) {
          this.onError(error);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.reconnect();
      };
    } catch (error) {
      console.error("WebSocket connection error:", error);
      this.reconnect();
    }
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectTimeout = setTimeout(
        () => {
          this.reconnectAttempts++;
          console.log(
            `Reconnecting WebSocket (attempt ${this.reconnectAttempts})`,
          );
          this.connect();
        },
        Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000),
      );
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error("WebSocket not connected");
    }
  }
}

// Cache manager for real-time data
export class CacheManager {
  constructor(ttl = 5 * 60 * 1000) {
    // 5 minutes default TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  invalidate(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

// Export utility functions
export const logout = () => {
  removeAuthToken();
  window.location.href = "/login";
};
