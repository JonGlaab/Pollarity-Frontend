import { useEffect, useState } from "react";
import {BrowserRouter as Router, Routes, Route, Link, Navigate} from "react-router-dom";
import axios from "axios";
import Login from './pages/Login';
import Register from './pages/Register';
import Logout from './pages/Logout';
import Home from './pages/Home';
import { CreateSurvey } from './pages/CreateSurvey';

import { UISurveyCreate } from './pages/UISurveyCreate';
//import { BrowseSurvey } from "./pages/BrowseSurvey";
//import { TakeSurvey } from "./pages/TakeSurvey";
//import { SurveyResultsPage } from "./pages/SurveyResultsPage";
import AdminDashboard from './pages/AdminDashboard';

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

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

    if (token && role === "admin") {
        return <Navigate to="/admin" />;
    }

    return children;
};

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(
      typeof window !== 'undefined' && !!localStorage.getItem('token')
  );

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  return (
    <nav className="mainNav">
        <div className="navLeft">
          <Link to="/">Home</Link>
          {isAuthenticated && (
              <>
                  {" | "}
                  <Link to="/survey/create">Create Survey</Link>
                   {" | "}
                  <Link to="/survey/othercreate">Create Survey</Link>
              </>
          )}
        </div>
        <div className="navRight">
          {!isAuthenticated && (
              <>
                <Link to="/login">Login</Link> {" | "}
                <Link to="/register">Register</Link>
              </>
          )}
          {isAuthenticated && (
              <Link to="/logout">Logout</Link>
          )}
        </div>
    </nav>
  );
}

function App() {

  return (
    <Router>
        <Navbar />
      <div className="App">
        <Routes>
            <Route path="/" element={<UserRoute><Home /></UserRoute>} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/survey/create" element={<UserRoute><CreateSurvey /></UserRoute>} />
            <Route path="/survey/othercreate" element={<UserRoute><UISurveyCreate /></UserRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

console.log('API base:', process.env.REACT_APP_API_URL);

export default App;