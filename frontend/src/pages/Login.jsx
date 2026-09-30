import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { Notice } from "../components/States";
import { EyeClosedIcon, EyeOpenIcon, LockIcon, MailIcon } from "../components/Icons";
import useAuth from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { getErrorMessage, getErrorStatus } from "../services/api";
import "./Login.css";

const Login = () => {
    useDocumentTitle("Sign in");

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [reveal, setReveal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const from = location.state?.from ?? "/";

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitting) return;

        setError("");

        if (!identifier.trim() || !password) {
            setError("Enter your email or username and your password");
            return;
        }

        setSubmitting(true);
        try {
            await login({ email: identifier.trim(), password });
            navigate(from, { replace: true });
        } catch (err) {
            console.error("Login failed:", err);
            const status = getErrorStatus(err);
            if (status === 401) setError("Invalid credentials. Please check your email and password.");
            else if (status === 404) setError("No account found with those details.");
            else setError(getErrorMessage(err, "Login failed. Please try again."));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to continue watching and creating."
            footer={
                <span className="auth__switch">
                    New to VideoTube?
                    <Link to="/register" className="auth__link">
                        Create an account
                    </Link>
                </span>
            }
        >
            <form className="auth__form" onSubmit={handleSubmit} noValidate>
                {error && <Notice tone="error">{error}</Notice>}

                <div className="field">
                    <label className="label" htmlFor="login-identifier">
                        Email or username
                    </label>
                    <div className="input-affix">
                        <MailIcon size={18} className="login__lead-icon" />
                        <input
                            id="login-identifier"
                            className="input login__input"
                            type="text"
                            autoComplete="username"
                            value={identifier}
                            onChange={(event) => setIdentifier(event.target.value)}
                            placeholder="you@example.com"
                            aria-invalid={Boolean(error)}
                        />
                    </div>
                </div>

                <div className="field">
                    <label className="label" htmlFor="login-password">
                        Password
                    </label>
                    <div className="input-affix">
                        <LockIcon size={18} className="login__lead-icon" />
                        <input
                            id="login-password"
                            className="input login__input"
                            type={reveal ? "text" : "password"}
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Your password"
                            aria-invalid={Boolean(error)}
                        />
                        <button
                            type="button"
                            className="input-affix__btn"
                            onClick={() => setReveal((value) => !value)}
                            aria-label={reveal ? "Hide password" : "Show password"}
                            aria-pressed={reveal}
                        >
                            {reveal ? <EyeClosedIcon size={18} /> : <EyeOpenIcon size={18} />}
                        </button>
                    </div>
                </div>

                <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={submitting}>
                    {submitting && <span className="spinner spinner--sm" />}
                    {submitting ? "Signing in…" : "Sign in"}
                </button>
            </form>
        </AuthLayout>
    );
};

export default Login;
