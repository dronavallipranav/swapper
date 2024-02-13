import { useEffect } from "react";
import { logout } from "../services/AuthService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LogoutPage = () => {
    const nav = useNavigate();
    const { logoutUser } = useAuth();
    
    useEffect(() => {
        logout();
        logoutUser();
        nav('/');
    }, []);
    
    return <p>Logging you out...</p>;
}

export default LogoutPage;