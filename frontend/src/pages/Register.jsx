import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FileInput from "../components/FileInput";
import { Notice } from "../components/States";
import { EyeClosedIcon, EyeOpenIcon } from "../components/Icons";
import useAuth from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { getErrorMessage, getErrorStatus } from "../services/api";
import "./Register.css";

const USERNAME_PATTERN = /^[a-zA-Z0-9_.]+$/;

const Register = () => {
    useDocumentTitle("Create account");

    const navigate = useNavigate();
    const { register, login } = useAuth();

    const [form, setForm] = useState({
        fullName: "",
        username: "",
        email: "",
        password: ""
    });
    const [avatar, setAvatar] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [reveal, setReveal] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const update = (key) => (event) => {
        setForm((current) => ({ ...current, [key]: event.target.value }));
        setFieldErrors((current) => ({ ...current, [key]: "" }));
    };

    const validate = () => {
        const errors = {};

        if (!form.fullName.trim()) errors.fullName = "Full name is required";
        if (!USERNAME_PATTERN.test(form.username.trim())) {
            errors.username = "Letters, numbers, dots and underscores only";
        }
        if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = "Enter a valid email address";
        if (form.password.length < 8) errors.password = "Use at least 8 characters";
        if (!avatar) errors.avatar = "An avatar is required";

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitting) return;

        setError("");
        if (!validate()) return;

        const payload = new FormData();
        payload.append("fullName", form.fullName.trim());
        payload.append("username", form.username.trim());
        payload.append("email", form.email.trim());
        payload.append("password", form.password);
        payload.append("avatar", avatar);
        if (coverImage) payload.append("coverImage", coverImage);

        setSubmitting(true);
        try {
            await register(payload);
            // the backend does not authenticate on register, so sign in right after
            await login({ email: form.email.trim(), password: form.password });
            navigate("/", { replace: true });
        } catch (err) {
            console.error("Registration failed:", err);
            const status = getErrorStatus(err);
            if (status === 409) setError("That username or email is already registered.");
            else if (status === 400) setError(getErrorMessage(err, "Please check the details you entered."));
            else setError(getErrorMessage(err, "Registration failed. Please try again."));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout
            title="Create your channel"
            subtitle="Pick a handle, add a face and start publishing."
            footer={
                <span className="auth__switch">
                    Already have an account?
                    <Link to="/login" className="auth__link">
                        Sign in
                    </Link>
                </span>
            }
        >
            <form className="auth__form" onSubmit={handleSubmit} noValidate>
                {error && <Notice tone="error">{error}</Notice>}

                <div className="register__grid">
                    <div className="field">
                        <label className="label" htmlFor="register-fullname">
                            Full name
                        </label>
                        <input
                            id="register-fullname"
                            className="input"
                            type="text"
                            autoComplete="name"
                            value={form.fullName}
                            onChange={update("fullName")}
                            placeholder="Ada Lovelace"
                            aria-invalid={Boolean(fieldErrors.fullName)}
                        />
                        {fieldErrors.fullName && <p className="error-text">{fieldErrors.fullName}</p>}
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="register-username">
                            Username
                        </label>
                        <div className="register__username">
                            <span className="register__at">@</span>
                            <input
                                id="register-username"
                                className="input"
                                type="text"
                                autoComplete="username"
                                value={form.username}
                                onChange={update("username")}
                                placeholder="adalovelace"
                                aria-invalid={Boolean(fieldErrors.username)}
                            />
                        </div>
                        {fieldErrors.username && <p className="error-text">{fieldErrors.username}</p>}
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="register-email">
                            Email
                        </label>
                        <input
                            id="register-email"
                            className="input"
                            type="email"
                            autoComplete="email"
                            value={form.email}
                            onChange={update("email")}
                            placeholder="you@example.com"
                            aria-invalid={Boolean(fieldErrors.email)}
                        />
                        {fieldErrors.email && <p className="error-text">{fieldErrors.email}</p>}
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="register-password">
                            Password
                        </label>
                        <div className="input-affix">
                            <input
                                id="register-password"
                                className="input"
                                type={reveal ? "text" : "password"}
                                autoComplete="new-password"
                                value={form.password}
                                onChange={update("password")}
                                placeholder="At least 8 characters"
                                aria-invalid={Boolean(fieldErrors.password)}
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
                        {fieldErrors.password ? (
                            <p className="error-text">{fieldErrors.password}</p>
                        ) : (
                            <p className="hint">Minimum 8 characters.</p>
                        )}
                    </div>
                </div>

                <div className="register__media">
                    <FileInput
                        label="Avatar"
                        required
                        accept="image/*"
                        file={avatar}
                        onChange={(file) => {
                            setAvatar(file);
                            setFieldErrors((current) => ({ ...current, avatar: "" }));
                        }}
                        error={fieldErrors.avatar}
                        hint="Square images work best."
                    />
                    <FileInput
                        label="Cover image"
                        accept="image/*"
                        file={coverImage}
                        onChange={setCoverImage}
                        hint="Optional — used as your channel banner."
                    />
                </div>

                <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={submitting}>
                    {submitting && <span className="spinner spinner--sm" />}
                    {submitting ? "Creating your channel…" : "Create account"}
                </button>

                <p className="hint register__note">
                    Your avatar and cover image are uploaded to Cloudinary and stored with your profile.
                </p>
            </form>
        </AuthLayout>
    );
};

export default Register;
