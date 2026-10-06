import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  ClipboardList,
  FileWarning,
  Heart,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  MessageSquare,
  PlusCircle,
  Search,
  Shapes,
  User as UserIcon,
  Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Logo } from "@/components/app/common";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSupabaseStore as useStore } from "@/lib/supabase-store";
import { SupabaseStoreProvider as StoreProvider } from "@/lib/supabase-store";
import { ChatProvider } from "@/lib/chat-store";
import { ChatBubble, ChatBubbleDesktop } from "@/components/app/chat-bubble";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const buyerNav = [
  { to: "/", label: "Beranda" },
  { to: "/properties", label: "Cari Properti" },
  { to: "/saved", label: "Tersimpan" },
  { to: "/recently-viewed", label: "Terakhir Dilihat" },
];

export function SiteHeader() {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const onLogout = () => {
    logout();
    setOpen(false);
    navigate({ to: "/" });
  };

  const roleLink =
    currentUser?.role === "seller"
      ? { to: "/seller/dashboard", label: "Dashboard Penjual" }
      : currentUser?.role === "admin"
        ? { to: "/admin", label: "Dashboard Admin" }
        : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 sm:px-6">
        <Logo />
        <nav aria-label="Navigasi utama" className="hidden justify-center gap-6 lg:flex">
          {buyerNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
          {roleLink ? (
            <Link
              to={roleLink.to}
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              {roleLink.label}
            </Link>
          ) : null}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {currentUser ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/profile">
                  <UserIcon className="size-4" aria-hidden /> {currentUser.name.split(" ")[0]}
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={onLogout}>
                Keluar
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Masuk</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/seller/properties/create">Pasang Properti</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex justify-end lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Buka menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Menu navigasi</SheetTitle>
              <nav className="mt-8 flex flex-col gap-1" aria-label="Navigasi mobile">
                {buyerNav.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
                  >
                    {item.label}
                  </Link>
                ))}
                {roleLink ? (
                  <Link
                    to={roleLink.to}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
                  >
                    {roleLink.label}
                  </Link>
                ) : null}
                <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                  {currentUser ? (
                    <>
                      <Button asChild variant="outline" onClick={() => setOpen(false)}>
                        <Link to="/profile">Profil Saya</Link>
                      </Button>
                      <Button variant="ghost" onClick={onLogout}>
                        Keluar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild variant="outline" onClick={() => setOpen(false)}>
                        <Link to="/login">Masuk</Link>
                      </Button>
                      <Button asChild onClick={() => setOpen(false)}>
                        <Link to="/register">Daftar</Link>
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

const mobileTabs = [
  { to: "/", label: "Beranda", icon: Building2, exact: true },
  { to: "/properties", label: "Cari", icon: Search, exact: false },
  { to: "/saved", label: "Tersimpan", icon: Heart, exact: false },
  { to: "/profile", label: "Profil", icon: UserIcon, exact: false },
];

export function MobileTabBar() {
  return (
    <nav
      aria-label="Navigasi bawah"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-background lg:hidden"
    >
      {mobileTabs.map((tab) => (
        <Link
          key={tab.to}
          to={tab.to}
          activeOptions={{ exact: tab.exact }}
          activeProps={{ className: "text-primary" }}
          className="flex flex-col items-center gap-1 py-2.5 text-xs font-semibold text-muted-foreground"
        >
          <tab.icon className="size-5" aria-hidden />
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
            Marketplace properti untuk mencari, memasang, dan mengelola rumah, tanah, dan properti
            lainnya.
          </p>
        </div>
        <FooterCol
          title="Jelajahi"
          links={[
            ["/category/rumah", "Rumah"],
            ["/category/tanah", "Tanah"],
            ["/category/apartemen", "Apartemen"],
            ["/category/ruko", "Ruko"],
            ["/category/kost", "Kost"],
            ["/category/villa", "Villa"],
          ]}
        />
        <FooterCol
          title="Untuk Penjual"
          links={[
            ["/seller/properties/create", "Pasang Properti"],
            ["/seller/properties", "Kelola Listing"],
            ["/seller/inquiries", "Inquiry Masuk"],
          ]}
        />
        <FooterCol
          title="Bantuan"
          links={[
            ["/properties", "Cari Properti"],
            ["/register", "Daftar Akun"],
            ["/admin/login", "Masuk Admin"],
          ]}
        />
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} MyProperty. Seluruh data pada aplikasi ini adalah data
        simulasi.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-wide text-foreground">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map(([to, label]) => (
          <li key={to}>
            <Link to={to} className="text-sm text-muted-foreground hover:text-primary">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ChatProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
        <SiteFooter />
        <MobileTabBar />
        <ChatBubble />
        <ChatBubbleDesktop />
      </div>
    </ChatProvider>
  );
}

const sellerNav = [
  { to: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/seller/properties", label: "Properti Saya", icon: ListChecks },
  { to: "/seller/properties/create", label: "Tambah Properti", icon: PlusCircle },
  { to: "/seller/inquiries", label: "Inquiry Masuk", icon: MessageSquare },
  { to: "/seller/profile", label: "Profil", icon: UserIcon },
];

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/properties", label: "Properti", icon: Building2 },
  { to: "/admin/sellers", label: "Seller", icon: Users },
  { to: "/admin/users", label: "User", icon: UserIcon },
  { to: "/admin/categories", label: "Kategori", icon: Shapes },
  { to: "/admin/reports", label: "Laporan", icon: FileWarning },
];

function DashboardShell({
  children,
  nav,
  title,
}: {
  children: ReactNode;
  nav: typeof sellerNav;
  title: string;
}) {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const onLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <ChatProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-40 border-b border-border bg-background">
          <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Logo />
              <span className="hidden truncate border-l border-border pl-3 text-sm font-semibold text-muted-foreground sm:inline">
                {title}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/properties">Lihat Marketplace</Link>
              </Button>
              <span className="hidden text-sm text-muted-foreground md:inline">
                {currentUser?.name}
              </span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="size-4" aria-hidden />
                <span className="hidden sm:inline">Keluar</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6">
          <aside className="hidden w-56 shrink-0 lg:block">
            <nav aria-label={title} className="sticky top-24 flex flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/admin" }}
                  activeProps={{ className: "bg-secondary text-primary" }}
                  className="inline-flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <item.icon className="size-4 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="min-w-0 flex-1 pb-24 lg:pb-0">{children}</main>
        </div>

        <nav
          aria-label={`${title} navigasi bawah`}
          className="fixed inset-x-0 bottom-0 z-40 flex overflow-x-auto border-t border-border bg-background lg:hidden"
        >
          {nav.map((item) => {
            const active =
              item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-w-[5rem] flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-5" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <ChatBubble />
        <ChatBubbleDesktop />
      </div>
    </ChatProvider>
  );
}

export function SellerShell({ children }: { children: ReactNode }) {
  return (
    <DashboardShell nav={sellerNav} title="Area Penjual">
      {children}
    </DashboardShell>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <DashboardShell nav={adminNav} title="Area Admin">
      {children}
    </DashboardShell>
  );
}

export function RoleGuard({ role, children }: { role: Role; children: ReactNode }) {
  const { currentUser, hydrated } = useStore();
  const navigate = useNavigate();

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-sm text-muted-foreground">
        Memuat…
      </div>
    );
  }

  if (!currentUser || currentUser.role !== role) {
    const loginPath = role === "admin" ? "/admin/login" : "/login";
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="max-w-md border border-border bg-card p-8 text-center">
          <ClipboardList className="mx-auto size-8 text-primary" aria-hidden />
          <h1 className="mt-4 text-lg font-bold text-foreground">Akses terbatas</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {role === "admin"
              ? "Halaman ini hanya dapat diakses oleh admin."
              : "Halaman ini hanya dapat diakses oleh akun penjual."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button onClick={() => navigate({ to: loginPath })}>Masuk</Button>
            <Button variant="outline" onClick={() => navigate({ to: "/" })}>
              Ke Beranda
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
