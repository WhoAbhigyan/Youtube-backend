import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import FileInput from "../components/FileInput";
import { Notice } from "../components/States";
import { CheckIcon, FilmIcon, ImageIcon, UploadIcon } from "../components/Icons";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { videoApi } from "../services/endpoints";
import { getErrorMessage } from "../services/api";
import "./UploadVideo.css";

const UploadVideo = () => {
    useDocumentTitle("Upload");

    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const [fieldErrors, setFieldErrors] = useState({});
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState("");
    const [created, setCreated] = useState(null);

    const pickVideo = (file) => {
        setVideoFile(file);
        setFieldErrors((current) => ({ ...current, videoFile: "" }));
        setPreviewUrl(file ? URL.createObjectURL(file) : "");
    };

    const validate = () => {
        const errors = {};
        if (!title.trim()) errors.title = "A title is required";
        if (!description.trim()) errors.description = "A description is required";
        if (!videoFile) errors.videoFile = "Choose a video file";
        if (!thumbnail) errors.thumbnail = "Choose a thumbnail image";
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (uploading) return;

        setError("");
        if (!validate()) return;

        const payload = new FormData();
        payload.append("title", title.trim());
        payload.append("description", description.trim());
        payload.append("videoFile", videoFile);
        payload.append("thumbnail", thumbnail);

        setUploading(true);
        setProgress(0);

        try {
            // the backend derives the owner from the access token
            const video = await videoApi.upload(payload, setProgress);
            setCreated(video);
        } catch (err) {
            console.error("Upload failed:", err);
            setError(getErrorMessage(err, "Upload failed. Please try again."));
        } finally {
            setUploading(false);
        }
    };

    const reset = () => {
        setTitle("");
        setDescription("");
        setVideoFile(null);
        setThumbnail(null);
        setPreviewUrl("");
        setCreated(null);
        setProgress(0);
        setFieldErrors({});
    };

    if (created) {
        return (
            <div className="upload">
                <div className="upload__success panel">
                    <span className="upload__success-icon">
                        <CheckIcon size={30} />
                    </span>
                    <h1 className="upload__success-title">Your video is live</h1>
                    <p className="upload__success-text">
                        “{created.title}” has been uploaded and published to your channel.
                    </p>

                    <div className="upload__success-media">
                        {created.thumbnail?.url ? (
                            <img className="upload__success-thumb" src={created.thumbnail.url} alt="" />
                        ) : (
                            <span className="upload__success-thumb upload__success-thumb--empty">
                                <ImageIcon size={22} />
                            </span>
                        )}
                        <div>
                            <p className="upload__success-name">{created.title}</p>
                            <p className="upload__success-meta">
                                {Math.round(created.duration)}s · {created.isPublished ? "Published" : "Unpublished"}
                            </p>
                        </div>
                    </div>

                    <div className="upload__success-actions">
                        <Link to={`/watch/${created._id}`} className="btn btn--primary">
                            <FilmIcon size={18} />
                            Watch now
                        </Link>
                        <Link to="/dashboard" className="btn btn--outline">
                            Manage in dashboard
                        </Link>
                        <button type="button" className="btn btn--ghost" onClick={reset}>
                            Upload another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="upload">
            <PageHeader
                eyebrow="Creator studio"
                title="Upload a video"
                description="Files are streamed to your backend, uploaded to Cloudinary and stored in MongoDB."
            />

            <form className="upload__form" onSubmit={handleSubmit} noValidate>
                {error && <Notice tone="error">{error}</Notice>}

                <section className="panel upload__section">
                    <h2 className="panel__title">Details</h2>
                    <p className="panel__subtitle">Tell viewers what they are about to watch.</p>

                    <div className="upload__fields">
                        <div className="field">
                            <label className="label" htmlFor="upload-title">
                                Title
                            </label>
                            <input
                                id="upload-title"
                                className="input"
                                type="text"
                                value={title}
                                onChange={(event) => {
                                    setTitle(event.target.value);
                                    setFieldErrors((current) => ({ ...current, title: "" }));
                                }}
                                placeholder="How I built a video platform in a weekend"
                                maxLength={120}
                                aria-invalid={Boolean(fieldErrors.title)}
                            />
                            <div className="upload__field-foot">
                                {fieldErrors.title ? (
                                    <p className="error-text">{fieldErrors.title}</p>
                                ) : (
                                    <span className="hint">A clear, specific title performs best.</span>
                                )}
                                <span className="upload__counter">{title.length}/120</span>
                            </div>
                        </div>

                        <div className="field">
                            <label className="label" htmlFor="upload-description">
                                Description
                            </label>
                            <textarea
                                id="upload-description"
                                className="textarea"
                                value={description}
                                onChange={(event) => {
                                    setDescription(event.target.value);
                                    setFieldErrors((current) => ({ ...current, description: "" }));
                                }}
                                placeholder="What will viewers learn? Add chapters, credits or links."
                                aria-invalid={Boolean(fieldErrors.description)}
                            />
                            {fieldErrors.description && (
                                <p className="error-text">{fieldErrors.description}</p>
                            )}
                        </div>
                    </div>
                </section>

                <section className="panel upload__section">
                    <h2 className="panel__title">Media</h2>
                    <p className="panel__subtitle">Both files are required by the backend.</p>

                    <div className="upload__media">
                        <FileInput
                            label="Video file"
                            kind="video"
                            required
                            accept="video/*"
                            file={videoFile}
                            onChange={pickVideo}
                            error={fieldErrors.videoFile}
                            hint="MP4, MOV or WebM."
                        />

                        <div className="upload__preview">
                            {previewUrl ? (
                                <video className="upload__preview-media" src={previewUrl} controls preload="metadata" />
                            ) : (
                                <span className="upload__preview-empty">
                                    <FilmIcon size={24} />
                                    Preview appears here
                                </span>
                            )}
                        </div>
                    </div>

                    <FileInput
                        label="Thumbnail"
                        required
                        accept="image/*"
                        file={thumbnail}
                        onChange={(file) => {
                            setThumbnail(file);
                            setFieldErrors((current) => ({ ...current, thumbnail: "" }));
                        }}
                        error={fieldErrors.thumbnail}
                        hint="16:9 works best — it is shown on cards and as the player poster."
                    />
                </section>

                {uploading && (
                    <div className="upload__progress" role="status">
                        <div className="upload__progress-head">
                            <span>Uploading to Cloudinary…</span>
                            <span className="upload__progress-value">{progress}%</span>
                        </div>
                        <div className="upload__progress-track">
                            <span className="upload__progress-bar" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="hint">Keep this tab open until the upload finishes.</p>
                    </div>
                )}

                <div className="upload__actions">
                    <button type="submit" className="btn btn--primary btn--lg" disabled={uploading}>
                        {uploading ? <span className="spinner spinner--sm" /> : <UploadIcon size={18} />}
                        {uploading ? "Uploading…" : "Publish video"}
                    </button>
                    <button type="button" className="btn btn--ghost" onClick={reset} disabled={uploading}>
                        Clear form
                    </button>
                    <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)} disabled={uploading}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UploadVideo;
