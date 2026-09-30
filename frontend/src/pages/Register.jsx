import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";

function Register() {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [coverImage, setCoverImage] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const formData = new FormData();

            formData.append("username", username);
            formData.append("email", email);
            formData.append("fullName", fullName);
            formData.append("password", password);
            formData.append("avatar", avatar);
            formData.append("coverImage", coverImage);

            // Register
            await api.post("/users/register", formData);

            // Automatically login after registration
            const loginResponse = await api.post("/users/login", {
                email,
                password
            });

            // Save logged-in user
            setUser(loginResponse.data.message);

            // Go to home
            navigate("/");

        } catch (error) {
            console.log("REGISTER ERROR:", error);

            setError(
                error.response?.data?.message || "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main>
            <h1>Register</h1>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <label>Avatar</label>

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatar(e.target.files[0])}
                />

                <label>Cover Image</label>

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverImage(e.target.files[0])}
                />

                {error && <p>{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Register"}
                </button>

            </form>
        </main>
    );
}

export default Register;