import { useEffect } from "react";
import {BrowserRouter as Router, Routes, Route, Navigate, useSearchParams, useNavigate, useLocation} from "react-router-dom";
import axios from "axios";
import Login from './pages/Login';
import Register from './pages/Register';
import Logout from './pages/Logout';
import Home from './pages/Home';
import UserDash from './pages/UserDash';
import { CreateSurvey } from './pages/CreateSurvey';
import ViewSurvey from './pages/ViewSurvey';
import Profile from './pages/Profile';
import Navbar from "./components/Navbar";
import BannedUser from './pages/BannedUser';

import AdminDashboard from './pages/AdminDashboard';
import { Toaster } from './components/ui/sonner';

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

function AuthHandler() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            localStorage.setItem("token", token);
            localStorage.setItem("role", "user");
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            window.dispatchEvent(new Event('authChange'));
            navigate("/", { replace: true });
        }
    }, [searchParams, navigate]);

    return null;
}

if (typeof window !== 'undefined') {
  const existingToken = localStorage.getItem('token');
  if (existingToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
  }
}

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) return <Navigate to="/login" />;
    if (role !== "admin") return <Navigate to="/" />;
    return children;
};

const UserRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const isBanned = localStorage.getItem("isBanned") === "true";
    if (!token) return <Navigate to="/login" />;
    if (isBanned) return <Navigate to="/banned" />;
    if (token && role === "admin") {
        return <Navigate to="/admin" />;
    }
    return children;
};

const BannedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    const isBanned = localStorage.getItem("isBanned") === "true";
    if (!token) return <Navigate to="/login" />;
    if (!isBanned) return <Navigate to="/" />;
    return children;
};

// Header component to show the blue band on non-homepage routes
const PageHeader = () => {
    const location = useLocation();
    // Don't render the header on the homepage
    if (location.pathname === '/') {
        return null;
    }
    // This div creates the blue band under the navbar
    return <div className="h-12 bg-[#778da9]" />;
};

function App() {
  return (
    <Router>
        <AuthHandler />
        <Navbar />
        <Toaster />
        {/* Main content container with top padding for the fixed navbar */}
        <div className="App pt-10">
            <PageHeader />
            <Routes>
                <Route path="/" element={<UserRoute><Home /></UserRoute>} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/profile" element={<UserRoute><Profile /></UserRoute>} />
                <Route path="/survey/create" element={<UserRoute><CreateSurvey /></UserRoute>} />
                <Route path="/survey/edit/:niceUrl" element={<UserRoute><CreateSurvey /></UserRoute>} />
                <Route path="/survey/:niceUrl" element={<ViewSurvey />} />
                <Route path="/userdash" element={<UserRoute><UserDash /></UserRoute> } />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/banned" element={<BannedRoute><BannedUser /></BannedRoute>} />
            </Routes>
        </div>
    </Router>
  );
}

console.log('API base:', process.env.REACT_APP_API_URL);

export default App;