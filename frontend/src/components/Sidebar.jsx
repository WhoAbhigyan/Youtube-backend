import { Link } from "react-router-dom";

function Sidebar() {
    return (
        <aside className="sidebar">

            <Link to="/" className="sidebar-item active">
                🏠
                <span>Home</span>
            </Link>

            <Link to="/" className="sidebar-item">
                ▶️
                <span>Shorts</span>
            </Link>

            <Link to="/" className="sidebar-item">
                📺
                <span>Subscriptions</span>
            </Link>

            <hr />

            <h3>You</h3>

            <Link to="/profile" className="sidebar-item">
                👤
                <span>Your channel</span>
            </Link>

            <Link to="/" className="sidebar-item">
                🕘
                <span>History</span>
            </Link>

            <Link to="/playlist" className="sidebar-item">
                📋
                <span>Playlists</span>
            </Link>

            <Link to="/" className="sidebar-item">
                ⏱️
                <span>Watch later</span>
            </Link>

        </aside>
    );
}

export default Sidebar;