import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./auth-context";
import { authApi } from "../services/endpoints";
import { getErrorMessage } from "../services/api";

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // restore the session on first load: the access token lives in an httpOnly cookie
    useEffect(() => {
        let active = true;

        authApi
            .currentUser()
            .then((currentUser) => {
                if (active) setUser(currentUser);
            })
            .catch((error) => {
                console.info("No active session:", getErrorMessage(error));
                if (active) setUser(null);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const login = useCallback(async ({ email, password }) => {
        const data = await authApi.login({ email, password });
        setUser(data.user);
        return data.user;
    }, []);

    const register = useCallback(async (formData) => authApi.register(formData), []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error("Logout request failed:", getErrorMessage(error));
        } finally {
            setUser(null);
        }
    }, []);

    const value = useMemo(
        () => ({ user, loading, login, register, logout, setUser }),
        [user, loading, login, register, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
