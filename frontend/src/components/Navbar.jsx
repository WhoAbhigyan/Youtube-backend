import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import Avatar from "./Avatar";
import useAuth from "../hooks/useAuth";
import useDismissOnOutside from "../hooks/useDismissOnOutside";
import { useRef } from "react";
import {
    CloseIcon,
    DashboardIcon,
    HistoryIcon,
    LikeVideosIcon,
    LogoutIcon,
    PlusIcon,
    SearchIcon,
    UploadIcon,
    UserIcon
} from "./Icons";
import { cx } from "../utils/format";
import "./Navbar.css";

const Navbar = ({ onToggleSidebar, search, onSearch }) => {
    const { user, logout } = useAuth();
    const [draft, setDraft] = useState(search ?? "");
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useDismissOnOutside(menuRef, menuOpen, () => setMenuOpen(false));

    const submit = (event) => {
        event.preventDefault();
        onSearch?.(draft.trim());
    };

    const clearSearch = () => {
        setDraft("");
        onSearch?.("");
    };

    const handleLogout = async () => {
        setMenuOpen(false);
        await logout();
    };

    return (
        <header className="navbar">
            <div className="navbar__left">
                <button
                    type="button"
                    className="icon-btn"
                    onClick={onToggleSidebar}
                    aria-label="Toggle navigation menu"
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                        <path d="M3 6h18M3 12h18M3 18h18" />
                    </svg>
                </button>
                <Logo />
            </div>

            <form className="navbar__search" onSubmit={submit} role="search">
                <div className="navbar__search-field">
                    <SearchIcon size={18} className="navbar__search-icon" />
                    <input
                        className="navbar__search-input"
                        type="search"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder="Search videos"
                        aria-label="Search videos"
                    />
                    {draft && (
                        <button
                            type="button"
                            className="navbar__search-clear"
                            onClick={clearSearch}
                            aria-label="Clear search"
                        >
                            <CloseIcon size={16} />
                        </button>
                    )}
                </div>
                <button type="submit" className="navbar__search-submit" aria-label="Search">
                    <SearchIcon size={20} />
                </button>
            </form>

            <div className="navbar__right">
                {user ? (
                    <>
                        <Link
                            to="/upload"
                            className="btn btn--ghost navbar__create"
                            title="Upload video"
                        >
                            <PlusIcon size={20} />
                            <span className="navbar__create-label">Create</span>
                        </Link>

                        <div className="navbar__menu" ref={menuRef}>
                            <button
                                type="button"
                                className="navbar__avatar-btn"
                                onClick={() => setMenuOpen((open) => !open)}
                                aria-haspopup="menu"
                                aria-expanded={menuOpen}
                                aria-label="Account menu"
                            >
                                <Avatar user={user} size={34} />
                            </button>

                            {menuOpen && (
                                <div className="menu" role="menu">
                                    <div className="menu__header">
                                        <Avatar user={user} size={40} />
                                        <div className="menu__identity">
                                            <strong className="truncate">{user.fullName}</strong>
                                            <span className="menu__handle truncate">@{user.username}</span>
                                        </div>
                                    </div>

                                    <div className="menu__list">
                                        <Link
                                            to="/profile"
                                            className="menu__item"
                                            role="menuitem"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <UserIcon size={18} />
                                            Your channel
                                        </Link>
                                        <Link
                                            to="/dashboard"
                                            className="menu__item"
                                            role="menuitem"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <DashboardIcon size={18} />
                                            Creator dashboard
                                        </Link>
                                        <Link
                                            to="/upload"
                                            className="menu__item"
                                            role="menuitem"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <UploadIcon size={18} />
                                            Upload video
                                        </Link>
                                        <Link
                                            to="/liked"
                                            className="menu__item"
                                            role="menuitem"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <LikeVideosIcon size={18} />
                                            Liked videos
                                        </Link>
                                        <Link
                                            to="/history"
                                            className="menu__item"
                                            role="menuitem"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <HistoryIcon size={18} />
                                            Watch history
                                        </Link>
                                    </div>

                                    <div className="menu__footer">
                                        <button
                                            type="button"
                                            className={cx("menu__item", "menu__item--danger")}
                                            role="menuitem"
                                            onClick={handleLogout}
                                        >
                                            <LogoutIcon size={18} />
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <Link to="/login" className="btn btn--outline navbar__signin">
                        Sign in
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Navbar;
