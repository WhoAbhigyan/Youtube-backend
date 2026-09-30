import Logo from "./Logo";
import { CheckIcon, PlayIcon } from "./Icons";
import "./AuthLayout.css";

const highlights = [
    "Upload in 4K and manage every video you publish",
    "Build playlists and keep your watch history in sync",
    "Subscribe to creators and join the conversation"
];

const AuthLayout = ({ title, subtitle, children, footer }) => (
    <div className="auth">
        <div className="auth__glow" aria-hidden="true" />

        <div className="auth__panel">
            <aside className="auth__aside">
                <Logo />
                <h2 className="auth__headline">
                    A home for the videos
                    <span> you care about.</span>
                </h2>
                <ul className="auth__list">
                    {highlights.map((item) => (
                        <li key={item}>
                            <span className="auth__check">
                                <CheckIcon size={14} />
                            </span>
                            {item}
                        </li>
                    ))}
                </ul>
                <p className="auth__stat">
                    <PlayIcon size={14} />
                    Powered by your own backend — no seeded demo content.
                </p>
            </aside>

            <main className="auth__main">
                <div className="auth__mobile-brand">
                    <Logo />
                </div>

                <div className="auth__card">
                    <h1 className="auth__title">{title}</h1>
                    {subtitle && <p className="auth__subtitle">{subtitle}</p>}

                    {children}

                    {footer && <div className="auth__footer">{footer}</div>}
                </div>

                <p className="auth__legal">
                    By continuing you agree to keep the community respectful.
                </p>
            </main>
        </div>
    </div>
);

export default AuthLayout;
