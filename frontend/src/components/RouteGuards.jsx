import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Logo from "./Logo";
import "./RouteGuards.css";

export const FullPageLoader = ({ label = "Loading" }) => (
    <div className="route-loader" role="status" aria-live="polite">
        <span className="route-loader__mark">
            <Logo compact />
        </span>
        <span className="spinner spinner--lg route-loader__spinner" />
        <p className="route-loader__label">{label}</p>
    </div>
);

/** Every backend route is behind verifyJWT, so app pages require a session. */
export const ProtectedRoute = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <FullPageLoader label="Restoring your session" />;

    if (!user) {
        return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
    }

    return <Outlet />;
};

/** Keeps signed-in users away from the auth screens. */
export const PublicRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <FullPageLoader label="Loading" />;
    if (user) return <Navigate to="/" replace />;

    return <Outlet />;
};
