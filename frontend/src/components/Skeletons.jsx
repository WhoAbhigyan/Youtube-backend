import { cx } from "../utils/format";
import "./Skeletons.css";

export const SkeletonCard = () => (
    <div className="skeleton-card" aria-hidden="true">
        <div className="skeleton skeleton-card__thumb" />
        <div className="skeleton-card__body">
            <div className="skeleton skeleton-card__line skeleton-card__line--title" />
            <div className="skeleton-card__meta">
                <div className="skeleton skeleton-card__avatar" />
                <div className="skeleton-card__meta-text">
                    <div className="skeleton skeleton-card__line" />
                    <div className="skeleton skeleton-card__line skeleton-card__line--short" />
                </div>
            </div>
        </div>
    </div>
);

export const SkeletonGrid = ({ count = 8 }) => (
    <div className="skeleton-grid" role="status" aria-label="Loading videos">
        {Array.from({ length: count }, (_, index) => (
            <SkeletonCard key={index} />
        ))}
        <span className="sr-only">Loading…</span>
    </div>
);

export const SkeletonRow = ({ lines = 3, avatar = false }) => (
    <div className="skeleton-row" role="status" aria-label="Loading">
        {avatar && <div className="skeleton skeleton-row__avatar" />}
        <div className="skeleton-row__content">
            {Array.from({ length: lines }, (_, index) => (
                <div
                    key={index}
                    className={cx("skeleton", "skeleton-row__line", index === lines - 1 && "skeleton-row__line--short")}
                />
            ))}
        </div>
        <span className="sr-only">Loading…</span>
    </div>
);

export const SkeletonStats = ({ count = 4 }) => (
    <div className="skeleton-stats" role="status" aria-label="Loading statistics">
        {Array.from({ length: count }, (_, index) => (
            <div key={index} className="skeleton skeleton-stats__item" />
        ))}
        <span className="sr-only">Loading…</span>
    </div>
);
