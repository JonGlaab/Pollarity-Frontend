import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Logout() {

    const navigate = useNavigate();

    useEffect(() => {
        const logoutUser = async () => {
        try {
            await axios.post("http://Pollarity/logout", {}, {
            withCredentials: true
            });

            navigate("/login");
        } catch (err) {
            console.error("Logout error:", err);
            navigate("/login");
        }};
    
        logoutUser();
    }, [navigate]);

    return <p>Logging out...</p>;
}

export default Logout;