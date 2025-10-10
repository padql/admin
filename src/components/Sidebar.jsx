import {
  Bell,
  Home,
  List,
  FileText,
  Settings,
  Menu,
  X,
  BadgePercent,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

const menu = [
  { name: "Beranda", icon: Home, href: "/" },
  { name: "Isi Data", icon: FileText, href: "/form" },
  { name: "List", icon: List, href: "/list" },
  { name: "Isi Promo", icon: BadgePercent, href: "/promo" },
  { name: "Pengaturan", icon: Settings, href: "/settings" },
];

async function kirimPushNotif(title, message) {
  try {
    await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic jcrik4n5ge7646bau27ovoetb", // ganti
      },
      body: JSON.stringify({
        app_id: "a1fa4581-e57f-4e49-949a-c19fa8efec48", // ganti pakai app_id kamu
        included_segments: ["All"],
        headings: { en: title },
        contents: { en: message },
      }),
    });
  } catch (err) {
    console.error("Gagal kirim push notif:", err);
  }
}


export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const [lastIds, setLastIds] = useState([]);

  // Transaksi baru
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("transaksi_temp")
        .select("*")
        .eq("status", "Menunggu Konfirmasi")
        .order("id", { ascending: false });
      if (!error) {
        setNotifications(data || []);

        // Cek notif baru
        const newItems = data
          .map((n) => n.id)
          .filter((id) => !lastIds.includes(id));
        if (newItems.length > 0) {
          newItems.forEach((id) => {
            const notif = data.find((n) => n.id === id);
            showToast(`${notif.cust} membuat pesanan baru`);
          });
          setLastIds(data.map((n) => n.id));
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // refresh tiap 5 detik
    return () => clearInterval(interval);
  }, [lastIds]);

  // Toast sederhana pakai Tailwind
  const showToast = (message) => {
    const toast = document.createElement("div");
    toast.className =
      "fixed bottom-5 right-5 bg-indigo-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in-out z-50";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 15000);
  };

  useEffect(() => {
    const channel = supabase
  .channel("transaksi_temp_changes")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "transaksi_temp" },
    async (payload) => {
      const data = payload.new;
      setNotifications((prev) => [data, ...prev]);

      // Tampilkan toast lokal
      showToast(`${data.cust} membuat transaksi baru`);

      // Kirim push notif global
      await kirimPushNotif(
        "Transaksi Baru 🚀",
        `${data.cust} memesan ${data.produk} (${data.jenis}) segera cek stokya!`
      );
    }
  )
  .subscribe();

  }, []);

  return (
    <>
      {/* Navbar atas */}
      <div
        className="flex items-center justify-between px-4 py-3 
        bg-white/50 dark:bg-gray-900/90 backdrop-blur-md 
        border-b border-white/20 dark:border-gray-700 
        shadow-lg fixed top-0 left-0 right-0 z-40 md:left-64"
      >
        <span className="font-bold text-lg text-indigo-800 dark:text-indigo-300">
          Qudalautt.Hub
        </span>

        <div className="flex items-center gap-3">
          {/* Tombol Notif */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotif(!showNotif)}
              className="p-2 rounded-lg hover:bg-white/40 dark:hover:bg-gray-800 transition relative"
            >
              <Bell className="h-6 w-6 text-gray-700 dark:text-indigo-300" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Dropdown Notifikasi */}
            {showNotif && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 
                border border-white/20 dark:border-gray-700 rounded-xl shadow-xl 
                p-3 z-50"
              >
                <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-indigo-300">
                  Notifikasi
                </h3>
                <div className="max-h-56 overflow-y-auto space-y-2">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="flex justify-between items-start w-full p-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-900/40 text-gray-800 dark:text-gray-300 text-sm hover:bg-indigo-100/80 dark:hover:bg-indigo-800/60"
                      >
                        <button
                          type="button"
                          onClick={() => setSelected(n)}
                          className="text-left flex-1"
                        >
                          <p className="font-medium">{n.nama}</p>
                          <p>
                            {n.produk} ({n.jenis})
                          </p>
                          <p className="text-xs text-gray-500">
                            Rp{Number(n.harga).toLocaleString("id-ID")}
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation(); // biar klik tombol ga trigger setSelected
                            const { error } = await supabase
                              .from("transaksi_temp")
                              .delete()
                              .eq("id", n.id);

                            if (!error) {
                              setNotifications((prev) =>
                                prev.filter((item) => item.id !== n.id)
                              );
                              showToast("❌ Transaksi dibatalkan");
                            }
                          }}
                          className="ml-2 px-2 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-600"
                        >
                          Hapus
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Belum ada notifikasi
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tombol menu (mobile) */}
          <button
            type="button"
            className={`p-2 rounded-lg transition-all duration-300 md:hidden
              ${
                open
                  ? "opacity-0 scale-75 pointer-events-none"
                  : "opacity-100 scale-100"
              }`}
            onClick={() => setOpen(true)}
          >
            <Menu className="h-6 w-6 text-gray-700 dark:text-indigo-300 transition-transform duration-300 hover:rotate-90" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 
        bg-white/50 dark:bg-gray-900/80 backdrop-blur-xl 
        border-r border-white/20 dark:border-gray-700 
        shadow-lg z-50 transform transition-transform duration-300 
        ${open ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 flex flex-col`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/20 dark:border-gray-700">
          <span className="font-bold text-xl text-indigo-800 dark:text-indigo-300">
            QHub
          </span>
          <button
            type="button"
            className={`md:hidden p-2 rounded-lg transition-all duration-300
              ${
                open
                  ? "opacity-100 scale-100 rotate-90"
                  : "opacity-0 scale-75 -rotate-90 pointer-events-none"
              }`}
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5 text-gray-700 dark:text-indigo-300 transition-transform duration-400 font-bold hover:rotate-90" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  isActive
                    ? "bg-indigo-100/70 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-medium"
                    : "text-gray-800 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-300"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/20 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-400">
          © 2025 Qudalautt.Hub
        </div>
      </div>

      {/* Modal Konfirmasi */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl w-[95%] max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-indigo-600 dark:text-indigo-300">
              Konfirmasi Transaksi
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());

                const { error } = await supabase.from("transaksi").insert([
                  {
                    tanggal: new Date().toISOString(),
                    cust: selected.cust,
                    produk: selected.produk,
                    jenis: selected.jenis,
                    durasi: selected.durasi,
                    harga: selected.harga,
                    pembayaran: data.pembayaran,
                    catatan: data.catatan || null,
                    potongan: data.potongan ? Number(data.potongan) : null,
                  },
                ]);

                if (!error) {
                  await supabase
                    .from("transaksi_temp")
                    .delete()
                    .eq("id", selected.id);

                  setNotifications((prev) =>
                    prev.filter((n) => n.id !== selected.id)
                  );
                  setSelected(null);

                  navigate("/list"); // navigasi tanpa reload
                  showToast("✅ Transaksi berhasil dikonfirmasi");
                  setShowNotif(false);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                  Pembayaran
                </label>
                <select
                  name="pembayaran"
                  required
                  className="w-full p-2 rounded-lg bg-gray-50 dark:text-gray-400 dark:bg-gray-800 border dark:border-gray-700 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Pilih metode</option>
                  <option value="QRIS">QRIS</option>
                  <option value="DANA">DANA</option>
                  <option value="Transfer">Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                  Catatan (opsional)
                </label>
                <input
                  type="text"
                  name="catatan"
                  placeholder="Catatan tambahan"
                  className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border dark:border-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                  Potongan (opsional)
                </label>
                <input
                  type="number"
                  name="potongan"
                  placeholder="0"
                  min="0"
                  className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border dark:border-gray-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Konfirmasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
