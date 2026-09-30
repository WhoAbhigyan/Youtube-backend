import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import Avatar from "../components/Avatar";
import FileInput from "../components/FileInput";
import { Notice } from "../components/States";
import { CheckIcon, SettingsIcon } from "../components/Icons";
import useAuth from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { authApi } from "../services/endpoints";
import { getErrorMessage } from "../services/api";
import "./Profile.css";

const Section = ({ title, description, children, footer }) => (
    <section className="panel profile__section">
        <div className="profile__section-text">
            <h2 className="panel__title">{title}</h2>
            {description && <p className="panel__subtitle">{description}</p>}
        </div>
        <div className="profile__section-body">{children}</div>
        {footer && <div className="profile__section-footer">{footer}</div>}
    </section>
);

const Profile = () => {
    useDocumentTitle("Your channel");

    const { user, setUser } = useAuth();

    const [fullName, setFullName] = useState(user?.fullName ?? "");
    const [email, setEmail] = useState(user?.email ?? "");
    const [detailsSaving, setDetailsSaving] = useState(false);
    const [detailsNotice, setDetailsNotice] = useState("");
    const [detailsError, setDetailsError] = useState("");

    const [avatar, setAvatar] = useState(null);
    const [avatarSaving, setAvatarSaving] = useState(false);
    const [avatarNotice, setAvatarNotice] = useState("");
    const [avatarError, setAvatarError] = useState("");

    const [cover, setCover] = useState(null);
    const [coverSaving, setCoverSaving] = useState(false);
    const [coverNotice, setCoverNotice] = useState("");
    const [coverError, setCoverError] = useState("");

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordNotice, setPasswordNotice] = useState("");
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        setFullName(user?.fullName ?? "");
        setEmail(user?.email ?? "");
    }, [user]);

    const saveDetails = async (event) => {
        event.preventDefault();
        if (detailsSaving) return;

        setDetailsSaving(true);
        setDetailsNotice("");
        setDetailsError("");

        try {
            const updated = await authApi.updateAccount({ fullName: fullName.trim(), email: email.trim() });
            setUser((current) => ({ ...current, ...updated }));
            setDetailsNotice("Account details updated.");
        } catch (err) {
            console.error("Account update failed:", err);
            setDetailsError(getErrorMessage(err, "Could not update your details"));
        } finally {
            setDetailsSaving(false);
        }
    };

    const saveAvatar = async () => {
        if (!avatar || avatarSaving) return;

        const payload = new FormData();
        payload.append("avatar", avatar);

        setAvatarSaving(true);
        setAvatarNotice("");
        setAvatarError("");

        try {
            const updated = await authApi.updateAvatar(payload);
            setUser((current) => ({ ...current, ...updated }));
            setAvatar(null);
            setAvatarNotice("Profile picture updated.");
        } catch (err) {
            console.error("Avatar update failed:", err);
            setAvatarError(getErrorMessage(err, "Could not update your profile picture"));
        } finally {
            setAvatarSaving(false);
        }
    };

    const saveCover = async () => {
        if (!cover || coverSaving) return;

        const payload = new FormData();
        payload.append("coverImage", cover);

        setCoverSaving(true);
        setCoverNotice("");
        setCoverError("");

        try {
            const updated = await authApi.updateCoverImage(payload);
            setUser((current) => ({ ...current, ...updated }));
            setCover(null);
            setCoverNotice("Cover image updated.");
        } catch (err) {
            console.error("Cover update failed:", err);
            setCoverError(getErrorMessage(err, "Could not update your cover image"));
        } finally {
            setCoverSaving(false);
        }
    };

    const savePassword = async (event) => {
        event.preventDefault();
        if (passwordSaving) return;

        setPasswordNotice("");
        setPasswordError("");

        if (newPassword.length < 8) {
            setPasswordError("Your new password must be at least 8 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("The new passwords do not match");
            return;
        }

        setPasswordSaving(true);

        try {
            await authApi.changePassword({ oldPassword, newPassword });
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordNotice("Password changed.");
        } catch (err) {
            console.error("Password change failed:", err);
            setPasswordError(getErrorMessage(err, "Could not change your password"));
        } finally {
            setPasswordSaving(false);
        }
    };

    const hasDetailsChanges =
        fullName.trim() !== (user?.fullName ?? "") || email.trim() !== (user?.email ?? "");

    return (
        <div className="profile">
            <PageHeader
                eyebrow="Settings"
                title="Your channel"
                description="Everything here is written straight to your user document."
                actions={
                    user?.username && (
                        <Link to={`/channel/${user.username}`} className="btn btn--outline">
                            <SettingsIcon size={18} />
                            View public channel
                        </Link>
                    )
                }
            />

            <div className="profile__banner">
                {user?.coverImage?.url ? (
                    <img className="profile__cover" src={user.coverImage.url} alt="" />
                ) : (
                    <span className="profile__cover profile__cover--empty" aria-hidden="true" />
                )}

                <div className="profile__identity">
                    <Avatar user={user} size={80} className="profile__avatar" />
                    <div>
                        <p className="profile__name">{user?.fullName}</p>
                        <p className="profile__handle">@{user?.username}</p>
                    </div>
                </div>
            </div>

            <Section
                title="Account details"
                description="Your display name and the email used to sign in."
                footer={
                    <button
                        type="submit"
                        form="profile-details-form"
                        className="btn btn--primary"
                        disabled={detailsSaving || !hasDetailsChanges}
                    >
                        {detailsSaving && <span className="spinner spinner--sm" />}
                        {detailsSaving ? "Saving…" : "Save changes"}
                    </button>
                }
            >
                <form id="profile-details-form" className="profile__fields" onSubmit={saveDetails}>
                    {detailsNotice && <Notice tone="info">{detailsNotice}</Notice>}
                    {detailsError && <Notice tone="error">{detailsError}</Notice>}

                    <div className="field">
                        <label className="label" htmlFor="profile-fullname">
                            Full name
                        </label>
                        <input
                            id="profile-fullname"
                            className="input"
                            value={fullName}
                            onChange={(event) => setFullName(event.target.value)}
                            maxLength={60}
                            required
                        />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="profile-email">
                            Email
                        </label>
                        <input
                            id="profile-email"
                            className="input"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="profile-username">
                            Username
                        </label>
                        <input id="profile-username" className="input" value={user?.username ?? ""} disabled />
                        <p className="hint">Usernames are fixed after registration by the backend.</p>
                    </div>
                </form>
            </Section>

            <Section title="Profile picture" description="Square images look best. Replaces the current one.">
                <div className="profile__fields">
                    {avatarNotice && <Notice tone="info">{avatarNotice}</Notice>}
                    {avatarError && <Notice tone="error">{avatarError}</Notice>}

                    <div className="profile__media-row">
                        <Avatar user={user} size={72} />
                        <FileInput
                            label="New avatar"
                            accept="image/*"
                            file={avatar}
                            onChange={(file) => {
                                setAvatar(file);
                                setAvatarNotice("");
                                setAvatarError("");
                            }}
                            hint="Stored in Cloudinary and linked to your account."
                        />
                    </div>

                    {avatar && (
                        <div className="profile__media-actions">
                            <button type="button" className="btn btn--primary btn--sm" onClick={saveAvatar} disabled={avatarSaving}>
                                {avatarSaving && <span className="spinner spinner--sm" />}
                                {avatarSaving ? "Uploading…" : "Upload avatar"}
                            </button>
                            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setAvatar(null)} disabled={avatarSaving}>
                                Discard
                            </button>
                        </div>
                    )}
                </div>
            </Section>

            <Section title="Cover image" description="The wide banner at the top of your channel page.">
                <div className="profile__fields">
                    {coverNotice && <Notice tone="info">{coverNotice}</Notice>}
                    {coverError && <Notice tone="error">{coverError}</Notice>}

                    <FileInput
                        label="New cover image"
                        accept="image/*"
                        file={cover}
                        onChange={(file) => {
                            setCover(file);
                            setCoverNotice("");
                            setCoverError("");
                        }}
                        hint="A wide image (about 6:1) fills the banner best."
                    />

                    {cover && (
                        <div className="profile__media-actions">
                            <button type="button" className="btn btn--primary btn--sm" onClick={saveCover} disabled={coverSaving}>
                                {coverSaving && <span className="spinner spinner--sm" />}
                                {coverSaving ? "Uploading…" : "Upload cover"}
                            </button>
                            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setCover(null)} disabled={coverSaving}>
                                Discard
                            </button>
                        </div>
                    )}
                </div>
            </Section>

            <Section title="Password" description="At least 8 characters.">
                <form className="profile__fields" onSubmit={savePassword}>
                    {passwordNotice && (
                        <p className="profile__inline-notice" role="status">
                            <CheckIcon size={16} />
                            {passwordNotice}
                        </p>
                    )}
                    {passwordError && <Notice tone="error">{passwordError}</Notice>}

                    <div className="field">
                        <label className="label" htmlFor="profile-old-password">
                            Current password
                        </label>
                        <input
                            id="profile-old-password"
                            className="input"
                            type="password"
                            value={oldPassword}
                            onChange={(event) => setOldPassword(event.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <div className="profile__grid-2">
                        <div className="field">
                            <label className="label" htmlFor="profile-new-password">
                                New password
                            </label>
                            <input
                                id="profile-new-password"
                                className="input"
                                type="password"
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                autoComplete="new-password"
                                minLength={8}
                                required
                            />
                        </div>

                        <div className="field">
                            <label className="label" htmlFor="profile-confirm-password">
                                Confirm password
                            </label>
                            <input
                                id="profile-confirm-password"
                                className="input"
                                type="password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                autoComplete="new-password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn--primary"
                        disabled={passwordSaving || !oldPassword || !newPassword || !confirmPassword}
                    >
                        {passwordSaving && <span className="spinner spinner--sm" />}
                        {passwordSaving ? "Updating…" : "Change password"}
                    </button>
                </form>
            </Section>
        </div>
    );
};

export default Profile;
