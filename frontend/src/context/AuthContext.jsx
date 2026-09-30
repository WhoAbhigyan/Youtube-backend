import { createContext, useEffect, useState } from "react";
import api from "../services/api";

export const AuthContext = createContext();

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getCurrentUser = async () => {
        try {
            const response = await api.get("/users/current-user");

            setUser(response.data.message);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logoutUser = async () => {
        try {
            await api.post("/users/logout");
            setUser(null);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getCurrentUser();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                logoutUser,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;