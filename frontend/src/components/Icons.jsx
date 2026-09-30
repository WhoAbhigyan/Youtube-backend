/**
 * Single icon set: 24x24 stroke icons that inherit `currentColor`.
 * Keeps the interface visually consistent (no emoji, no mixed icon fonts).
 */

const base = (size) => ({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    focusable: false
});

const icon = (paths, displayName) => {
    const Icon = ({ size = 20, ...rest }) => (
        <svg {...base(size)} {...rest}>
            {paths}
        </svg>
    );
    Icon.displayName = displayName;
    return Icon;
};

export const MenuIcon = icon(
    <>
        <path d="M3 6h18M3 12h18M3 18h18" />
    </>,
    "MenuIcon"
);

export const SearchIcon = icon(
    <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.2-3.2" />
    </>,
    "SearchIcon"
);

export const HomeIcon = icon(
    <>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.6V20a1 1 0 0 0 1 1h3.5v-5.5h5V21H18a1 1 0 0 0 1-1V9.6" />
    </>,
    "HomeIcon"
);

export const BoltIcon = icon(
    <>
        <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" />
    </>,
    "BoltIcon"
);

export const SubscriptionsIcon = icon(
    <>
        <rect x="2.5" y="5" width="19" height="14" rx="4" />
        <path d="M10 9.5 15 12l-5 2.5v-5Z" />
    </>,
    "SubscriptionsIcon"
);

export const UserIcon = icon(
    <>
        <circle cx="12" cy="8" r="3.6" />
        <path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4S18.3 16.4 19.5 20" />
    </>,
    "UserIcon"
);

export const HistoryIcon = icon(
    <>
        <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
        <path d="M3 4.5V9h4.5" />
        <path d="M12 7.8V12l3 1.8" />
    </>,
    "HistoryIcon"
);

export const PlaylistIcon = icon(
    <>
        <path d="M3 6h11M3 11h11M3 16h7" />
        <path d="m17 13 4 3-4 3v-6Z" />
    </>,
    "PlaylistIcon"
);

export const ClockIcon = icon(
    <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
    </>,
    "ClockIcon"
);

export const LikeVideosIcon = icon(
    <>
        <path d="M7 21V10.5l4.2-7.2c1.6 0 2.3 1.2 1.9 2.7L12.4 9.5h5.1c1.9 0 3 1.5 2.6 3.3l-1.3 5.7c-.3 1.4-1.5 2.5-2.9 2.5H7Z" />
        <path d="M7 10.5H4.5v10.5H7" />
    </>,
    "LikeVideosIcon"
);

export const ChatIcon = icon(
    <>
        <path d="M20.5 12.5c0 3.9-3.8 7-8.5 7-1 0-2-.15-2.9-.42L4 20.5l1.3-3.6A6.6 6.6 0 0 1 3.5 12.5c0-3.9 3.8-7 8.5-7s8.5 3.1 8.5 7Z" />
    </>,
    "ChatIcon"
);

export const DashboardIcon = icon(
    <>
        <rect x="3" y="3" width="7.5" height="9" rx="2" />
        <rect x="13.5" y="3" width="7.5" height="5.5" rx="2" />
        <rect x="13.5" y="11.5" width="7.5" height="9.5" rx="2" />
        <rect x="3" y="15" width="7.5" height="6" rx="2" />
    </>,
    "DashboardIcon"
);

export const UploadIcon = icon(
    <>
        <path d="M12 16V4" />
        <path d="m7.5 8.5 4.5-4.5 4.5 4.5" />
        <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" />
    </>,
    "UploadIcon"
);

export const PlusIcon = icon(
    <>
        <path d="M12 5v14M5 12h14" />
    </>,
    "PlusIcon"
);

export const CloseIcon = icon(
    <>
        <path d="M6 6l12 12M18 6 6 18" />
    </>,
    "CloseIcon"
);

export const CheckIcon = icon(
    <>
        <path d="m5 12.5 4.5 4.5L19 7.5" />
    </>,
    "CheckIcon"
);

export const AlertIcon = icon(
    <>
        <path d="M12 4.5 2.8 20h18.4L12 4.5Z" />
        <path d="M12 10v4" />
        <path d="M12 17h.01" />
    </>,
    "AlertIcon"
);

export const LikeIcon = icon(
    <>
        <path d="M7 21V10.5l4.2-7.2c1.6 0 2.3 1.2 1.9 2.7L12.4 9.5h5.1c1.9 0 3 1.5 2.6 3.3l-1.3 5.7c-.3 1.4-1.5 2.5-2.9 2.5H7Z" />
        <path d="M7 10.5H4.5v10.5H7" />
    </>,
    "LikeIcon"
);

export const DislikeIcon = icon(
    <>
        <path d="M17 3v10.5l-4.2 7.2c-1.6 0-2.3-1.2-1.9-2.7l.7-3.5H6.5c-1.9 0-3-1.5-2.6-3.3l1.3-5.7C5.5 4.1 6.7 3 8.1 3H17Z" />
        <path d="M17 13.5h2.5V3H17" />
    </>,
    "DislikeIcon"
);

export const ShareIcon = icon(
    <>
        <path d="M20.5 12.5 13 18.8V15H9.5a5.5 5.5 0 0 1-5.5-5.5V8.8" />
        <path d="M9.5 4 4 8.8l5.5 4.8" />
        <path d="M13 15h3.5" />
    </>,
    "ShareIcon"
);

export const BookmarkIcon = icon(
    <>
        <path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4-6.5 4v-16a1 1 0 0 1 1-1Z" />
    </>,
    "BookmarkIcon"
);

export const EyeIcon = icon(
    <>
        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
        <circle cx="12" cy="12" r="3" />
    </>,
    "EyeIcon"
);

export const EditIcon = icon(
    <>
        <path d="M4 20h4.5L19 9.5 14.5 5 4 15.5V20Z" />
        <path d="m13 6.5 4.5 4.5" />
    </>,
    "EditIcon"
);

export const TrashIcon = icon(
    <>
        <path d="M4.5 6.5h15" />
        <path d="M9.5 6.5V4.8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.7" />
        <path d="M6.5 6.5 7.4 20a1 1 0 0 0 1 .9h7.2a1 1 0 0 0 1-.9l.9-13.5" />
        <path d="M10.5 10v7M13.5 10v7" />
    </>,
    "TrashIcon"
);

export const GlobeIcon = icon(
    <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M3.5 12h17" />
        <path d="M12 3.5c2.2 2.4 3.3 5.4 3.3 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.3-5.4-3.3-8.5S9.8 5.9 12 3.5Z" />
    </>,
    "GlobeIcon"
);

export const LockIcon = icon(
    <>
        <path d="M6.5 10.5h11a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z" />
        <path d="M8.5 10.5V7.8a3.5 3.5 0 1 1 7 0v2.7" />
    </>,
    "LockIcon"
);

export const MailIcon = icon(
    <>
        <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
        <path d="m4 7.5 7.1 5a1.6 1.6 0 0 0 1.8 0l7.1-5" />
    </>,
    "MailIcon"
);

export const EyeOpenIcon = icon(
    <>
        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
        <circle cx="12" cy="12" r="3" />
    </>,
    "EyeOpenIcon"
);

export const EyeClosedIcon = icon(
    <>
        <path d="M4 4.5 20 20.5" />
        <path d="M9.6 6.1A9.9 9.9 0 0 1 12 5.7c6 0 9.5 6.3 9.5 6.3a17 17 0 0 1-3.2 4" />
        <path d="M6.3 8.1A16.6 16.6 0 0 0 2.5 12S6 18.3 12 18.3a9.6 9.6 0 0 0 3.6-.7" />
        <path d="M10 10.1a2.9 2.9 0 0 0 4 4" />
    </>,
    "EyeClosedIcon"
);

export const CameraIcon = icon(
    <>
        <path d="M3.5 8.5h3l1.5-2.5h8l1.5 2.5h3a1 1 0 0 1 1 1v8.5a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1Z" />
        <circle cx="12" cy="13.5" r="3.5" />
    </>,
    "CameraIcon"
);

export const ImageIcon = icon(
    <>
        <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
        <circle cx="8.5" cy="10" r="1.8" />
        <path d="m4 17 4.8-4.3a1.5 1.5 0 0 1 2 0L15 16" />
        <path d="m14 14.5 1.8-1.6a1.5 1.5 0 0 1 2 0L20.5 15" />
    </>,
    "ImageIcon"
);

export const FilmIcon = icon(
    <>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="M7.5 5v14M16.5 5v14M3 12h18M3 8.5h4.5M3 15.5h4.5M16.5 8.5H21M16.5 15.5H21" />
    </>,
    "FilmIcon"
);

export const LogoutIcon = icon(
    <>
        <path d="M14 4.5h4.5A1.5 1.5 0 0 1 20 6v12a1.5 1.5 0 0 1-1.5 1.5H14" />
        <path d="M10 8.5 6.5 12 10 15.5" />
        <path d="M6.5 12H16" />
    </>,
    "LogoutIcon"
);

export const SettingsIcon = icon(
    <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7h-.3a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1v-.3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.8 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1Z" />
    </>,
    "SettingsIcon"
);

export const PlayIcon = ({ size = 20, ...rest }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        {...rest}
    >
        <path d="M8 5.2c0-.9 1-1.4 1.7-1L18 10.8c.7.4.7 1.4 0 1.8l-8.3 6.6c-.7.6-1.7 0-1.7-.9V5.2Z" />
    </svg>
);

export const FireIcon = icon(
    <>
        <path d="M12 3c.4 2.4-.6 4-2 5.4C8.4 10 7 11.6 7 14a5 5 0 0 0 10 0c0-1.7-.7-3-1.6-4.2-.5 1-1.2 1.6-2 1.9.3-2.6-.4-5.6-1.4-8.7Z" />
    </>,
    "FireIcon"
);
