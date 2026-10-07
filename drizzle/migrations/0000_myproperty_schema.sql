CREATE TYPE public.app_role AS ENUM ('buyer', 'seller', 'admin');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  bio text,
  photo text,
  verified boolean,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO anon;
GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Roles are public" ON public.user_roles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users pick buyer or seller role" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND role IN ('buyer','seller')
    AND NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid()));

CREATE POLICY "Profiles are public" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users create own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() AND verified IS NOT TRUE);
CREATE POLICY "Users or admin update profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.guard_profile_verified()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.verified IS DISTINCT FROM OLD.verified AND NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.verified := OLD.verified;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER profiles_guard_verified BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_verified();

CREATE TABLE public.categories (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.properties (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  type text NOT NULL,
  transaction text NOT NULL CHECK (transaction IN ('dijual','disewa')),
  price bigint NOT NULL DEFAULT 0,
  address text NOT NULL DEFAULT '',
  province text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  district text NOT NULL DEFAULT '',
  land_area integer NOT NULL DEFAULT 0,
  building_area integer NOT NULL DEFAULT 0,
  bedrooms integer NOT NULL DEFAULT 0,
  bathrooms integer NOT NULL DEFAULT 0,
  floors integer NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  facilities text[] NOT NULL DEFAULT '{}',
  certificate text NOT NULL DEFAULT '',
  photos text[] NOT NULL DEFAULT '{}',
  seller_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','pending','aktif','ditolak','terjual','disewa','nonaktif')),
  views integer NOT NULL DEFAULT 0,
  reject_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX properties_seller_idx ON public.properties (seller_id);
CREATE INDEX properties_status_idx ON public.properties (status);
GRANT SELECT ON public.properties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published properties are public" ON public.properties FOR SELECT TO anon, authenticated
  USING (status IN ('aktif','terjual','disewa'));
CREATE POLICY "Sellers read own properties" ON public.properties FOR SELECT TO authenticated
  USING (seller_id = auth.uid());
CREATE POLICY "Admins read all properties" ON public.properties FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Sellers create own properties" ON public.properties FOR INSERT TO authenticated
  WITH CHECK (seller_id = auth.uid() AND status IN ('draft','pending')
    AND public.has_role(auth.uid(), 'seller'));
CREATE POLICY "Sellers or admin update properties" ON public.properties FOR UPDATE TO authenticated
  USING (seller_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (seller_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Sellers or admin delete properties" ON public.properties FOR DELETE TO authenticated
  USING (seller_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.guard_property_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  IF public.has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  IF NEW.status = 'aktif' AND OLD.status IN ('draft','pending','ditolak') THEN
    RAISE EXCEPTION 'Listing harus disetujui admin terlebih dahulu';
  END IF;
  IF NEW.status = 'ditolak' AND OLD.status <> 'ditolak' THEN
    RAISE EXCEPTION 'Hanya admin yang dapat menolak listing';
  END IF;
  NEW.seller_id := OLD.seller_id;
  NEW.views := OLD.views;
  RETURN NEW;
END $$;
CREATE TRIGGER properties_guard_status BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.guard_property_status();

CREATE OR REPLACE FUNCTION public.increment_property_view(_property_id text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.properties SET views = views + 1
  WHERE id = _property_id AND status IN ('aktif','terjual','disewa');
$$;
GRANT EXECUTE ON FUNCTION public.increment_property_view(text) TO anon, authenticated;

CREATE TABLE public.inquiries (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id text NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL,
  buyer_id uuid,
  buyer_name text NOT NULL,
  buyer_phone text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'baru' CHECK (status IN ('baru','dibaca')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.inquiries TO anon;
GRANT SELECT, INSERT, UPDATE ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can send inquiry" ON public.inquiries FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'baru' AND (buyer_id IS NULL OR buyer_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.seller_id = inquiries.seller_id));
CREATE POLICY "Sellers and admins read inquiries" ON public.inquiries FOR SELECT TO authenticated
  USING (seller_id = auth.uid() OR buyer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Sellers update own inquiries" ON public.inquiries FOR UPDATE TO authenticated
  USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid());

CREATE TABLE public.reports (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id text NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  reporter text NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','ditindak','diabaikan')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.reports TO anon;
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can report" ON public.reports FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending');
CREATE POLICY "Admins read reports" ON public.reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update reports" ON public.reports FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.favorites (
  user_id uuid NOT NULL,
  property_id text NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, property_id)
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own favorites" ON public.favorites FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.recently_viewed (
  user_id uuid NOT NULL,
  property_id text NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, property_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recently_viewed TO authenticated;
GRANT ALL ON public.recently_viewed TO service_role;
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own recently viewed" ON public.recently_viewed FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users read own property photos" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'property-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users upload own property photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own property photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'property-photos' AND (storage.foldername(name))[1] = auth.uid()::text);