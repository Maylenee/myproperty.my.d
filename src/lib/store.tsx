import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { ensureDemoAccount, isDemoCredential } from "./demo.functions";
import { decodePhoto, encodePhoto } from "./photos";
import type { AppState, Category, Inquiry, Property, Report, Role, User } from "./types";

const emptyState: AppState = {
  users: [],
  properties: [],
  inquiries: [],
  reports: [],
  categories: [],
  favorites: [],
  recentlyViewed: [],
  currentUserId: null,
};

const ERROR_TEXT = "Terjadi kesalahan. Silakan coba lagi.";

type Result = { ok: boolean; message?: string; user?: User };

interface StoreValue {
  state: AppState;
  hydrated: boolean;
  currentUser: User | null;
  login: (email: string, password: string, role?: Role) => Promise<Result>;
  register: (data: { name: string; email: string; password: string; phone: string; role: Role }) => Promise<
    Result & { needsConfirmation?: boolean }
  >;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (password: string) => Promise<boolean>;
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

/* ---------- row mapping ---------- */

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

function toProperty(r: Row): Property {
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    transaction: r.transaction,
    price: Number(r.price),
    address: r.address,
    province: r.province,
    city: r.city,
    district: r.district,
    landArea: r.land_area,
    buildingArea: r.building_area,
    bedrooms: r.bedrooms,
    bathrooms: r.bathrooms,
    floors: r.floors,
    description: r.description,
    facilities: r.facilities ?? [],
    certificate: r.certificate,
    photos: (r.photos ?? []).map(decodePhoto),
    sellerId: r.seller_id,
    status: r.status,
    views: r.views,
    rejectReason: r.reject_reason ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const propertyColumns: Partial<Record<keyof Property, string>> = {
  name: "name",
  type: "type",
  transaction: "transaction",
  price: "price",
  address: "address",
  province: "province",
  city: "city",
  district: "district",
  landArea: "land_area",
  buildingArea: "building_area",
  bedrooms: "bedrooms",
  bathrooms: "bathrooms",
  floors: "floors",
  description: "description",
  facilities: "facilities",
  certificate: "certificate",
  photos: "photos",
  sellerId: "seller_id",
  status: "status",
  rejectReason: "reject_reason",
};

function toPropertyRow(p: Partial<Property>) {
  const row: Row = {};
  for (const [key, col] of Object.entries(propertyColumns)) {
    const value = p[key as keyof Property];
    if (value === undefined) continue;
    row[col as string] = key === "photos" ? (value as string[]).map(encodePhoto) : value;
  }
  if ("rejectReason" in p && p.rejectReason === undefined) row.reject_reason = null;
  return row;
}

const toInquiry = (r: Row): Inquiry => ({
  id: r.id,
  propertyId: r.property_id,
  sellerId: r.seller_id,
  buyerName: r.buyer_name,
  buyerPhone: r.buyer_phone,
  message: r.message,
  status: r.status,
  createdAt: r.created_at,
});

const toReport = (r: Row): Report => ({
  id: r.id,
  propertyId: r.property_id,
  reporter: r.reporter,
  reason: r.reason,
  status: r.status,
  createdAt: r.created_at,
});

function newId() {
  return crypto.randomUUID();
}

function fail(error: unknown) {
  if (error) {
    console.error(error);
    toast.error(ERROR_TEXT);
  }
}

/* ---------- provider ---------- */

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(emptyState);
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const load = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user ?? null;

    if (user) {
      // Create the profile on first sign-in (after email confirmation).
      const { data: existing } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
      if (!existing) {
        const meta = user.user_metadata ?? {};
        const role: Role = meta.role === "seller" ? "seller" : "buyer";
        await supabase.from("profiles").insert({
          id: user.id,
          name: String(meta.name ?? user.email?.split("@")[0] ?? ""),
          email: user.email ?? "",
          phone: String(meta.phone ?? ""),
          verified: role === "seller" ? false : null,
        });
        await supabase.from("user_roles").insert({ user_id: user.id, role });
      }
    }

    const [cats, profiles, roles, props, inqs, reps, favs, recent] = await Promise.all([
      supabase.from("categories").select("*").order("id"),
      supabase.from("profiles").select("*"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("properties").select("*").order("created_at", { ascending: false }),
      user ? supabase.from("inquiries").select("*").order("created_at", { ascending: false }) : null,
      user ? supabase.from("reports").select("*").order("created_at", { ascending: false }) : null,
      user ? supabase.from("favorites").select("property_id").order("created_at", { ascending: false }) : null,
      user
        ? supabase.from("recently_viewed").select("property_id").order("viewed_at", { ascending: false }).limit(12)
        : null,
    ]);

    const roleById = new Map<string, Role>();
    for (const r of roles.data ?? []) {
      const prev = roleById.get(r.user_id);
      if (!prev || r.role === "admin") roleById.set(r.user_id, r.role as Role);
    }
    const users: User[] = (profiles.data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      phone: p.phone,
      role: roleById.get(p.id) ?? "buyer",
      bio: p.bio ?? undefined,
      photo: p.photo ?? undefined,
      verified: p.verified ?? undefined,
      createdAt: p.created_at,
    }));

    setState((s) => ({
      users,
      categories: (cats.data ?? []) as Category[],
      properties: (props.data ?? []).map(toProperty),
      inquiries: (inqs?.data ?? []).map(toInquiry),
      reports: (reps?.data ?? []).map(toReport),
      favorites: user ? (favs?.data ?? []).map((f) => f.property_id) : s.currentUserId ? [] : s.favorites,
      recentlyViewed: user
        ? (recent?.data ?? []).map((f) => f.property_id)
        : s.currentUserId
          ? []
          : s.recentlyViewed,
      currentUserId: user?.id ?? null,
    }));
    setHydrated(true);
  }, []);

  useEffect(() => {
    void load();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setTimeout(() => void load(), 0);
      }
    });
    return () => data.subscription.unsubscribe();
  }, [load]);

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) ?? null,
    [state.users, state.currentUserId],
  );

  const login = useCallback<StoreValue["login"]>(
    async (email, password, role) => {
      const cleanEmail = email.trim().toLowerCase();
      let { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error && isDemoCredential(cleanEmail, password)) {
        const created = await ensureDemoAccount({ data: { email: cleanEmail } });
        if (created.ok) ({ data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password }));
      }
      if (error || !data.user) {
        if (error && /confirm/i.test(error.message)) {
          return { ok: false, message: "Email belum dikonfirmasi. Cek kotak masuk email Anda." };
        }
        return { ok: false, message: "Email atau kata sandi tidak sesuai." };
      }
      await load();
      const user = stateRef.current.users.find((u) => u.id === data.user!.id);
      if (role && user?.role !== role) {
        await supabase.auth.signOut();
        return { ok: false, message: "Akun ini tidak memiliki akses ke halaman tersebut." };
      }
      return { ok: true, user };
    },
    [load],
  );

  const register = useCallback<StoreValue["register"]>(
    async (data) => {
      const { data: res, error } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: { name: data.name.trim(), phone: data.phone.trim(), role: data.role },
        },
      });
      if (error) {
        if (/registered|exists/i.test(error.message)) return { ok: false, message: "Email sudah terdaftar. Silakan masuk." };
        if (/password/i.test(error.message)) return { ok: false, message: "Kata sandi terlalu lemah. Gunakan kombinasi yang lebih kuat." };
        return { ok: false, message: ERROR_TEXT };
      }
      if (!res.session) return { ok: true, needsConfirmation: true };
      await load();
      return { ok: true, user: stateRef.current.users.find((u) => u.id === res.user?.id) };
    },
    [load],
  );

  const logout = useCallback(() => {
    setState((s) => ({ ...s, currentUserId: null, favorites: [], recentlyViewed: [], inquiries: [], reports: [] }));
    void supabase.auth.signOut();
  }, []);

  const updateProfile = useCallback<StoreValue["updateProfile"]>((patch) => {
    const id = stateRef.current.currentUserId;
    if (!id) return;
    setState((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) }));
    const row: Row = {};
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.phone !== undefined) row.phone = patch.phone;
    if (patch.bio !== undefined) row.bio = patch.bio;
    if (patch.photo !== undefined) row.photo = patch.photo;
    void supabase.from("profiles").update(row).eq("id", id).then(({ error }) => fail(error));
  }, []);

  const requestPasswordReset = useCallback<StoreValue["requestPasswordReset"]>(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return !error;
  }, []);

  const resetPassword = useCallback<StoreValue["resetPassword"]>(async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    return !error;
  }, []);

  const toggleFavorite = useCallback<StoreValue["toggleFavorite"]>((propertyId) => {
    const s = stateRef.current;
    const exists = s.favorites.includes(propertyId);
    setState((prev) => ({
      ...prev,
      favorites: exists ? prev.favorites.filter((id) => id !== propertyId) : [propertyId, ...prev.favorites],
    }));
    if (s.currentUserId) {
      const q = exists
        ? supabase.from("favorites").delete().eq("user_id", s.currentUserId).eq("property_id", propertyId)
        : supabase.from("favorites").insert({ user_id: s.currentUserId, property_id: propertyId });
      void q.then(({ error }) => fail(error));
    }
    return !exists;
  }, []);

  const isFavorite = useCallback((propertyId: string) => state.favorites.includes(propertyId), [state.favorites]);

  const viewProperty = useCallback<StoreValue["viewProperty"]>((propertyId) => {
    const userId = stateRef.current.currentUserId;
    setState((s) => ({
      ...s,
      recentlyViewed: [propertyId, ...s.recentlyViewed.filter((id) => id !== propertyId)].slice(0, 12),
      properties: s.properties.map((p) => (p.id === propertyId ? { ...p, views: p.views + 1 } : p)),
    }));
    void supabase.rpc("increment_property_view", { _property_id: propertyId });
    if (userId) {
      void supabase
        .from("recently_viewed")
        .upsert({ user_id: userId, property_id: propertyId, viewed_at: new Date().toISOString() });
    }
  }, []);

  const createProperty = useCallback<StoreValue["createProperty"]>((data) => {
    const iso = new Date().toISOString();
    const property: Property = { ...data, id: newId(), views: 0, createdAt: iso, updatedAt: iso };
    setState((s) => ({ ...s, properties: [property, ...s.properties] }));
    void supabase
      .from("properties")
      .insert({ id: property.id, ...toPropertyRow(property) } as never)
      .then(({ error }) => fail(error));
    return property;
  }, []);

  const updateProperty = useCallback<StoreValue["updateProperty"]>(
    (id, patch) => {
      setState((s) => ({
        ...s,
        properties: s.properties.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p)),
      }));
      void supabase
        .from("properties")
        .update(toPropertyRow(patch))
        .eq("id", id)
        .then(({ error }) => {
          if (error) {
            fail(error);
            void load();
          }
        });
    },
    [load],
  );

  const deleteProperty = useCallback<StoreValue["deleteProperty"]>((id) => {
    setState((s) => ({
      ...s,
      properties: s.properties.filter((p) => p.id !== id),
      favorites: s.favorites.filter((f) => f !== id),
      recentlyViewed: s.recentlyViewed.filter((f) => f !== id),
      inquiries: s.inquiries.filter((i) => i.propertyId !== id),
      reports: s.reports.filter((r) => r.propertyId !== id),
    }));
    void supabase.from("properties").delete().eq("id", id).then(({ error }) => fail(error));
  }, []);

  const sendInquiry = useCallback<StoreValue["sendInquiry"]>((data) => {
    const inquiry: Inquiry = { ...data, id: newId(), status: "baru", createdAt: new Date().toISOString() };
    setState((s) => ({ ...s, inquiries: [inquiry, ...s.inquiries] }));
    void supabase
      .from("inquiries")
      .insert({
        id: inquiry.id,
        property_id: data.propertyId,
        seller_id: data.sellerId,
        buyer_id: stateRef.current.currentUserId,
        buyer_name: data.buyerName,
        buyer_phone: data.buyerPhone,
        message: data.message,
      })
      .then(({ error }) => fail(error));
  }, []);

  const markInquiryRead = useCallback<StoreValue["markInquiryRead"]>((id) => {
    setState((s) => ({ ...s, inquiries: s.inquiries.map((i) => (i.id === id ? { ...i, status: "dibaca" } : i)) }));
    void supabase.from("inquiries").update({ status: "dibaca" }).eq("id", id).then(({ error }) => fail(error));
  }, []);

  const verifySeller = useCallback<StoreValue["verifySeller"]>((id, verified) => {
    setState((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, verified } : u)) }));
    void supabase.from("profiles").update({ verified }).eq("id", id).then(({ error }) => fail(error));
  }, []);

  const saveCategory = useCallback<StoreValue["saveCategory"]>((category) => {
    setState((s) => {
      const exists = s.categories.some((c) => c.id === category.id);
      return {
        ...s,
        categories: exists ? s.categories.map((c) => (c.id === category.id ? category : c)) : [...s.categories, category],
      };
    });
    void supabase.from("categories").upsert(category).then(({ error }) => fail(error));
  }, []);

  const deleteCategory = useCallback<StoreValue["deleteCategory"]>((id) => {
    setState((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) }));
    void supabase.from("categories").delete().eq("id", id).then(({ error }) => fail(error));
  }, []);

  const addReport = useCallback<StoreValue["addReport"]>((data) => {
    const report: Report = { ...data, id: newId(), status: "pending", createdAt: new Date().toISOString() };
    setState((s) => ({ ...s, reports: [report, ...s.reports] }));
    void supabase
      .from("reports")
      .insert({ id: report.id, property_id: data.propertyId, reporter: data.reporter, reason: data.reason })
      .then(({ error }) => fail(error));
  }, []);

  const resolveReport = useCallback<StoreValue["resolveReport"]>((id, status) => {
    setState((s) => ({ ...s, reports: s.reports.map((r) => (r.id === id ? { ...r, status } : r)) }));
    void supabase.from("reports").update({ status }).eq("id", id).then(({ error }) => fail(error));
  }, []);

  const resetData = useCallback(() => {
    void load();
  }, [load]);

  const value: StoreValue = {
    state,
    hydrated,
    currentUser,
    login,
    register,
    logout,
    updateProfile,
    requestPasswordReset,
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
