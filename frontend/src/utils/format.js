/** Small display helpers shared across the app. */

export const cx = (...values) => values.filter(Boolean).join(" ");

export const formatViews = (views = 0) => {
    const value = Number(views) || 0;
    if (value < 1000) return String(value);
    const units = [
        { limit: 1_000_000_000, suffix: "B" },
        { limit: 1_000_000, suffix: "M" },
        { limit: 1_000, suffix: "K" }
    ];
    const unit = units.find((item) => value >= item.limit);
    if (!unit) return String(value);
    const scaled = value / unit.limit;
    const rounded = scaled >= 100 ? Math.round(scaled) : Math.round(scaled * 10) / 10;
    return `${rounded}${unit.suffix}`;
};

/** 0 -> 0:07, 125 -> 2:05, 3725 -> 1:02:05 */
export const formatDuration = (seconds) => {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    const pad = (value) => String(value).padStart(2, "0");
    return hours > 0 ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${minutes}:${pad(secs)}`;
};

export const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
};

export const timeAgo = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const seconds = Math.round((Date.now() - date.getTime()) / 1000);
    const steps = [
        { limit: 60, divisor: 1, unit: "second" },
        { limit: 3600, divisor: 60, unit: "minute" },
        { limit: 86400, divisor: 3600, unit: "hour" },
        { limit: 2592000, divisor: 86400, unit: "day" },
        { limit: 31536000, divisor: 2592000, unit: "month" }
    ];

    const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    for (const step of steps) {
        if (seconds < step.limit) {
            return formatter.format(-Math.round(seconds / step.divisor), step.unit);
        }
    }
    return formatter.format(-Math.round(seconds / 31536000), "year");
};

export const formatBytes = (bytes) => {
    const value = Number(bytes) || 0;
    if (value < 1024) return `${value} B`;
    const units = ["KB", "MB", "GB"];
    let size = value / 1024;
    let index = 0;
    while (size >= 1024 && index < units.length - 1) {
        size /= 1024;
        index += 1;
    }
    return `${Math.round(size * 10) / 10} ${units[index]}`;
};

export const formatCount = (value = 0) => formatViews(value);

export const pluralize = (count, singular, plural = `${singular}s`) =>
    `${count} ${count === 1 ? singular : plural}`;
