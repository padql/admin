import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//Components
import BubbleBackground from "./components/BubbleBackground.jsx";
import Loading from "./components/Loading.jsx";
import { ToastProvider } from "./components/ToastProvider.jsx";
import Sidebar from "./components/Sidebar.jsx";
// import Header from "./components/Header.jsx";
import Layout from "./components/Layout.jsx";

// Pages
import Dashboard from "./pages/Dashboard.jsx";
import Form from "./pages/PaymentForm.jsx";
import List from "./pages/PaymentList.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <Loading />;

  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen relative">
          <Sidebar />
          <BubbleBackground />

          <Layout>
            {/* <Header /> */}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/form" element={<Form />} />
              <Route path="/list" element={<List />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>

            <footer className="text-center text-sm text-gray-400 mt-8">
              Admin Qudalautt.Hub
            </footer>
          </Layout>
        </div>
      </Router>
    </ToastProvider>
  );
}
