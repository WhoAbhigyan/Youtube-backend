import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UploadVideo from "./pages/UploadVideo";
import Profile from "./pages/Profile";
import WatchVideo from "./pages/WatchVideo";
import NotFound from "./pages/NotFound";

function App() {
    return (
        <BrowserRouter>
            <Navbar />

            <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route path="/upload" element={<UploadVideo />} />

                <Route path="/profile" element={<Profile />} />

                <Route
                    path="/watch/:videoId"
                    element={<WatchVideo />}
                />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;