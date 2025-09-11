import { useEffect, useState } from "react"
import { Download, Monitor } from "lucide-react"
import { supabase } from "../lib/supabase.js"
import * as XLSX from "xlsx"

export default function SettingsPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  // follow system theme
  const [theme, setTheme] = useState("system")

  useEffect(() => {
    const mediaQuery = globalThis.matchMedia("(prefers-color-scheme: dark)")

    const applyTheme = (e) => {
      if (e.matches) {
        document.documentElement.classList.add("dark")
        setTheme("dark")
      } else {
        document.documentElement.classList.remove("dark")
        setTheme("light")
      }
    }

    applyTheme(mediaQuery)
    mediaQuery.addEventListener("change", applyTheme)
    return () => mediaQuery.removeEventListener("change", applyTheme)
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data, error } = await supabase.from("transaksi").select("*")
    if (!error) setData(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  function exportExcel() {
    if (!data.length) return
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "transaksi")
    XLSX.writeFile(workbook, "daftar_transaksi.xlsx")
  }

  return (
    <div className="p-6 mt-9 max-w-3xl mx-auto space-y-8 transition-colors">
      <h1 className="text-2xl font-bold dark:text-gray-100">Pengaturan</h1>

      {/* Tema */}
      <section className="bg-white dark:bg-slate-900 dark:text-gray-100 p-5 rounded-2xl shadow space-y-3 transition-colors">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Monitor size={18} /> Mode Tampilan
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Mengikuti sistem: <span className="font-semibold">{theme}</span>
        </p>
      </section>

      {/* Export */}
      <section className="bg-white dark:bg-slate-900 dark:text-gray-100 p-5 rounded-2xl shadow space-y-3 transition-colors">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Download size={18} /> Export Data
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Export daftar transaksi.
        </p>
        <button
          type="button"
          disabled={loading}
          onClick={exportExcel}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Export Excel"}
        </button>
      </section>
    </div>
  )
}
