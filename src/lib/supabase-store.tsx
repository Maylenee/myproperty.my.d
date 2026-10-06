import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import { supabase } from "./supabase";
import type {
  User,
  Property,
  Inquiry,
  Report,
  Category,
  Favorite,
  RecentlyViewed,
  Role,
  TransactionType,
  PropertyStatus,
  AppState,
} from "./db-types";

const STORAGE_KEY = "myproperty-state-v1";

interface SupabaseStoreValue {
  state: AppState;
  hydrated: boolean;
  loading: boolean;
  currentUser: User | null;
  login: (
    email: string,
    password: string,
    role?: Role,
  ) => Promise<{ ok: boolean; message?: string; user?: User }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: Role;
  }) => Promise<{ ok: boolean; message?: string; user?: User }>;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => Promise<void>;
  resetPassword: (email: string, password: string) => Promise<boolean>;
  toggleFavorite: (propertyId: string) => Promise<boolean>;
  isFavorite: (propertyId: string) => boolean;
  viewProperty: (propertyId: string) => Promise<void>;
  createProperty: (
    data: Omit<Property, "id" | "views" | "createdAt" | "updatedAt">,
  ) => Promise<Property>;
  updateProperty: (id: string, patch: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  sendInquiry: (data: Omit<Inquiry, "id" | "createdAt" | "status">) => Promise<void>;
  markInquiryRead: (id: string) => Promise<void>;
  verifySeller: (id: string, verified: boolean) => Promise<void>;
  saveCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addReport: (data: Omit<Report, "id" | "createdAt" | "status">) => Promise<void>;
  resolveReport: (id: string, status: Report["status"]) => Promise<void>;
  resetData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const SupabaseStoreContext = createContext<SupabaseStoreValue | null>(null);

const initialState: AppState = {
  users: [],
  properties: [],
  inquiries: [],
  reports: [],
  categories: [],
  favorites: [],
  recentlyViewed: [],
  currentUserId: null,
};

export function SupabaseStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) ?? null,
    [state.users, state.currentUserId],
  );

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);

      const [
        usersRes,
        propertiesRes,
        inquiriesRes,
        reportsRes,
        categoriesRes,
        favoritesRes,
        recentRes,
      ] = await Promise.all([
        supabase.from("users").select("*"),
        supabase.from("properties").select("*").order("created_at", { ascending: false }),
        supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
        supabase.from("reports").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("name"),
        supabase.from("favorites").select("property_id"),
        supabase
          .from("recently_viewed")
          .select("property_id")
          .order("viewed_at", { ascending: false })
          .limit(12),
      ]);

      const users = usersRes.data ?? [];
      const properties = propertiesRes.data ?? [];
      const inquiries = inquiriesRes.data ?? [];
      const reports = reportsRes.data ?? [];
      const categories = categoriesRes.data ?? [];
      const favorites = favoritesRes.data?.map((f) => f.property_id) ?? [];
      const recentlyViewed = recentRes.data?.map((r) => r.property_id) ?? [];

      setState({
        users,
        properties,
        inquiries,
        reports,
        categories,
        favorites,
        recentlyViewed,
        currentUserId: state.currentUserId,
      });
    } catch (error) {
      console.error("Failed to fetch data from Supabase:", error);
    } finally {
      setLoading(false);
      setHydrated(true);
    }
  }, [state.currentUserId]);

  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: user } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (user) {
          setState((prev) => ({ ...prev, currentUserId: user.id }));
        }
      }
      await fetchAllData();
    };
    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const { data: user } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (user) {
          setState((prev) => ({ ...prev, currentUserId: user.id }));
        }
      } else if (event === "SIGNED_OUT") {
        setState((prev) => ({ ...prev, currentUserId: null }));
      }
      await fetchAllData();
    });

    return () => subscription.unsubscribe();
  }, [fetchAllData]);

  const login = useCallback(async (email: string, password: string, role?: Role) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, message: error.message };

    if (data.user) {
      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (user && role && user.role !== role) {
        await supabase.auth.signOut();
        return { ok: false, message: "Akun ini tidak memiliki akses ke halaman tersebut." };
      }

      if (user) {
        setState((prev) => ({ ...prev, currentUserId: user.id }));
        return { ok: true, user };
      }
    }
    return { ok: false, message: "Login gagal" };
  }, []);

  const register = useCallback(
    async (data: { name: string; email: string; password: string; phone: string; role: Role }) => {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });
      if (authError) return { ok: false, message: authError.message };

      if (authData.user) {
        const userData = {
          id: authData.user.id,
          name: data.name.trim(),
          email: data.email.trim(),
          password_hash: data.password,
          phone: data.phone.trim(),
          role: data.role,
          verified: data.role === "seller" ? false : undefined,
        };

        const { error: insertError } = await supabase.from("users").insert(userData);
        if (insertError) return { ok: false, message: insertError.message };

        setState((prev) => ({
          ...prev,
          users: [...prev.users, userData],
          currentUserId: userData.id,
        }));
        return { ok: true, user: userData };
      }
      return { ok: false, message: "Registrasi gagal" };
    },
    [],
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setState((prev) => ({ ...prev, currentUserId: null }));
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<User>) => {
      if (!state.currentUserId) return;
      const { error } = await supabase.from("users").update(patch).eq("id", state.currentUserId);
      if (!error) {
        setState((prev) => ({
          ...prev,
          users: prev.users.map((u) => (u.id === state.currentUserId ? { ...u, ...patch } : u)),
        }));
      }
    },
    [state.currentUserId],
  );

  const resetPassword = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return false;

    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: password })
      .eq("email", email);
    return !updateError;
  }, []);

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      if (!state.currentUserId) return false;

      const exists = state.favorites.includes(propertyId);
      let saved = false;

      if (exists) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", state.currentUserId)
          .eq("property_id", propertyId);
        if (!error) saved = false;
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: state.currentUserId, property_id: propertyId });
        if (!error) saved = true;
      }

      if (saved !== exists) {
        setState((prev) => ({
          ...prev,
          favorites: exists
            ? prev.favorites.filter((id) => id !== propertyId)
            : [propertyId, ...prev.favorites],
        }));
      }
      return saved;
    },
    [state.currentUserId, state.favorites],
  );

  const isFavorite = useCallback(
    (propertyId: string) => state.favorites.includes(propertyId),
    [state.favorites],
  );

  const viewProperty = useCallback(
    async (propertyId: string) => {
      await supabase
        .from("properties")
        .update({ views: supabase.raw("views + 1") })
        .eq("id", propertyId);

      if (state.currentUserId) {
        await supabase.from("recently_viewed").upsert({
          user_id: state.currentUserId,
          property_id: propertyId,
          viewed_at: new Date().toISOString(),
        });
      }

      setState((prev) => ({
        ...prev,
        recentlyViewed: [
          propertyId,
          ...prev.recentlyViewed.filter((id) => id !== propertyId),
        ].slice(0, 12),
        properties: prev.properties.map((p) =>
          p.id === propertyId ? { ...p, views: p.views + 1 } : p,
        ),
      }));
    },
    [state.currentUserId],
  );

  const createProperty = useCallback(
    async (data: Omit<Property, "id" | "views" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const dbData = {
        ...data,
        views: 0,
        seller_id: data.sellerId,
        land_area: data.landArea,
        building_area: data.buildingArea,
        reject_reason: data.rejectReason,
        created_at: now,
        updated_at: now,
      };

      const { data: property, error } = await supabase
        .from("properties")
        .insert(dbData)
        .select()
        .single();

      if (!error && property) {
        setState((prev) => ({ ...prev, properties: [property, ...prev.properties] }));
        return property;
      }
      throw error;
    },
    [],
  );

  const updateProperty = useCallback(async (id: string, patch: Partial<Property>) => {
    const dbPatch: Partial<Property> = { ...patch, updated_at: new Date().toISOString() };
    if (patch.landArea !== undefined) dbPatch.land_area = patch.landArea;
    if (patch.buildingArea !== undefined) dbPatch.building_area = patch.buildingArea;
    if (patch.sellerId !== undefined) dbPatch.seller_id = patch.sellerId;
    if (patch.rejectReason !== undefined) dbPatch.reject_reason = patch.rejectReason;
    delete dbPatch.landArea;
    delete dbPatch.buildingArea;
    delete dbPatch.sellerId;
    delete dbPatch.rejectReason;

    const { error } = await supabase.from("properties").update(dbPatch).eq("id", id);
    if (!error) {
      setState((prev) => ({
        ...prev,
        properties: prev.properties.map((p) =>
          p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
        ),
      }));
    }
  }, []);

  const deleteProperty = useCallback(async (id: string) => {
    await Promise.all([
      supabase.from("properties").delete().eq("id", id),
      supabase.from("favorites").delete().eq("property_id", id),
      supabase.from("recently_viewed").delete().eq("property_id", id),
      supabase.from("inquiries").delete().eq("property_id", id),
      supabase.from("reports").delete().eq("property_id", id),
    ]);
    setState((prev) => ({
      ...prev,
      properties: prev.properties.filter((p) => p.id !== id),
      favorites: prev.favorites.filter((f) => f !== id),
      recentlyViewed: prev.recentlyViewed.filter((f) => f !== id),
      inquiries: prev.inquiries.filter((i) => i.property_id !== id),
      reports: prev.reports.filter((r) => r.property_id !== id),
    }));
  }, []);

  const sendInquiry = useCallback(async (data: Omit<Inquiry, "id" | "createdAt" | "status">) => {
    const now = new Date().toISOString();
    const dbData = {
      ...data,
      status: "baru",
      created_at: now,
      property_id: data.propertyId,
      seller_id: data.sellerId,
      buyer_name: data.buyerName,
      buyer_phone: data.buyerPhone,
    };

    const { data: inquiry, error } = await supabase
      .from("inquiries")
      .insert(dbData)
      .select()
      .single();

    if (!error && inquiry) {
      setState((prev) => ({ ...prev, inquiries: [inquiry, ...prev.inquiries] }));
    }
  }, []);

  const markInquiryRead = useCallback(async (id: string) => {
    const { error } = await supabase.from("inquiries").update({ status: "dibaca" }).eq("id", id);
    if (!error) {
      setState((prev) => ({
        ...prev,
        inquiries: prev.inquiries.map((i) => (i.id === id ? { ...i, status: "dibaca" } : i)),
      }));
    }
  }, []);

  const verifySeller = useCallback(async (id: string, verified: boolean) => {
    const { error } = await supabase.from("users").update({ verified }).eq("id", id);
    if (!error) {
      setState((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === id ? { ...u, verified } : u)),
      }));
    }
  }, []);

  const saveCategory = useCallback(async (category: Category) => {
    const { error } = await supabase.from("categories").upsert(category);
    if (!error) {
      setState((prev) => ({
        ...prev,
        categories: prev.categories.some((c) => c.id === category.id)
          ? prev.categories.map((c) => (c.id === category.id ? category : c))
          : [...prev.categories, category],
      }));
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (!error) {
      setState((prev) => ({ ...prev, categories: prev.categories.filter((c) => c.id !== id) }));
    }
  }, []);

  const addReport = useCallback(async (data: Omit<Report, "id" | "createdAt" | "status">) => {
    const now = new Date().toISOString();
    const dbData = {
      ...data,
      status: "pending",
      created_at: now,
      property_id: data.propertyId,
    };

    const { data: report, error } = await supabase.from("reports").insert(dbData).select().single();

    if (!error && report) {
      setState((prev) => ({ ...prev, reports: [report, ...prev.reports] }));
    }
  }, []);

  const resolveReport = useCallback(async (id: string, status: Report["status"]) => {
    const { error } = await supabase.from("reports").update({ status }).eq("id", id);
    if (!error) {
      setState((prev) => ({
        ...prev,
        reports: prev.reports.map((r) => (r.id === id ? { ...r, status } : r)),
      }));
    }
  }, []);

  const resetData = useCallback(async () => {
    setState(initialState);
  }, []);

  const refreshData = useCallback(async () => {
    await fetchAllData();
  }, [fetchAllData]);

  const value = useMemo<SupabaseStoreValue>(
    () => ({
      state,
      hydrated,
      loading,
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
      refreshData,
    }),
    [
      state,
      hydrated,
      loading,
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
      refreshData,
    ],
  );

  return <SupabaseStoreContext.Provider value={value}>{children}</SupabaseStoreContext.Provider>;
}

export function useSupabaseStore() {
  const ctx = useContext(SupabaseStoreContext);
  if (!ctx) throw new Error("useSupabaseStore harus dipakai di dalam SupabaseStoreProvider");
  return ctx;
}

export const PUBLIC_STATUSES: PropertyStatus[] = ["aktif", "terjual", "disewa"];

export function isPublic(property: Property) {
  return PUBLIC_STATUSES.includes(property.status);
}
