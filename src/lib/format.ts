export function formatPrice(value: number, transaction?: "dijual" | "disewa") {
  const suffix = transaction === "disewa" ? " / tahun" : "";
  if (value >= 1_000_000_000) {
    const n = value / 1_000_000_000;
    return `Rp ${trim(n)} Miliar${suffix}`;
  }
  if (value >= 1_000_000) {
    const n = value / 1_000_000;
    return `Rp ${trim(n)} Juta${suffix}`;
  }
  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}${suffix}`;
}

function trim(n: number) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(n);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const menit = Math.round(diff / 60000);
  if (menit < 1) return "Baru saja";
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.round(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.round(jam / 24);
  if (hari < 30) return `${hari} hari lalu`;
  return formatDate(iso);
}
