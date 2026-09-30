import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";

function Login() {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await api.post("/users/login", {
                email,
                password
            });

            setUser(response.data.message);

            navigate("/");
        } catch (error) {
                console.log("ERROR:", error);
                console.log("MESSAGE:", error.message);
                console.log("RESPONSE:", error.response);
                console.log("DATA:", error.response?.data);
                setError("Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main>
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && <p>{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </main>
    );
}

export default Login;