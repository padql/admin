import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase.js';
import Modal from '../components/Modal.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import { Filter, SquareCheckBig, SquareX } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import notaImg from "../components/images/nota-img.png";

function fmt(n){ try{return Number(n).toLocaleString('id-ID')}catch{return n} }

function TriStateToggle({ value, onChange, leftLabel = "Desc", rightLabel = "Asc" }) {
  const [lastValue, setLastValue] = useState("desc"); // ingat posisi terakhir

  function handleClick() {
    if (value === "desc") {
      onChange("");          // desc -> off
      setLastValue("desc");
    } else if (value === "asc") {
      onChange("");          // asc -> off
      setLastValue("asc");
    } else if (value === "") {
      // kalau off → lanjut ke seberangnya
      onChange(lastValue === "desc" ? "asc" : "desc");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-sm ${
          value === "desc" ? "text-indigo-500" : "text-gray-600 dark:text-gray-300"
        }`}
      >
        {leftLabel}
      </span>

      <button
        type="button"
        onClick={handleClick}
        className="relative w-20 h-8 bg-gray-200 rounded-full flex items-center justify-center"
      >
        <div
          className={`absolute w-6 h-6 bg-indigo-900 text-white rounded-full flex items-center justify-center text-[10px] transition-all duration-300 ease-in-out
            ${
              value === ""
                ? "left-1/2 -translate-x-1/2"
                : value === "desc"
                ? "left-1"
                : "right-1"
            }`}
        >
          {value === "" ? "off" : ""}
        </div>
      </button>

      <span
        className={`text-sm ${
          value === "asc" ? "text-indigo-500" : "text-gray-600 dark:text-gray-300"
        }`}
      >
        {rightLabel}
      </span>
    </div>

  );
}

export default function PaymentList({ refresh }) {
  const [data, setData] = useState([]);
  const [filterNamaInput, setFilterNamaInput] = useState('');
  const [filters, setFilters] = useState({
    tanggal: '', // 'asc' / 'desc'
    jumlah: '',  // 'asc' / 'desc'
    pembayaran: '',  // selected pembayaran
  });
  const [loading, setLoading] = useState(false);
  // const [delId, setDelId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null); // id item yg lagi expand
  const toast = useToast();
  const dropdownRef = useRef();
  const pembayaranOptions = ['Transfer', 'Dana', 'QRIS'];
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [showNota, setShowNota] = useState(false);
  const [savedData, setSavedData] = useState(null);
  const notaRef = useRef();


  useEffect(()=>{ fetchData(); },[refresh]);

  async function fetchData(){
    setLoading(true); 
    const { data, error } = await supabase.from('transaksi').select('*').order('tanggal',{ascending:false});
    if (!error) setData(data || []);
    setLoading(false);
  }

  async function doDeleteMany(ids) {
    const { error } = await supabase.from('transaksi').delete().in('id', ids);
    if (error) toast.push('Gagal hapus: ' + error.message);
    else {
      toast.push('Data dihapus');
      setModalOpen(false);
      fetchData();
      setSelectedIds([]);
      setSelectionMode(false);
    }
  }

  function fmtDate(d) {
    try {
      return new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      });
    } catch { return d; }
  }

  function applyFilters(data) {
    let res = [...data];

    if (filterNamaInput) {
      res = res.filter(r => (r.cust||'').toLowerCase().includes(filterNamaInput.toLowerCase()));
    }

    if (filters.pembayaran) {
      res = res.filter(r => r.pembayaran === filters.pembayaran);
    }

    if (filters.tanggal) {
      res.sort((a,b) => filters.tanggal==='asc' 
        ? new Date(a.tanggal)-new Date(b.tanggal)
        : new Date(b.tanggal)-new Date(a.tanggal));
    } 
    if (filters.harga) {
      res.sort((a,b) => filters.harga==='asc'? a.harga-b.harga : b.harga-a.harga);
    }

    return res;
  }

  const rows = applyFilters(data);

  useEffect(()=>{
    function handleClickOutside(e){
      if(dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return ()=>document.removeEventListener('mousedown', handleClickOutside);
  },[]);

  function resetFilters(){
    setFilters({ tanggal:'', harga:'', pembayaran:'' });
    setFilterNamaInput('');
    setDropdownOpen(false);
  }

  function groupByMonth(data) {
    return data.reduce((acc, item) => {
      const d = new Date(item.tanggal);
      const key = d.toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      }); // contoh: "Aug 25"
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }

  const grouped = groupByMonth(rows);

  function handleOpenNota(row) {
    setSavedData(row);
    setShowNota(true);
  }

  async function downloadNota() {
    if (!notaRef.current) return;
    const canvas = await html2canvas(notaRef.current, { scale: 2 });
    const dataURL = canvas.toDataURL("image/jpeg", 0.9);
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `nota-${savedData?.cust || "transaksi"}.jpg`;
    link.click();
  }

  return (
    <>
      <h1 className="text-2xl font-bold mt-16 mb-6 text-left dark:text-indigo-400">Data transaksi</h1>
      <div className="w-full space-y-4">

        {/* Filter input + dropdown */}
        <div className="flex flex-row gap-3">
          <input 
            placeholder="Filter nama..." 
            value={filterNamaInput} 
            onChange={e=>setFilterNamaInput(e.target.value)}
            className="max-w-xl w-full h-5/6 border px-3 py-2 rounded-xl dark:bg-gray-900/90 
            text-gray-800 dark:text-gray-200 
            border-gray-300 dark:border-gray-500"
          />

          <div className="relative" ref={dropdownRef}>
            <button 
              type="button"
              onClick={() => setDropdownOpen(o => !o)} 
              className="relative border px-3 py-1.5 rounded-xl flex items-center gap-1 bg-white dark:bg-gray-900/90 
            text-gray-700 dark:text-gray-200 
            border-gray-300 dark:border-gray-500"
            >
              <span className="ml-1"><Filter /></span>

              {/* indikator kalau ada filter aktif */}
              {(filters.nama || filters.tanggal !== "" || filters.harga !== "" || filters.pembayaran !== "") && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
              )}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-62 
                bg-white dark:bg-gray-900/80 backdrop-blur-md
                border border-gray-200 dark:border-gray-500 
                rounded-xl shadow p-4 z-50 space-y-4"
              >
                
                {/* Sort Tanggal */}
                <div>
                  <div className="font-semibold mb-1 dark:text-gray-200">Tanggal</div>
                  <TriStateToggle 
                    className="dark:text-white"
                    value={filters.tanggal} 
                    onChange={v=>setFilters(f=>({...f, tanggal:v}))}
                    leftLabel="Terbaru"
                    rightLabel="Terlama"
                  />
                </div>

                {/* Sort harga */}
                <div>
                  <div className="font-semibold mb-1 dark:text-gray-200">Harga</div>
                  <TriStateToggle 
                    value={filters.harga} 
                    onChange={v=>setFilters(f=>({...f, harga:v}))}
                    leftLabel="Terbesar"
                    rightLabel="Terkecil"
                  />
                </div>

                {/* Filter pembayaran */}
                <div>
                  <div className="font-semibold mb-1 dark:text-gray-200">pembayaran</div>
                  {pembayaranOptions.map(m => (
                    <label key={m} className="flex items-center gap-1 dark:text-gray-200">
                      <input type="radio" 
                        name="pembayaran"
                        checked={filters.pembayaran===m} 
                        onChange={()=>setFilters(f=>({...f, pembayaran: filters.pembayaran===m ? '' : m}))} 
                      />
                      {m}
                    </label>
                  ))}
                </div>

                <button 
                  type="button"
                  onClick={resetFilters} 
                  className="mt-2 w-full bg-red-500 text-white py-1 rounded-lg text-sm"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2 mb-4">
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg border dark:bg-gray-900/90 
            text-gray-700 dark:text-gray-200 
            border-gray-300 dark:border-gray-500"
            onClick={() => {
              setSelectionMode(!selectionMode);
              setSelectedIds([]); // reset pilihan saat masuk/keluar mode
            }}
          >
            {selectionMode ? [<SquareX key="deselect-icon" />] : [<SquareCheckBig key="select-icon" />]}
          </button>

          {selectionMode && selectedIds.length > 0 && (
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-red-500 text-white"
              onClick={() => setModalOpen(true)}
            >
              Hapus {selectedIds.length} Data
            </button>
          )}
        </div>
        </div>

        {/* List data */}
        <div className="space-y-4">
          {loading ? <div className="text-center py-8">Memuat data...</div> :
            rows.length===0 ? <div className="text-center py-8 text-gray-500">Belum ada data.</div> :
            Object.entries(grouped).map(([month, items]) => (
              <div key={month}>
                {/* Header bulan */}
                <div className="flex items-center gap-2 my-4">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">{month}</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* Data di bulan ini */}
                {items.map(r => {
                  const expanded = expandedId === r.id;
                  return (
                      <div 
                        key={r.id} 
                        className="bg-glass dark:bg-gray-900/90 
                          dark:border dark:border-gray-500 
                          rounded-2xl p-4 shadow mb-2"
                        >
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedId(expanded ? null : r.id)}
                      >
                        <div>
                          <div className="font-medium dark:text-gray-300">{r.cust} • <span className="text-indigo-700 dark:text-indigo-400">{r.produk}</span></div>
                          <div className="text-sm text-gray-500 dark:text-gray-300">{r.pembayaran} • {fmtDate(r.tanggal)}</div>
                        </div>
                        <div className="flex items-center gap-4">
                        <div className="text-right font-semibold text-red-500 dark:text-red-400">
                          Rp {fmt(r.harga)}
                        </div>
                        {selectionMode ? (
                          <input
                            type="checkbox"
                            className="accent-indigo-500"
                            checked={selectedIds.includes(r.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds([...selectedIds, r.id]);
                              } else {
                                setSelectedIds(selectedIds.filter((x) => x !== r.id));
                              }
                            }}
                          />
                        ) : null}
                      </div>
                      </div>
                      <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.div
                          key="expand"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 text-sm text-indigo-700 dark:text-indigo-400 border-t pt-2">
                            Jenis : {r.jenis || "Tidak ada keterangan."}
                          </div>
                          <div className="mt-3 text-sm text-indigo-700 dark:text-indigo-400 border-t pt-2">
                            Durasi : {r.durasi || "Tidak ada keterangan."}
                          </div>
                          <div className="mt-3 text-sm text-indigo-700 dark:text-indigo-400 border-t pt-2">
                            {r.catatan || "Tidak ada catatan."}
                          </div>

                          {/* Tombol Nota di bagian expand */}
                          <div className="mt-3 border-t pt-2 items-right flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleOpenNota(r)}
                              className="px-3 py-1 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                            >
                              Lihat Nota
                            </button>
                          </div>  
                        </motion.div>
                      )}
                    </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ))
          }
        </div>

        {/* Modal hapus */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Konfirmasi Hapus"
          footer={(
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                Batal
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => doDeleteMany(selectedIds)}
              >
                Hapus
              </button>
            </>
          )}
        >
          <p>
            Yakin mau hapus {selectedIds.length} data ini? Tindakan ini tidak bisa
            dibatalkan.
          </p>
        </Modal>

        {/* Modal Nota */}
        <Modal open={showNota} onClose={() => setShowNota(false)}>
          <div
            ref={notaRef}
            className="relative bg-white text-black rounded-md shadow p-4 font-mono mx-auto overflow-hidden"
            style={{ width: "240px", minHeight: "auto" }}
          >
            {/* Watermark di Tengah */}
            <img
              src={notaImg} // pastikan sudah import notaImg
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
                <p>Aplikasi : {savedData?.produk}</p>
                <p>Kategori : {savedData?.jenis}</p>
                <p>Durasi : {savedData?.durasi}</p>
                <p>Harga : Rp {Number(savedData?.harga).toLocaleString()}</p>
                <p>Metode : {savedData?.pembayaran}</p>
                <p>Tanggal : {savedData?.tanggal}</p>
                <p>
                  Catatan :{" "}
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
      </div>
    </>
  );
}
