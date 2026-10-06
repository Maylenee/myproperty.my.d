export type Role = "buyer" | "seller" | "admin";

export type TransactionType = "dijual" | "disewa";

export type PropertyStatus =
  "draft" | "pending" | "aktif" | "ditolak" | "terjual" | "disewa" | "nonaktif";

export interface Category {
  id: string;
  slug: string;
  name: string;
  active: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
  photo?: string;
  bio?: string;
  verified?: boolean;
  createdAt: string;
}

export interface Property {
  id: string;
  name: string;
  type: string; // category slug
  transaction: TransactionType;
  price: number;
  address: string;
  province: string;
  city: string;
  district: string;
  landArea: number;
  buildingArea: number;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  description: string;
  facilities: string[];
  certificate: string;
  photos: string[];
  sellerId: string;
  status: PropertyStatus;
  views: number;
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Inquiry {
  id: string;
  propertyId: string;
  sellerId: string;
  buyerName: string;
  buyerPhone: string;
  message: string;
  status: "baru" | "dibaca";
  createdAt: string;
}

export interface Report {
  id: string;
  propertyId: string;
  reporter: string;
  reason: string;
  status: "pending" | "ditindak" | "diabaikan";
  createdAt: string;
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
