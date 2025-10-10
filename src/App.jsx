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
import Promo from "./pages/promo.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <Loading />;

  useEffect(() => {
  window.OneSignal = window.OneSignal || [];
  OneSignal.push(function () {
    OneSignal.init({
      appId: "a1fa4581-e57f-4e49-949a-c19fa8efec48",
      allowLocalhostAsSecureOrigin: true,
    });

    OneSignal.showSlidedownPrompt();
  });
}, []);

  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen relative dark:bg-gray-900/80">
          <Sidebar />
          <BubbleBackground />

          <Layout>
            {/* <Header /> */}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/form" element={<Form />} />
              <Route path="/list" element={<List />} />
              <Route path="/promo" element={<Promo />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>

            <footer className="text-center text-sm text-gray-400 mt-8 dark:text-gray-200">
              Admin Qudalautt.Hub
            </footer>
          </Layout>
        </div>
      </Router>
    </ToastProvider>
  );
}
