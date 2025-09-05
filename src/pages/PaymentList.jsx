import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase.js';
import Modal from '../components/Modal.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import { Filter } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

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
          value === "desc" ? "text-indigo-500" : "text-gray-600"
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
          className={`absolute w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[10px] transition-all duration-300 ease-in-out
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
          value === "asc" ? "text-indigo-500" : "text-gray-600"
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
      res = res.filter(r => (r.nama||'').toLowerCase().includes(filterNamaInput.toLowerCase()));
    }

    if (filters.pembayaran) {
      res = res.filter(r => r.pembayaran === filters.pembayaran);
    }

    if (filters.tanggal) {
      res.sort((a,b) => filters.tanggal==='asc' 
        ? new Date(a.tanggal)-new Date(b.tanggal)
        : new Date(b.tanggal)-new Date(a.tanggal));
    } 
    if (filters.jumlah) {
      res.sort((a,b) => filters.jumlah==='asc'? a.jumlah-b.jumlah : b.jumlah-a.jumlah);
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
    setFilters({ tanggal:'', jumlah:'', pembayaran:'' });
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

  return (
    <>
      <h1 className="text-2xl font-bold mt-16 mb-6 text-left">Data transaksi</h1>
      <div className="w-full space-y-4">

        {/* Filter input + dropdown */}
        <div className="flex flex-row gap-3 md:items-center md:justify-between">
          <input 
            placeholder="Filter nama..." 
            value={filterNamaInput} 
            onChange={e=>setFilterNamaInput(e.target.value)}
            className="max-w-md w-full border px-3 py-2 rounded-xl"
          />

          <div className="relative" ref={dropdownRef}>
            <button 
              type="button"
              onClick={() => setDropdownOpen(o => !o)} 
              className="relative border px-3 py-2 rounded-xl flex items-center gap-1"
            >
              <span className="ml-1"><Filter /></span>

              {/* indikator kalau ada filter aktif */}
              {(filters.nama || filters.tanggal !== "" || filters.jumlah !== "" || filters.pembayaran !== "") && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
              )}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-62 bg-white border rounded-xl shadow p-4 z-50 space-y-4">
                
                {/* Sort Tanggal */}
                <div>
                  <div className="font-semibold mb-1">Tanggal</div>
                  <TriStateToggle 
                    value={filters.tanggal} 
                    onChange={v=>setFilters(f=>({...f, tanggal:v}))}
                    leftLabel="Terbaru"
                    rightLabel="Terlama"
                  />
                </div>

                {/* Sort Jumlah */}
                <div>
                  <div className="font-semibold mb-1">Harga</div>
                  <TriStateToggle 
                    value={filters.jumlah} 
                    onChange={v=>setFilters(f=>({...f, harga:v}))}
                    leftLabel="Terbesar"
                    rightLabel="Terkecil"
                  />
                </div>

                {/* Filter pembayaran */}
                <div>
                  <div className="font-semibold mb-1">pembayaran</div>
                  {pembayaranOptions.map(m => (
                    <label key={m} className="flex items-center gap-1">
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
        </div>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            className="px-3 py-1 rounded-lg border"
            onClick={() => {
              setSelectionMode(!selectionMode);
              setSelectedIds([]); // reset pilihan saat masuk/keluar mode
            }}
          >
            {selectionMode ? "Batal Pilih" : "Pilih Data"}
          </button>

          {selectionMode && selectedIds.length > 0 && (
            <button
              type="button"
              className="px-3 py-1 rounded-lg bg-red-500 text-white"
              onClick={() => setModalOpen(true)}
            >
              Hapus {selectedIds.length} Data
            </button>
          )}
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
                  <span className="text-gray-600 text-sm">{month}</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* Data di bulan ini */}
                {items.map(r => {
                  const expanded = expandedId === r.id;
                  return (
                    <div key={r.id} className="bg-glass rounded-2xl p-4 shadow mb-2">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedId(expanded ? null : r.id)}
                      >
                        <div>
                          <div className="font-medium">{r.cust} • <span className="text-indigo-700">{r.produk}</span></div>
                          <div className="text-sm text-gray-500">{r.pembayaran} • {fmtDate(r.tanggal)}</div>
                        </div>
                        <div className="flex items-center gap-4">
                        <div className="text-right font-semibold text-red-500">
                          Rp {fmt(r.harga)}
                        </div>
                        {selectionMode ? (
                          <input
                            type="checkbox"
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
                          <div className="mt-3 text-sm text-indigo-700 border-t pt-2">
                            Jenis : {r.jenis || "Tidak ada keterangan."}
                          </div>
                          <div className="mt-3 text-sm text-indigo-700 border-t pt-2">
                            Durasi : {r.durasi || "Tidak ada keterangan."}
                          </div>
                          <div className="mt-3 text-sm text-indigo-700 border-t pt-2">
                            {r.catatan || "Tidak ada catatan."}
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
      </div>
    </>
  );
}
