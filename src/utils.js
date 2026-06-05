const STORAGE_KEY = "user";

export const saveSession = (user, rememberMe = false) => {
  const data = JSON.stringify(user);
  if (rememberMe) {
    localStorage.setItem(STORAGE_KEY, data);
  }
  sessionStorage.setItem(STORAGE_KEY, data);
};

export const getSession = () => {
  const raw =
    localStorage.getItem(STORAGE_KEY) ||
    sessionStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const removeSession = () => {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
};

export const isAuthenticated = () => {
  return !!getSession();
};

export const isAdmin = () => {
  return getSession()?.role === "admin";
};
