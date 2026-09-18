import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Resume from "./pages/Resume.jsx";
import Recommendations from "./pages/Recommendations.jsx";
import Profile from "./pages/Profile.jsx";
import Applications from "./pages/Applicatons.jsx";
import AboutMatchora from "./pages/AboutMatchora.jsx";
import Privacy from "./pages/Privacy.jsx";
import Pricing from "./pages/Pricing.jsx";


const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/aboutMatchora" element={<AboutMatchora/>}/>
      <Route path="/privacy" element={<Privacy/>} />
      <Route path="/pricing" element={<Pricing />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/applications" element={<Applications />} />
        {/* more routes get added here as we build each page */}
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center text-sm text-neutral-400">
                    Loading...
                  </div>
                }
              >
                <AdminDashboard />
              </Suspense>
            </AdminRoute>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}