import { useState } from "react";

function UploadVideo() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log({
            title,
            description,
            videoFile,
            thumbnail
        });
    };

    return (
        <main>
            <h1>Upload Video</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Video title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                    placeholder="Video description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <label>Video</label>
                <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files[0])}
                />

                <label>Thumbnail</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnail(e.target.files[0])}
                />

                <button type="submit">
                    Upload
                </button>
            </form>
        </main>
    );
}

export default UploadVideo;