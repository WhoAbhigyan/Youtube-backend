import { Link } from "react-router-dom";
import { HomeIcon, SearchIcon } from "../components/Icons";
import useDocumentTitle from "../hooks/useDocumentTitle";
import "./NotFound.css";

const NotFound = () => {
    useDocumentTitle("Page not found");

    return (
        <div className="notfound">
            <p className="notfound__code" aria-hidden="true">
                404
            </p>

            <h1 className="notfound__title">This page took a wrong turn</h1>
            <p className="notfound__text">
                The page you are looking for does not exist, or it was moved somewhere else.
            </p>

            <div className="notfound__actions">
                <Link to="/" className="btn btn--primary">
                    <HomeIcon size={18} />
                    Back to home
                </Link>
                <Link to="/subscriptions" className="btn btn--outline">
                    <SearchIcon size={18} />
                    Browse subscriptions
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
