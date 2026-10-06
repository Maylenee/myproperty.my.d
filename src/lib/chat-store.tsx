import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";

const STORAGE_KEY = "myproperty-chat-history-v1";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
}

function uid() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface ChatStoreValue {
  state: ChatState;
  sendMessage: (content: string) => Promise<void>;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  clearHistory: () => void;
}

const ChatContext = createContext<ChatStoreValue | null>(null);

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content: `Halo! 👋 Saya asisten AI MyProperty. Saya bisa membantu menjawab pertanyaan seputar:
• Cara mencari properti (rumah, tanah, apartemen, ruko, kost, villa, dll)
• Cara memasang listing properti
• Fitur-fitur marketplace
• Lokasi yang tersedia
• Paket harga (Gratis/Premium)
• Dan pertanyaan lain tentang MyProperty

Ada yang bisa saya bantu?`,
    timestamp: new Date().toISOString(),
  },
];

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore invalid data
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // storage full
    }
  }, [messages, hydrated]);

  const toggleChat = useCallback(() => setIsOpen((prev) => !prev), []);
  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);

  const clearHistory = useCallback(() => {
    setMessages(initialMessages);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const generateAIResponse = useCallback(async (userMessage: string): Promise<string> => {
    const lowerMsg = userMessage.toLowerCase();

    // Knowledge-based responses
    const knowledgeResponses: Record<string, string> = {
      "apa itu myproperty":
        "MyProperty adalah marketplace properti Indonesia yang mempertemukan pembeli/penyewa dengan pemilik, penjual, dan agen properti dalam satu platform. Kami menyediakan informasi terstruktur dan konsisten agar mudah dibandingkan.",

      "properti apa saja":
        "Di MyProperty tersedia 8 kategori: Rumah, Tanah, Apartemen, Ruko, Kost, Villa, Gudang, dan Gedung/Tempat Usaha. Masing-masing bisa dijual atau disewa.",

      "bisa disewa":
        "Ya, properti bisa disewa! Pilih filter 'Disewa' pada pencarian. Tersedia untuk rumah, apartemen, kost, ruko, villa, gudang.",

      "cara mencari":
        "Masukkan lokasi (kota/area), pilih tipe properti, pilih transaksi (Dijual/Disewa), tentukan rentang harga, lalu klik Cari. Bisa juga pakai filter lanjutan: kamar tidur, kamar mandi, lantai, luas tanah/bangunan, fasilitas, sertifikat.",

      "cara menghubungi seller":
        "Buka detail properti, lalu klik tombol 'Hubungi'. Bisa via chat internal, WhatsApp, atau telepon yang tertera di profil seller.",

      "cara memasang listing":
        "Klik 'Pasang Properti' di navigasi, isi form lengkap (nama, tipe, transaksi, harga, alamat, spesifikasi, fasilitas, sertifikat, foto), lalu kirim untuk review. Admin akan verifikasi sebelum ditayangkan.",

      "status listing":
        "Seller bisa ubah status: Aktif (tayang), Terjual, Terdisewa, Nonaktif (sembunyikan). Status 'Pending' artinya menunggu review admin, 'Draft' belum lengkap.",

      lokasi:
        "MyProperty mencakup 3 provinsi: Jawa Barat (Indramayu, Cirebon, Bandung, Bekasi), DKI Jakarta (Jakarta Selatan, Jakarta Timur), Jawa Tengah (Semarang, Solo). Total 18+ kecamatan.",

      "harga gratis":
        "Paket Gratis (Rp0) sudah aktif di MVP: cari & filter properti, simpan favorit, hubungi seller, pasang listing dasar. Paket Premium masih konsep.",

      "paket premium":
        "Paket Premium masih konsep masa depan. Fitur direncanakan: eksposur tambahan, insight performa, profil profesional, dukungan prioritas. Belum tersedia di MVP.",

      "seller terverifikasi":
        "Seller yang sudah diverifikasi admin memiliki badge 'Seller terverifikasi'. Artinya identitas dan kepemilikan properti sudah divalidasi.",

      sertifikat:
        "Properti non-tanah menggunakan SHM atau HGB. Tanah biasanya SHM. Detail sertifikat tertera di halaman detail properti.",

      favorit:
        "Klik ikon hati (❤️) pada kartu properti atau halaman detail untuk menyimpan ke favorit. Akses via menu 'Tersimpan'.",

      "riwayat lihat":
        "Properti yang dibuka otomatis tersimpan di 'Terakhir Dilihat' (maksimal 12 item).",

      inquiry:
        "Inquiry adalah pertanyaan dari pembeli ke seller. Seller menerima notifikasi di dashboard 'Inquiry Masuk' dan bisa membalas via chat/WA/telepon.",

      "lapor properti":
        "Jika menemukan listing tidak sesuai (foto beda, sudah terjual tapi masih aktif), gunakan fitur 'Lapor' di halaman detail. Admin akan review.",

      "login daftar":
        "Klik 'Masuk' untuk login, atau 'Daftar' untuk buat akun baru. Pilih role: Pembeli (buyer), Penjual (seller), atau Admin.",

      "dashboard seller":
        "Seller punya dashboard: Kelola Listing (CRUD properti), Inquiry Masuk (balas pertanyaan), Profil. Akses via menu 'Dashboard Penjual'.",

      "dashboard admin":
        "Admin punya dashboard: Kelola Properti, Seller, User, Kategori, Laporan. Akses via '/admin/login'.",
    };

    // Find best match
    for (const [key, response] of Object.entries(knowledgeResponses)) {
      const keywords = key.split(" ");
      if (keywords.some((k) => lowerMsg.includes(k))) {
        return response;
      }
    }

    // Default fallback
    const fallbacks = [
      "Maaf, saya belum paham pertanyaan itu. Bisa coba tanyakan soal: cara cari properti, pasang listing, fitur marketplace, lokasi, atau paket harga?",
      "Saya khusus bantu seputar MyProperty. Coba tanya: 'Cara cari rumah di Jakarta?', 'Gimana cara daftar seller?', 'Apa saja kategori properti?', atau 'Berapa biaya pasang listing?'",
      "Pertanyaan di luar topik MyProperty mungkin tidak bisa saya jawab. Silakan tanya soal pencarian properti, listing, fitur, lokasi, atau harga ya!",
    ];

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isLoading) return;

      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const aiResponse = await generateAIResponse(trimmed);
        const assistantMsg: ChatMessage = {
          id: uid(),
          role: "assistant",
          content: aiResponse,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        const errorMsg: ChatMessage = {
          id: uid(),
          role: "assistant",
          content: "Maaf, terjadi kesalahan. Silakan coba lagi.",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, generateAIResponse],
  );

  const state = useMemo(() => ({ messages, isOpen, isLoading }), [messages, isOpen, isLoading]);

  const value = useMemo<ChatStoreValue>(
    () => ({
      state,
      sendMessage,
      toggleChat,
      openChat,
      closeChat,
      clearHistory,
    }),
    [state, sendMessage, toggleChat, openChat, closeChat, clearHistory],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat harus dipakai di dalam ChatProvider");
  return ctx;
}
