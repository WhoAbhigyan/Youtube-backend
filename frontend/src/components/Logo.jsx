import { Link } from "react-router-dom";
import { PlayIcon } from "./Icons";
import "./Logo.css";

const Logo = ({ compact = false }) => (
    <Link to="/" className={`logo${compact ? " logo--compact" : ""}`} aria-label="VideoTube home">
        <span className="logo__mark" aria-hidden="true">
            <PlayIcon size={compact ? 16 : 18} className="logo__play" />
        </span>
        {!compact && (
            <span className="logo__text">
                Video<span className="logo__text-accent">Tube</span>
            </span>
        )}
    </Link>
);

export default Logo;
