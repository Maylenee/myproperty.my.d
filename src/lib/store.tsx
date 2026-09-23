import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { initialState } from "./mock-data";
import type { AppState, Category, Inquiry, Property, Report, Role, User } from "./types";

const STORAGE_KEY = "myproperty-state-v1";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

interface StoreValue {
  state: AppState;
  hydrated: boolean;
  currentUser: User | null;
  login: (email: string, password: string, role?: Role) => { ok: boolean; message?: string; user?: User };
  register: (data: { name: string; email: string; password: string; phone: string; role: Role }) => {
    ok: boolean;
    message?: string;
    user?: User;
  };
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
  resetPassword: (email: string, password: string) => boolean;
  toggleFavorite: (propertyId: string) => boolean;
  isFavorite: (propertyId: string) => boolean;
  viewProperty: (propertyId: string) => void;
  createProperty: (data: Omit<Property, "id" | "views" | "createdAt" | "updatedAt">) => Property;
  updateProperty: (id: string, patch: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  sendInquiry: (data: Omit<Inquiry, "id" | "createdAt" | "status">) => void;
  markInquiryRead: (id: string) => void;
  verifySeller: (id: string, verified: boolean) => void;
  saveCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  addReport: (data: Omit<Report, "id" | "createdAt" | "status">) => void;
  resolveReport: (id: string, status: Report["status"]) => void;
  resetData: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        setState({ ...initialState, ...parsed });
      }
    } catch {
      /* abaikan data lama yang tidak valid */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* penyimpanan penuh, abaikan */
    }
  }, [state, hydrated]);

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) ?? null,
    [state.users, state.currentUserId],
  );

  const login = useCallback<StoreValue["login"]>(
    (email, password, role) => {
      const user = state.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user || user.password !== password) {
        return { ok: false, message: "Email atau kata sandi tidak sesuai." };
      }
      if (role && user.role !== role) {
        return { ok: false, message: "Akun ini tidak memiliki akses ke halaman tersebut." };
      }
      setState((s) => ({ ...s, currentUserId: user.id }));
      return { ok: true, user };
    },
    [state.users],
  );

  const register = useCallback<StoreValue["register"]>(
    (data) => {
      if (state.users.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
        return { ok: false, message: "Email sudah terdaftar. Silakan masuk." };
      }
      const user: User = {
        id: uid("u"),
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        phone: data.phone.trim(),
        role: data.role,
        verified: data.role === "seller" ? false : undefined,
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({ ...s, users: [...s.users, user], currentUserId: user.id }));
      return { ok: true, user };
    },
    [state.users],
  );

  const logout = useCallback(() => setState((s) => ({ ...s, currentUserId: null })), []);

  const updateProfile = useCallback<StoreValue["updateProfile"]>((patch) => {
    setState((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === s.currentUserId ? { ...u, ...patch } : u)),
    }));
  }, []);

  const resetPassword = useCallback<StoreValue["resetPassword"]>((email, password) => {
    let found = false;
    setState((s) => {
      const users = s.users.map((u) => {
        if (u.email.toLowerCase() === email.trim().toLowerCase()) {
          found = true;
          return { ...u, password };
        }
        return u;
      });
      return { ...s, users };
    });
    return found;
  }, []);

  const toggleFavorite = useCallback<StoreValue["toggleFavorite"]>((propertyId) => {
    let saved = false;
    setState((s) => {
      const exists = s.favorites.includes(propertyId);
      saved = !exists;
      return {
        ...s,
        favorites: exists ? s.favorites.filter((id) => id !== propertyId) : [propertyId, ...s.favorites],
      };
    });
    return saved;
  }, []);

  const isFavorite = useCallback(
    (propertyId: string) => state.favorites.includes(propertyId),
    [state.favorites],
  );

  const viewProperty = useCallback<StoreValue["viewProperty"]>((propertyId) => {
    setState((s) => ({
      ...s,
      recentlyViewed: [propertyId, ...s.recentlyViewed.filter((id) => id !== propertyId)].slice(0, 12),
      properties: s.properties.map((p) => (p.id === propertyId ? { ...p, views: p.views + 1 } : p)),
    }));
  }, []);

  const createProperty = useCallback<StoreValue["createProperty"]>((data) => {
    const iso = new Date().toISOString();
    const property: Property = { ...data, id: uid("p"), views: 0, createdAt: iso, updatedAt: iso };
    setState((s) => ({ ...s, properties: [property, ...s.properties] }));
    return property;
  }, []);

  const updateProperty = useCallback<StoreValue["updateProperty"]>((id, patch) => {
    setState((s) => ({
      ...s,
      properties: s.properties.map((p) =>
        p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
      ),
    }));
  }, []);

  const deleteProperty = useCallback<StoreValue["deleteProperty"]>((id) => {
    setState((s) => ({
      ...s,
      properties: s.properties.filter((p) => p.id !== id),
      favorites: s.favorites.filter((f) => f !== id),
      recentlyViewed: s.recentlyViewed.filter((f) => f !== id),
      inquiries: s.inquiries.filter((i) => i.propertyId !== id),
      reports: s.reports.filter((r) => r.propertyId !== id),
    }));
  }, []);

  const sendInquiry = useCallback<StoreValue["sendInquiry"]>((data) => {
    const inquiry: Inquiry = {
      ...data,
      id: uid("i"),
      status: "baru",
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, inquiries: [inquiry, ...s.inquiries] }));
  }, []);

  const markInquiryRead = useCallback<StoreValue["markInquiryRead"]>((id) => {
    setState((s) => ({
      ...s,
      inquiries: s.inquiries.map((i) => (i.id === id ? { ...i, status: "dibaca" } : i)),
    }));
  }, []);

  const verifySeller = useCallback<StoreValue["verifySeller"]>((id, verified) => {
    setState((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, verified } : u)) }));
  }, []);

  const saveCategory = useCallback<StoreValue["saveCategory"]>((category) => {
    setState((s) => {
      const exists = s.categories.some((c) => c.id === category.id);
      return {
        ...s,
        categories: exists
          ? s.categories.map((c) => (c.id === category.id ? category : c))
          : [...s.categories, category],
      };
    });
  }, []);

  const deleteCategory = useCallback<StoreValue["deleteCategory"]>((id) => {
    setState((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) }));
  }, []);

  const addReport = useCallback<StoreValue["addReport"]>((data) => {
    const report: Report = {
      ...data,
      id: uid("r"),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, reports: [report, ...s.reports] }));
  }, []);

  const resolveReport = useCallback<StoreValue["resolveReport"]>((id, status) => {
    setState((s) => ({ ...s, reports: s.reports.map((r) => (r.id === id ? { ...r, status } : r)) }));
  }, []);

  const resetData = useCallback(() => {
    setState(initialState);
  }, []);

  const value: StoreValue = {
    state,
    hydrated,
    currentUser,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    toggleFavorite,
    isFavorite,
    viewProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    sendInquiry,
    markInquiryRead,
    verifySeller,
    saveCategory,
    deleteCategory,
    addReport,
    resolveReport,
    resetData,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore harus dipakai di dalam StoreProvider");
  return ctx;
}

export const PUBLIC_STATUSES: Property["status"][] = ["aktif", "terjual", "disewa"];

export function isPublic(property: Property) {
  return PUBLIC_STATUSES.includes(property.status);
}
