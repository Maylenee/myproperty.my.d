-- MyProperty Supabase Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'seller', 'admin')),
  photo TEXT,
  bio TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  transaction TEXT NOT NULL CHECK (transaction IN ('dijual', 'disewa')),
  price BIGINT NOT NULL,
  address TEXT NOT NULL,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  land_area INTEGER NOT NULL DEFAULT 0,
  building_area INTEGER NOT NULL DEFAULT 0,
  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms INTEGER NOT NULL DEFAULT 0,
  floors INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  facilities TEXT[] DEFAULT '{}',
  certificate TEXT,
  photos TEXT[] DEFAULT '{}',
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'aktif', 'ditolak', 'terjual', 'disewa', 'nonaktif')) DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  reject_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inquiries table
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('baru', 'dibaca')) DEFAULT 'baru',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  reporter TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'ditindak', 'diabaikan')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Recently viewed table
CREATE TABLE IF NOT EXISTS public.recently_viewed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_seller_id ON public.properties(seller_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_transaction ON public.properties(transaction);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_inquiries_seller_id ON public.inquiries(seller_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_property_id ON public.inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_reports_property_id ON public.reports(property_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_user_id ON public.recently_viewed(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;

-- Categories: public read, admin write
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Categories are editable by admins" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Users: users can read their own data, admins can read all
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage users" ON public.users FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Properties: public can view active properties, sellers can manage their own
CREATE POLICY "Active properties are viewable by everyone" ON public.properties FOR SELECT USING (status IN ('aktif', 'terjual', 'disewa'));
CREATE POLICY "Sellers can view own properties" ON public.properties FOR SELECT USING (seller_id = auth.uid());
CREATE POLICY "Admins can view all properties" ON public.properties FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Sellers can insert own properties" ON public.properties FOR INSERT WITH CHECK (seller_id = auth.uid());
CREATE POLICY "Sellers can update own properties" ON public.properties FOR UPDATE USING (seller_id = auth.uid());
CREATE POLICY "Admins can manage all properties" ON public.properties FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Inquiries: sellers can view inquiries for their properties, buyers can create
CREATE POLICY "Sellers can view inquiries for own properties" ON public.inquiries FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND seller_id = auth.uid())
);
CREATE POLICY "Buyers can create inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all inquiries" ON public.inquiries FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Reports: anyone can create, admins can view/manage
CREATE POLICY "Anyone can create reports" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all reports" ON public.reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update reports" ON public.reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Favorites: users can manage their own favorites
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own favorites" ON public.favorites FOR ALL USING (user_id = auth.uid());

-- Recently viewed: users can manage their own
CREATE POLICY "Users can view own recent" ON public.recently_viewed FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own recent" ON public.recently_viewed FOR ALL USING (user_id = auth.uid());

-- Seed initial categories
INSERT INTO public.categories (id, slug, name, active) VALUES
  (uuid_generate_v4(), 'rumah', 'Rumah', true),
  (uuid_generate_v4(), 'tanah', 'Tanah', true),
  (uuid_generate_v4(), 'apartemen', 'Apartemen', true),
  (uuid_generate_v4(), 'ruko', 'Ruko', true),
  (uuid_generate_v4(), 'kost', 'Kost', true),
  (uuid_generate_v4(), 'villa', 'Villa', true),
  (uuid_generate_v4(), 'gudang', 'Gudang', true),
  (uuid_generate_v4(), 'gedung', 'Gedung', true)
ON CONFLICT (slug) DO NOTHING;

-- Create admin user (password: admin123)
-- Note: You'll need to create this user through Supabase Auth UI first, then run:
-- INSERT INTO public.users (id, name, email, password_hash, phone, role, verified) VALUES
-- ('<USER_ID_FROM_AUTH>', 'Admin MyProperty', 'admin@myproperty.id', 'admin123', '6281100000000', 'admin', true)
-- ON CONFLICT (id) DO NOTHING;

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();