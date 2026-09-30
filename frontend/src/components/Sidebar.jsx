import { NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Avatar from "./Avatar";
import {
    BoltIcon,
    CloseIcon,
    DashboardIcon,
    HistoryIcon,
    HomeIcon,
    LikeVideosIcon,
    PlaylistIcon,
    SubscriptionsIcon,
    UploadIcon,
    UserIcon
} from "./Icons";
import "./Sidebar.css";

const browseItems = [
    { to: "/", label: "Home", icon: HomeIcon, end: true },
    { to: "/community", label: "Community", icon: BoltIcon },
    { to: "/subscriptions", label: "Subscriptions", icon: SubscriptionsIcon }
];

const youItems = [
    { to: "/profile", label: "Your channel", icon: UserIcon },
    { to: "/history", label: "History", icon: HistoryIcon },
    { to: "/playlists", label: "Playlists", icon: PlaylistIcon },
    { to: "/liked", label: "Liked videos", icon: LikeVideosIcon }
];

const createItems = [
    { to: "/dashboard", label: "Dashboard", icon: DashboardIcon },
    { to: "/upload", label: "Upload", icon: UploadIcon }
];

const SidebarLink = ({ to, label, icon: Icon, end, onClick }) => (
    <NavLink
        to={to}
        end={end}
        onClick={onClick}
        className={({ isActive }) => `sidebar__item${isActive ? " sidebar__item--active" : ""}`}
        title={label}
    >
        <span className="sidebar__icon">
            <Icon size={22} />
        </span>
        <span className="sidebar__label">{label}</span>
    </NavLink>
);

const SidebarSection = ({ title, items, onNavigate }) => (
    <div className="sidebar__section">
        {title && <h3 className="sidebar__heading">{title}</h3>}
        <ul className="sidebar__list">
            {items.map((item) => (
                <li key={item.to}>
                    <SidebarLink {...item} onClick={onNavigate} />
                </li>
            ))}
        </ul>
    </div>
);

const Sidebar = ({ open, collapsed, onClose, onNavigate }) => {
    const { user } = useAuth();

    return (
        <>
            <div
                className={`sidebar__scrim${open ? " sidebar__scrim--visible" : ""}`}
                onClick={onClose}
                aria-hidden="true"
            />

            <aside
                className={`sidebar${open ? " sidebar--open" : ""}${
                    collapsed ? " sidebar--collapsed" : ""
                }`}
                aria-label="Main navigation"
            >
                <div className="sidebar__mobile-head">
                    <span className="sidebar__mobile-title">Menu</span>
                    <button
                        type="button"
                        className="icon-btn"
                        onClick={onClose}
                        aria-label="Close navigation menu"
                    >
                        <CloseIcon size={20} />
                    </button>
                </div>

                <nav className="sidebar__nav">
                    <SidebarSection items={browseItems} onNavigate={onNavigate} />
                    <hr className="sidebar__divider" />
                    <SidebarSection title="You" items={youItems} onNavigate={onNavigate} />
                    <hr className="sidebar__divider" />
                    <SidebarSection title="Creator" items={createItems} onNavigate={onNavigate} />
                </nav>

                {user && !collapsed && (
                    <NavLink to="/profile" className="sidebar__account" onClick={onNavigate}>
                        <Avatar user={user} size={30} />
                        <span className="sidebar__account-text">
                            <span className="sidebar__account-name truncate">{user.fullName}</span>
                            <span className="sidebar__account-handle truncate">@{user.username}</span>
                        </span>
                    </NavLink>
                )}

                <p className="sidebar__footer">
                    VideoTube<span aria-hidden="true"> · </span>Premium
                </p>
            </aside>
        </>
    );
};

export default Sidebar;
