import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function Navbar() {
    const { user, logoutUser } = useAuth();

    return (
        <header className="top-navbar">

            <div className="navbar-left">
                <button className="menu-button">
                    ☰
                </button>

                <Link to="/" className="logo">
                    <span className="logo-icon">▶</span>
                    YouTube
                </Link>
            </div>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search"
                />

                <button className="search-button">
                    🔍
                </button>
            </div>

            <div className="navbar-right">

                {user && (
                    <Link to="/upload" className="create-button">
                        + Create
                    </Link>
                )}

                {user ? (
                    <>
                        <Link to="/profile">
                            <img
                                src={user.avatar?.url}
                                alt={user.username}
                                className="navbar-avatar"
                            />
                        </Link>

                        <button
                            className="logout-button"
                            onClick={logoutUser}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="login-link">
                            Sign in
                        </Link>
                    </>
                )}

            </div>

        </header>
    );
}

export default Navbar;