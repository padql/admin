import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase.js"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"

export default function Dashboard() {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [count, setCount] = useState(0)
  const [latest, setLatest] = useState([])
  const [index, setIndex] = useState(0)
  const [bestSeller, setBestSeller] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: transaksi, error } = await supabase
        .from("transaksi")
        .select("cust, tanggal, produk, jenis, durasi, harga, pembayaran")
        .order("tanggal", { ascending: false })

      if (error) {
        console.error(error)
        return
      }

      const totalSemua = transaksi.reduce((sum, t) => sum + (t.harga || 0), 0)
      setTotal(totalSemua)
      setCount(transaksi.length)
      setLatest(transaksi.slice(0, 3))

      const grouped = {}
      transaksi.forEach((item) => {
        const bulan = new Date(item.tanggal).toLocaleString("id-ID", { month: "short" })
        if (!grouped[bulan]) grouped[bulan] = 0
        grouped[bulan] += item.harga || 0
      })

      const chartData = Object.entries(grouped).map(([bulan, total]) => ({
        name: bulan,
        total,
      }))
      setData(chartData)

      const produkCount = {}
      transaksi.forEach((item) => {
        if (!produkCount[item.produk]) produkCount[item.produk] = { count: 0, total: 0 }
        produkCount[item.produk].count++
        produkCount[item.produk].total += item.harga || 0
      })

      const best = Object.entries(produkCount)
        .sort((a, b) => b[1].count - a[1].count)[0]

      if (best) {
        setBestSeller({
          produk: best[0],
          jumlah: best[1].count,
          total: best[1].total,
        })
      }
    }

    fetchData()
  }, [])

  function fmtRupiah(number) {
    return "Rp " + (number || 0).toLocaleString("id-ID")
  }

  useEffect(() => {
    if (latest.length === 0) return
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % latest.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [latest])

  function fmtDate(d) {
    try {
      return new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      })
    } catch {
      return d
    }
  }

  return (
    <div className="p-6 space-y-8 min-h-screen transition-colors">
      <h1 className="text-2xl font-bold mt-16 mb-6 text-left text-gray-900 dark:text-gray-100">
        Selamat Datang!
      </h1>

      {/* Statistik ringkas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="bg-orange-500 text-white rounded-2xl p-4 h-[80px] sm:h-[100px] flex flex-col justify-center shadow">
          <h3 className="text-xs opacity-90">Total Pembayaran</h3>
          <p className="text-md font-bold mt-1">{fmtRupiah(total)}</p>
        </div>

        <div className="bg-green-500 text-white rounded-2xl p-4 h-[80px] sm:h-[100px] flex flex-col justify-center shadow">
          <h3 className="text-xs opacity-90">Jumlah Transaksi</h3>
          <p className="text-md font-bold mt-1">{count}</p>
        </div>

        <div className="bg-blue-500 text-white rounded-2xl p-4 h-[80px] sm:h-[100px] flex flex-col justify-center shadow">
          <h3 className="text-xs opacity-90">Best Seller!</h3>
          {bestSeller ? (
            <>
              <p className="text-sm font-bold mt-1">{bestSeller.produk}</p>
              <p className="text-xs">
                {bestSeller.jumlah}x • {fmtRupiah(bestSeller.total)}
              </p>
            </>
          ) : (
            <p className="text-sm mt-1">-</p>
          )}
        </div>
      </div>

      {/* Slider Transaksi Terakhir */}
      <div className="bg-violet-500 rounded-2xl p-4 h-[100px] flex flex-col justify-center shadow overflow-hidden relative">
        <h3 className="text-xs text-white mt-2">Riwayat</h3>
        <div className="flex-1 overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{
              transform: `translateX(-${index * 100}%)`,
              width: `${latest.length * 100}%`,
            }}
          >
            {latest.map((item, i) => (
              <div key={i} className="w-full flex-shrink-0 pr-2">
                <div className="text-white py-1 h-[30px] flex items-center text-sm sm:text-sm">
                  <span className="font-semibold">{item.produk}</span>
                  <span className="px-1">•</span>
                  <span className="px-1">{fmtRupiah(item.harga)}</span>
                  <span className="px-1">•</span>
                  <span>{fmtDate(item.tanggal)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-1 left-0 right-0 flex justify-center space-x-1">
          {latest.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                index === i ? "bg-white scale-75" : "bg-white/50 scale-50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Grafik */}
      <div className="w-full h-[240px] bg-white dark:bg-slate-800 rounded-2xl shadow p-4 flex flex-col transition-colors">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Total Pembayaran per Bulan
        </h2>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
              <XAxis dataKey="name" stroke="currentColor" />
              <YAxis stroke="currentColor" />
              <Tooltip
                formatter={(value) => fmtRupiah(value)}
                contentStyle={{ backgroundColor: "#1e293b", color: "#fff" }}
              />
              <Bar dataKey="total" fill="#30967b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
