import { AlertIcon, CheckIcon, FilmIcon, PlaylistIcon, SearchIcon, ChatIcon } from "./Icons";
import "./States.css";

const StateIcon = ({ icon: Icon }) => <Icon size={30} />;

export const EmptyState = ({ icon: Icon = FilmIcon, title, description, action }) => (
    <div className="state">
        <span className="state__icon">
            <StateIcon icon={Icon} />
        </span>
        <h3 className="state__title">{title}</h3>
        {description && <p className="state__text">{description}</p>}
        {action}
    </div>
);

export const ErrorState = ({
    title = "Something went wrong",
    message,
    onRetry,
    retryLabel = "Try again",
    action
}) => (
    <div className="state state--error" role="alert">
        <span className="state__icon state__icon--error">
            <AlertIcon size={30} />
        </span>
        <h3 className="state__title">{title}</h3>
        {message && <p className="state__text">{message}</p>}
        {onRetry && (
            <button type="button" className="btn btn--outline btn--sm" onClick={onRetry}>
                {retryLabel}
            </button>
        )}
        {action}
    </div>
);

export const Notice = ({ tone = "info", children }) => (
    <p className={`notice notice--${tone}`} role={tone === "error" ? "alert" : "status"}>
        {tone === "error" ? <AlertIcon size={18} /> : <CheckIcon size={18} />}
        <span>{children}</span>
    </p>
);

export const SearchEmptyState = ({ query, onReset }) => (
    <EmptyState
        icon={SearchIcon}
        title="No results found"
        description={
            query
                ? `Nothing matched “${query}”. Try a different search term or another category.`
                : "Try a different search term."
        }
        action={
            onReset && (
                <button type="button" className="btn btn--outline btn--sm" onClick={onReset}>
                    Clear search
                </button>
            )
        }
    />
);

export const NoComments = () => (
    <EmptyState
        icon={ChatIcon}
        title="No comments yet"
        description="Be the first to share what you think about this video."
    />
);

export const NoPlaylists = ({ action }) => (
    <EmptyState
        icon={PlaylistIcon}
        title="No playlists yet"
        description="Create a playlist to organise videos you want to watch later."
        action={action}
    />
);
