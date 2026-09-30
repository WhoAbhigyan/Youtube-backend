import { BrowserRouter, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import { ProtectedRoute, PublicRoute } from "./components/RouteGuards";
import NotFound from "./pages/NotFound";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WatchVideo from "./pages/WatchVideo";
import UploadVideo from "./pages/UploadVideo";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Channel from "./pages/Channel";
import Playlists from "./pages/Playlists";
import PlaylistDetail from "./pages/PlaylistDetail";
import Subscriptions from "./pages/Subscriptions";
import LikedVideos from "./pages/LikedVideos";
import History from "./pages/History";
import Community from "./pages/Community";

const App = () => (
    <BrowserRouter>
        <Routes>
            {/* every backend endpoint is behind verifyJWT */}
            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/watch/:videoId" element={<WatchVideo />} />
                    <Route path="/upload" element={<UploadVideo />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/channel/:username" element={<Channel />} />
                    <Route path="/playlists" element={<Playlists />} />
                    <Route path="/playlist/:playlistId" element={<PlaylistDetail />} />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                    <Route path="/liked" element={<LikedVideos />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Route>

            <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>
        </Routes>
    </BrowserRouter>
);

export default App;
