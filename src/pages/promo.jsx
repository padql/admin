import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";

export default function PromoForm() {
  const [produkList, setProdukList] = useState([]);
  const [produkId, setProdukId] = useState("");
  const [hargaPromo, setHargaPromo] = useState("");
  const [kategori, setKategori] = useState("");
  const [durasi, setDurasi] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔹 Load data produk saat component mount
  useEffect(() => {
    const fetchProduk = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, nama_produk, kategori, durasi")
        .order("nama_produk", { ascending: true });

      if (error) {
        console.error(error);
      } else {
        setProdukList(data);
      }
    };

    fetchProduk();
  }, []);

  // 🔹 Kalau produk berubah, update kategori & durasi otomatis
  useEffect(() => {
    if (produkId) {
      const produk = produkList.find((p) => p.id === parseInt(produkId));
      if (produk) {
        setKategori(produk.kategori || "");
        setDurasi(produk.durasi || "");
      }
    }
  }, [produkId, produkList]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.from("promo").insert([
        {
          produk_id: produkId,
          harga_modal_promo: hargaPromo,
          kategori,
          durasi,
        },
      ]);

      if (error) throw error;

      setMessage("Promo berhasil ditambahkan!");
      setProdukId("");
      setHargaPromo("");
      setKategori("");
      setDurasi("");
    } catch (err) {
      console.error(err);
      setMessage("Gagal menambahkan promo!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-6 mt-10">
      <h2 className="text-xl font-bold mb-4">Tambah Promo</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Select Produk */}
        <div>
          <label className="block text-sm font-medium mb-1">Aplikasi</label>
          <select
            value={produkId}
            onChange={(e) => setProdukId(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Pilih Produk --</option>
            {Object.entries(
            produkList.reduce((acc, p) => {
                if (!acc[p.nama_produk]) acc[p.nama_produk] = [];
                acc[p.nama_produk].push(p);
                return acc;
            }, {})
            ).map(([namaProduk, items]) => (
            <optgroup key={namaProduk} label={namaProduk}>
                {items.map((p) => (
                <option key={p.id} value={p.id}>
                    {`${p.nama_produk} - ${p.kategori} - ${p.durasi}`}
                </option>
                ))}
            </optgroup>
            ))}
          </select>
        </div>

        {/* Harga Promo */}
        <div>
          <label className="block text-sm font-medium mb-1">Harga Modal Promo</label>
          <input
            type="number"
            value={hargaPromo}
            onChange={(e) => setHargaPromo(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Simpan Promo"}
        </button>
      </form>

      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </div>
  );
}
