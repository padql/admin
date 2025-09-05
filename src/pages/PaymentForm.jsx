import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { useToast } from "../components/ToastProvider.jsx";
import html2canvas from "html2canvas";
import notaImg from "../components/images/nota-img.png";

<img
  src={notaImg}
  alt="Qudalautt.Hub"
  className="absolute top-1/2 left-1/2 w-32 opacity-10 pointer-events-none select-none"
  style={{ transform: "translate(-50%, -50%)" }}
/>


/* ---------- Modal ---------- */
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

/* ---------- SLIDER ---------- */
function SlideToSubmit({ onTrigger, disabled = false, loading = false, label = "Geser untuk Simpan", successLabel = "Terkirim", width = 280, height = 48 }) {
  const KNOB = 44;
  const MAX = Math.max(0, width - KNOB);

  const trackRef = useRef(null);
  const knobRef = useRef(null);
  const startX = useRef(0);

  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [completed, setCompleted] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!loading && completed) {
      const t = setTimeout(() => {
        firedRef.current = false;
        setCompleted(false);
        setX(0);
      }, 450);
      return () => clearTimeout(t);
    }
  }, [loading, completed]);

  const clamp = (v) => Math.min(MAX, Math.max(0, v));

  const pointerDown = (e) => {
    if (disabled || loading || completed) return;
    e.preventDefault();
    setDragging(true);
    startX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    knobRef.current?.setPointerCapture?.(e.pointerId);
  };

  const pointerMove = (e) => {
    if (!dragging) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    if (clientX == null) return;

    const newX = clamp(clientX - rect.left - KNOB / 2);
    setX(newX);

    if (newX >= MAX - 1 && !firedRef.current) {
      setX(MAX);
      setCompleted(true);
      setDragging(false);
      firedRef.current = true;
      onTrigger?.();
    }
  };

  const pointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (!completed) setX(0);
  };

  const progressPct = Math.round((x / MAX) * 100);

  return (
    <div
      ref={trackRef}
      className="relative select-none overflow-hidden rounded-full"
      style={{ width, height, background: disabled ? "#e5e7eb" : "#f3f4f6", touchAction: "none" }}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={pointerUp}
      onPointerLeave={pointerUp}
    >
      <div className="absolute left-0 top-0 h-full transition-[width] duration-150 ease-out" style={{ width: `${progressPct}%`, background: disabled ? "#c7cdd6" : "#dbeafe" }} />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={`text-sm font-medium transition-colors ${completed ? "text-green-700" : disabled ? "text-gray-400" : "text-gray-700"}`}>
          {loading ? "Menyimpan..." : completed ? successLabel : label}
        </span>
      </div>

      <div
        ref={knobRef}
        role="button"
        aria-label="Geser untuk submit"
        className={`absolute top-1 flex items-center justify-center rounded-full shadow
          ${disabled ? "bg-gray-300" : "bg-indigo-500"}
          ${dragging ? "transition-none" : "transition-transform duration-300 ease-out"}
          text-white`}
        style={{ width: KNOB - 2, height: KNOB - 2, transform: `translateX(${x}px)`, left: 2, touchAction: "none" }}
        onPointerDown={pointerDown}
      >
        {completed ? "✓" : "➜"}
      </div>

      {(disabled || loading) && <div className="absolute inset-0 cursor-not-allowed" />}
    </div>
  );
}

/* ---------- FORM TRANSAKSI ---------- */
export default function TransaksiForm({ onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    cust: "",
    tanggal: "",
    produk: "",
    jenis: "",
    durasi: "",
    harga: "",
    pembayaran: "",
    catatan: "",
  });

  const [showNota, setShowNota] = useState(false);
  const [savedData, setSavedData] = useState(null);
  const notaRef = useRef();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const canSubmit =
    form.cust &&
    form.tanggal &&
    form.produk &&
    form.jenis &&
    form.durasi &&
    form.harga &&
    form.pembayaran &&
    !loading;

  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const payload = { ...form, harga: Number(form.harga || 0) };
      const { error } = await supabase.from("transaksi").insert([payload]);
      if (error) {
        toast.push("Gagal menyimpan: " + error.message, { duration: 4000 });
      } else {
        toast.push("Transaksi berhasil disimpan ✅");
        setSavedData(payload);
        setShowNota(true); // ⬅️ buka modal preview nota
        onSuccess?.();
        setForm({
          cust: "",
          tanggal: "",
          produk: "",
          jenis: "",
          durasi: "",
          harga: "",
          pembayaran: "",
          catatan: "",
        });
      }
    } catch (err) {
      toast.push("Error: " + err.message);
    }
    setLoading(false);
  };

  const downloadNota = async () => {
    if (!notaRef.current) return;
    const canvas = await html2canvas(notaRef.current, { scale: 2 });
    const dataURL = canvas.toDataURL("image/jpeg", 0.9);
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `nota-${savedData?.cust || "transaksi"}.jpg`;
    link.click();
  };

  return (
    <>
      <h1 className="text-lg font-bold mt-16 text-left text-black">
        Input Transaksi
      </h1>
      <p className="mb-6">Catat transaksi pelangganmu di sini.</p>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="bg-glass rounded-3xl p-6 shadow-lg w-full"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Customer</label>
            <input name="cust" value={form.cust} onChange={change} className="w-full border px-3 py-2 rounded-xl" placeholder="Nama/No hp" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Aplikasi</label>
            <select name="produk" value={form.produk} onChange={change} className="w-full border px-3 py-2 rounded-xl" required>
              <option value="">Pilih Aplikasi</option>
              <option value="Vidio">Vidio</option>
              <option value="Spotify">Spotify</option>
              <option value="YouTube">YouTube</option>
              <option value="Netflix">Netflix</option>
              <option value="Bstation">Bstation</option>
              <option value="iQIYI">iQIYI</option>
              <option value="Canva">Canva</option>
              <option value="Capcut">Capcut</option>
              <option value="Alight Motion">Alight Motion</option>
              <option value="ChatGPT">ChatGPT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <select name="jenis" value={form.jenis} onChange={change} className="w-full border px-3 py-2 rounded-xl" required>
              <option value="">Pilih Kategori</option>
              <option value="Family Plan">Family Plan</option>
              <option value="Invite">Invite</option>
              <option value="Sharing">Sharing</option>
              <option value="Semi Private">Semi Private</option>
              <option value="Private">Private</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Durasi</label>
            <input name="durasi" value={form.durasi} onChange={change} className="w-full border px-3 py-2 rounded-xl" placeholder="Contoh: 3 Bulan" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Harga (Rp)</label>
            <input name="harga" type="number" value={form.harga} onChange={change} className="w-full border px-3 py-2 rounded-xl" placeholder="100000" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pembayaran</label>
            <select name="pembayaran" value={form.pembayaran} onChange={change} className="w-full border px-3 py-2 rounded-xl" required>
              <option value="">Pilih metode</option>
              <option value="DANA">DANA</option>
              <option value="QRIS">QRIS</option>
              <option value="Mandiri">Mandiri</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tanggal</label>
            <input name="tanggal" type="date" value={form.tanggal} onChange={change} className="w-full border px-3 py-2 rounded-xl" required />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Catatan (opsional)</label>
            <textarea name="catatan" value={form.catatan} onChange={change} className="w-full border px-3 py-2 rounded-xl" placeholder="Isi jika perlu..." required />
          </div>

          <div className="md:col-span-2 flex justify-center">
          <SlideToSubmit
            onTrigger={submit}
            disabled={!canSubmit}
            loading={loading}
            label="Geser untuk Simpan"
            successLabel="Tersimpan!"
            width={280}
            height={48}
          />
          </div>
        </div>
      </form>

      {/* Modal Nota */}
      <Modal open={showNota} onClose={() => setShowNota(false)}>
        <div
          ref={notaRef}
          className="relative bg-white text-black rounded-md shadow p-4 font-mono mx-auto overflow-hidden"
          style={{ width: "240px", minHeight: "auto" }}
        >
          {/* Watermark di Tengah */}
          <img
            src={notaImg} // path gambar kamu
            alt="Qudalautt.Hub"
            className="absolute top-1/2 left-1/2 w-42 opacity-5 pointer-events-none select-none"
            style={{ transform: "translate(-50%, -50%)" }}
          />

          {/* Konten Nota */}
          <div className="relative z-10">
            {/* Header */}
            <h2 className="text-center font-bold text-base">Qudalautt.Hub</h2>
            <p className="text-center text-xs mb-2">Layanan Aplikasi Premium</p>

            <hr className="border-dashed border-gray-400 my-2" />

            {/* Isi Nota */}
            <div className="text-xs space-y-1.5">
              <p>Customer : {savedData?.cust}</p>
              <p>Aplikasi   : {savedData?.produk}</p>
              <p>Kategori : {savedData?.jenis}</p>
              <p>Durasi   : {savedData?.durasi}</p>
              <p>Harga    : Rp {Number(savedData?.harga).toLocaleString()}</p>
              <p>Metode    : {savedData?.pembayaran}</p>
              <p>Tanggal  : {savedData?.tanggal}</p>
              <p>Catatan :{" "}
                {savedData?.catatan?.trim() ? (
                  savedData.catatan
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </p>

            </div>

            <hr className="border-dashed border-gray-400 my-3" />

            {/* Footer */}
            <p className="text-center text-[11px] text-gray-600 mt-1.5">
              Terima kasih. Kalau ada yang kurang jelas boleh tanyain aja⚡
            </p>
          </div>
        </div>
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={downloadNota}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
          >
            Download Nota (JPG)
          </button>
        </div>
      </Modal>
    </>
  );
}
