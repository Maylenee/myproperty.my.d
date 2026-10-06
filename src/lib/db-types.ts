export type Role = "buyer" | "seller" | "admin";

export type TransactionType = "dijual" | "disewa";

export type PropertyStatus =
  "draft" | "pending" | "aktif" | "ditolak" | "terjual" | "disewa" | "nonaktif";

export interface Category {
  id: string;
  slug: string;
  name: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  phone: string;
  role: Role;
  photo?: string;
  bio?: string;
  verified?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Property {
  id: string;
  name: string;
  type: string;
  transaction: TransactionType;
  price: number;
  address: string;
  province: string;
  city: string;
  district: string;
  land_area: number;
  building_area: number;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  description: string;
  facilities: string[];
  certificate: string;
  photos: string[];
  seller_id: string;
  status: PropertyStatus;
  views: number;
  reject_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: string;
  property_id: string;
  seller_id: string;
  buyer_name: string;
  buyer_phone: string;
  message: string;
  status: "baru" | "dibaca";
  created_at: string;
}

export interface Report {
  id: string;
  property_id: string;
  reporter: string;
  reason: string;
  status: "pending" | "ditindak" | "diabaikan";
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}

export interface RecentlyViewed {
  id: string;
  user_id: string;
  property_id: string;
  viewed_at: string;
}

export interface AppState {
  users: User[];
  properties: Property[];
  inquiries: Inquiry[];
  reports: Report[];
  categories: Category[];
  favorites: string[];
  recentlyViewed: string[];
  currentUserId: string | null;
}

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Omit<Category, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<Category, "id" | "created_at">>;
      };
      users: {
        Row: User;
        Insert: Omit<User, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<User, "id" | "created_at">>;
      };
      properties: {
        Row: Property;
        Insert: Omit<Property, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<Property, "id" | "created_at">>;
      };
      inquiries: {
        Row: Inquiry;
        Insert: Omit<Inquiry, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<Inquiry, "id" | "created_at">>;
      };
      reports: {
        Row: Report;
        Insert: Omit<Report, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<Report, "id" | "created_at">>;
      };
      favorites: {
        Row: Favorite;
        Insert: Omit<Favorite, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<Favorite, "id" | "created_at">>;
      };
      recently_viewed: {
        Row: RecentlyViewed;
        Insert: Omit<RecentlyViewed, "id" | "viewed_at"> & { id?: string };
        Update: Partial<Omit<RecentlyViewed, "id" | "viewed_at">>;
      };
    };
  };
}
