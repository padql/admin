import { Home, List, FileText, Settings, Menu, X, BadgePercent } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

const menu = [
  { name: "Beranda", icon: Home, href: "/" },
  { name: "Isi Data", icon: FileText, href: "/form" },
  { name: "List", icon: List, href: "/list" },
  { name: "Isi Promo", icon: BadgePercent, href: "/promo" },
  { name: "Pengaturan", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Navbar kecil khusus mobile */}
      <div
        className="flex items-center justify-between px-4 py-3 
        bg-white/50 dark:bg-gray-900/90 backdrop-blur-md 
        border-b border-white/20 dark:border-gray-700 
        shadow-lg md:hidden fixed top-0 left-0 right-0 z-40"
      >
        <span className="font-bold text-lg text-indigo-800 dark:text-indigo-300">
          Qudalautt.Hub
        </span>
        <button
          type="button"
          className={`p-2 rounded-lg transition-all duration-300
            ${open ? "opacity-0 scale-75 pointer-events-none" : "opacity-100 scale-100"}`}
          onClick={() => setOpen(true)}
        >
          <Menu className="h-6 w-6 text-gray-700 dark:text-indigo-300 transition-transform duration-300 hover:rotate-90" />
        </button>
      </div>

      <div
        className={`fixed top-0 left-0 h-screen w-64 
        bg-white/50 dark:bg-gray-900/80 backdrop-blur-xl 
        border-r border-white/20 dark:border-gray-700 
        shadow-lg z-50 transform transition-transform duration-300 
        ${open ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/20 dark:border-gray-700">
          <span className="font-bold text-xl text-indigo-800 dark:text-indigo-300">
            QHub
          </span>
          <button
            type="button"
            className={`md:hidden p-2 rounded-lg transition-all duration-300
              ${open 
                ? "opacity-100 scale-100 rotate-90" 
                : "opacity-0 scale-75 -rotate-90 pointer-events-none"}`}
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5 text-gray-700 dark:text-indigo-300 transition-transform duration-400 font-bold hover:rotate-90" />
          </button>
        </div>

        {/* Nav menu */}
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

        {/* Footer fix di bawah */}
        <div className="p-4 border-t border-white/20 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-400">
          © 2025 Qudalautt.Hub
        </div>
      </div>
    </>
  );
}
