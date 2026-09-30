import { useEffect, useState } from "react";
import api from "../services/api";
import VideoCard from "../components/VideoCard";
import Sidebar from "../components/Sidebar";

function Home() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getVideos = async () => {
        try {
            const response = await api.get("/video/allVideos");

            const videoList = response.data.message?.videos || [];

            setVideos(videoList);

        } catch (error) {
            console.log("GET VIDEOS ERROR:", error);

            setError(
                error.response?.data?.message ||
                "Failed to load videos"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getVideos();
    }, []);

    return (
        <div className="youtube-layout">

            <Sidebar />

            <main className="home-content">

                {/* Category buttons */}

                <div className="category-bar">

                    <button className="category active">
                        All
                    </button>

                    <button className="category">
                        Music
                    </button>

                    <button className="category">
                        Gaming
                    </button>

                    <button className="category">
                        Programming
                    </button>

                    <button className="category">
                        Football
                    </button>

                    <button className="category">
                        Cricket
                    </button>

                    <button className="category">
                        Movies
                    </button>

                </div>

                {loading && (
                    <div className="status-message">
                        Loading videos...
                    </div>
                )}

                {error && (
                    <div className="status-message">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <section className="video-grid">

                        {videos.length === 0 ? (
                            <div className="status-message">
                                No videos found.
                            </div>
                        ) : (
                            videos.map((video) => (
                                <VideoCard
                                    key={video._id}
                                    video={video}
                                />
                            ))
                        )}

                    </section>
                )}

            </main>

        </div>
    );
}

export default Home;