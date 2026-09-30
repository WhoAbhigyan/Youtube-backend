import { useEffect, useId, useRef, useState } from "react";
import { CloseIcon, FilmIcon, ImageIcon, UploadIcon } from "./Icons";
import { formatBytes } from "../utils/format";
import "./FileInput.css";

/**
 * Styled file picker: real <input type="file"> kept accessible, with a preview
 * of the selection, the file name/size and a way to clear it.
 */
const FileInput = ({
    label,
    accept = "image/*",
    file,
    onChange,
    hint,
    required = false,
    error = "",
    kind = "image",
    disabled = false,
    preview = true
}) => {
    const id = useId();
    const inputRef = useRef(null);
    const [objectUrl, setObjectUrl] = useState("");

    useEffect(() => {
        if (!file || !preview) {
            setObjectUrl("");
            return undefined;
        }
        const url = URL.createObjectURL(file);
        setObjectUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file, preview]);

    const Icon = kind === "video" ? FilmIcon : ImageIcon;

    const handleChange = (event) => {
        onChange(event.target.files?.[0] ?? null);
    };

    const clear = () => {
        if (inputRef.current) inputRef.current.value = "";
        onChange(null);
    };

    return (
        <div className="file-field">
            {label && (
                <label className="label" htmlFor={id}>
                    {label}
                    {required && <span className="file-field__required"> Required</span>}
                </label>
            )}

            <div className={`file-drop${file ? " file-drop--filled" : ""}${error ? " file-drop--error" : ""}`}>
                <input
                    id={id}
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    className="file-drop__input"
                    onChange={handleChange}
                    disabled={disabled}
                    required={required}
                />

                {file ? (
                    <div className="file-drop__preview">
                        {preview && kind === "image" && objectUrl ? (
                            <img className="file-drop__thumb" src={objectUrl} alt="" />
                        ) : (
                            <span className="file-drop__thumb file-drop__thumb--icon">
                                <Icon size={20} />
                            </span>
                        )}

                        <span className="file-drop__meta">
                            <span className="file-drop__name truncate">{file.name}</span>
                            <span className="file-drop__size">{formatBytes(file.size)}</span>
                        </span>

                        <button
                            type="button"
                            className="icon-btn icon-btn--sm"
                            onClick={clear}
                            disabled={disabled}
                            aria-label={`Remove ${file.name}`}
                        >
                            <CloseIcon size={18} />
                        </button>
                    </div>
                ) : (
                    <span className="file-drop__cta">
                        <UploadIcon size={18} />
                        <span>Choose {kind === "video" ? "a video file" : "an image"}</span>
                    </span>
                )}
            </div>

            {error ? <p className="error-text">{error}</p> : hint ? <p className="hint">{hint}</p> : null}
        </div>
    );
};

export default FileInput;
