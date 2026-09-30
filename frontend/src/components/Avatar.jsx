import { Link } from "react-router-dom";
import { cx } from "../utils/format";
import "./Avatar.css";

const initials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "?";

const Avatar = ({ user, size = 36, to, className }) => {
    const name = user?.fullName || user?.username || "";
    const src = user?.avatar?.url;
    const classes = cx("avatar", className);
    const style = { width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.38)) };

    const image = src ? (
        <img className={classes} style={style} src={src} alt={name} loading="lazy" />
    ) : (
        <span className={cx(classes, "avatar--fallback")} style={style} aria-hidden="true">
            {initials(name)}
        </span>
    );

    if (to) {
        return (
            <Link to={to} className="avatar-link" aria-label={name ? `${name}'s channel` : "Channel"}>
                {image}
            </Link>
        );
    }

    return image;
};

export default Avatar;
