import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useIsMobile } from "../hooks/useMediaQuery";
import "./Layout.css";

const Layout = () => {
    const isMobile = useIsMobile();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const query = searchParams.get("q") ?? "";

    // close the mobile drawer on navigation
    useEffect(() => {
        setDrawerOpen(false);
    }, [location.pathname, location.search]);

    // reset scroll between pages
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [location.pathname]);

    // lock the page behind the drawer
    useEffect(() => {
        document.body.style.overflow = drawerOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [drawerOpen]);

    const toggleSidebar = useCallback(() => {
        if (isMobile) {
            setDrawerOpen((open) => !open);
        } else {
            setCollapsed((value) => !value);
        }
    }, [isMobile]);

    const handleSearch = useCallback(
        (term) => {
            navigate(term ? `/?q=${encodeURIComponent(term)}` : "/");
        },
        [navigate]
    );

    return (
        <div className="app">
            <a className="skip-link" href="#main-content">
                Skip to content
            </a>

            <Navbar
                onToggleSidebar={toggleSidebar}
                search={query}
                onSearch={handleSearch}
            />

            <div className="app__body">
                <Sidebar
                    open={drawerOpen}
                    collapsed={collapsed && !isMobile}
                    onClose={() => setDrawerOpen(false)}
                />

                <main className="app__main" id="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
