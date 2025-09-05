import Sidebar from "./Sidebar.jsx";
import { ToastProvider } from "./ToastProvider.jsx";

export default function Layout({ children }) {
  return (
    <ToastProvider>
      <div className="flex">
        {/* <Sidebar /> */}
        {/* konten: ada margin kiri hanya di md ke atas */}
        <div className="flex-1 md:ml-64 p-6 bg-gray-50 min-h-screen">
          {children}
        </div>
      </div>
    </ToastProvider>
  );
}
