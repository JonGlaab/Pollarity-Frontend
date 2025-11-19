import './App.css';
import {BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";
import axios from "axios";
import Login from './pages/Login'
import Register from './pages/Register'
import Logout from './pages/Logout'
import Home from './pages/Home'
import { CreateSurvey } from './pages/CreateSurvey';

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link> |{" "}
      <Link to="/login">Login</Link> |{" "}
      <Link to="/register">Register</Link> |{" "}
      <Link to="/logout">Logout</Link>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />

            <Route path="/survey/create" element={<CreateSurvey />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;