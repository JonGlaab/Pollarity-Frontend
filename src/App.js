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
    <nav className="mainNav">
        <div className="navLeft">
      <Link to="/">Home</Link> {" "}
        </div>
        <div className="navRight">
      <Link to="/login">Login</Link> |{" "}
      <Link to="/register">Register</Link> |{" "}
      <Link to="/logout">Logout</Link>
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