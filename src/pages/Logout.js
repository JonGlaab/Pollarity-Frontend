import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        const logoutUser = async () => {
            try {
                // If you add a logout endpoint later, call it here.
            } catch (err) {
                console.error("Logout error:", err);
            } finally {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                delete axios.defaults.headers.common['Authorization'];
                window.dispatchEvent(new Event('authChange'));
                navigate("/login");
            }
        };

        logoutUser();
    }, [navigate]);

    return <p>Logging out...</p>;
}

export default Logout;
