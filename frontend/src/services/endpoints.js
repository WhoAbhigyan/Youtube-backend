import api, { unwrap } from "./api";

/**
 * Every backend call the app makes, in one place.
 * Paths mirror the routes registered in src/routes of the backend.
 */

export const authApi = {
    // POST /api/v1/users/register  (multipart: avatar is required, coverImage optional)
    register: (formData) => api.post("/users/register", formData).then(unwrap),
    // POST /api/v1/users/login  { email | username, password }
    login: (credentials) => api.post("/users/login", credentials).then(unwrap),
    // POST /api/v1/users/logout
    logout: () => api.post("/users/logout").then(unwrap),
    // GET /api/v1/users/get-currentUser
    currentUser: () => api.get("/users/get-currentUser").then(unwrap),
    // PATCH /api/v1/users/update-account  { fullName, email }
    updateAccount: (payload) => api.patch("/users/update-account", payload).then(unwrap),
    // PATCH /api/v1/users/update-avatar  (multipart: avatar)
    updateAvatar: (formData) => api.patch("/users/update-avatar", formData).then(unwrap),
    // PATCH /api/v1/users/update-cover-image  (multipart: coverImage)
    updateCoverImage: (formData) => api.patch("/users/update-cover-image", formData).then(unwrap),
    // POST /api/v1/users/change-password  { oldPassword, newPassword }
    changePassword: (payload) => api.post("/users/change-password", payload).then(unwrap),
    // GET /api/v1/users/c/:username
    channel: (username) => api.get(`/users/c/${encodeURIComponent(username)}`).then(unwrap),
    // GET /api/v1/users/watch-history
    watchHistory: () => api.get("/users/watch-history").then(unwrap)
};

export const videoApi = {
    // GET /api/v1/video/feed  { page, limit, search, owner }
    feed: (params) => api.get("/video/feed", { params }).then(unwrap),
    // GET /api/v1/video/allVideos  -> videos owned by the logged in user
    mine: (params) => api.get("/video/allVideos", { params }).then(unwrap),
    // GET /api/v1/video/:videoId
    byId: (videoId) => api.get(`/video/${videoId}`).then(unwrap),
    // POST /api/v1/video/upload  (multipart: title, description, videoFile, thumbnail)
    upload: (formData, onProgress) =>
        api.post("/video/upload", formData, {
            onUploadProgress: (event) => {
                if (!onProgress || !event.total) return;
                onProgress(Math.min(100, Math.round((event.loaded * 100) / event.total)));
            }
        }).then(unwrap),
    // PATCH /api/v1/video/:videoId  (multipart: title, description, thumbnail)
    update: (videoId, formData) => api.patch(`/video/${videoId}`, formData).then(unwrap),
    // DELETE /api/v1/video/:videoId
    remove: (videoId) => api.delete(`/video/${videoId}`).then(unwrap),
    // PATCH /api/v1/video/toggle-publish/:videoId
    togglePublish: (videoId) => api.patch(`/video/toggle-publish/${videoId}`).then(unwrap)
};

export const commentApi = {
    // GET /api/v1/comment/comment/:videoId  { page, limit } -> paginated comments
    list: (videoId, params) =>
        api.get(`/comment/comment/${videoId}`, { params }).then(unwrap),
    // POST /api/v1/comment/:videoId  { content }
    add: (videoId, content) => api.post(`/comment/${videoId}`, { content }).then(unwrap),
    // PATCH /api/v1/comment/:commentId  { content }
    update: (commentId, content) => api.patch(`/comment/${commentId}`, { content }).then(unwrap),
    // DELETE /api/v1/comment/:commentId
    remove: (commentId) => api.delete(`/comment/${commentId}`).then(unwrap)
};

export const likeApi = {
    // POST /api/v1/likes/toggle/video/:videoId -> "Video liked|unliked successfully"
    toggleVideo: (videoId) => api.post(`/likes/toggle/video/${videoId}`).then((response) => ({
        message: response.data.data,
        liked: !/unliked/i.test(response.data.data || "")
    })),
    // POST /api/v1/likes/toggle/comment/:commentId
    toggleComment: (commentId) =>
        api.post(`/likes/toggle/comment/${commentId}`).then((response) => ({
            message: response.data.data,
            liked: !/unliked/i.test(response.data.data || "")
        })),
    // GET /api/v1/likes/videos -> likes of the logged in user with the video populated
    likedVideos: () => api.get("/likes/videos").then(unwrap)
};

export const playlistApi = {
    // POST /api/v1/playlist  { name, description }
    create: (payload) => api.post("/playlist", payload).then(unwrap),
    // GET /api/v1/playlist/user/:userId
    listForUser: (userId) => api.get(`/playlist/user/${userId}`).then(unwrap),
    // GET /api/v1/playlist/:playlistId
    byId: (playlistId) => api.get(`/playlist/${playlistId}`).then(unwrap),
    // POST /api/v1/playlist/add/:playlistId/:videoId
    addVideo: (playlistId, videoId) => api.post(`/playlist/add/${playlistId}/${videoId}`).then(unwrap),
    // DELETE /api/v1/playlist/remove/:playlistId/:videoId
    removeVideo: (playlistId, videoId) =>
        api.delete(`/playlist/remove/${playlistId}/${videoId}`).then(unwrap),
    // PUT /api/v1/playlist/:playlistId  { name, description }
    update: (playlistId, payload) => api.put(`/playlist/${playlistId}`, payload).then(unwrap),
    // DELETE /api/v1/playlist/:playlistId
    remove: (playlistId) => api.delete(`/playlist/${playlistId}`).then(unwrap)
};

export const subscriptionApi = {
    // POST /api/v1/subscription/c/:channelId -> "Subscribed|Unsubscribed successfully"
    toggle: (channelId) => api.post(`/subscription/c/${channelId}`).then((response) => ({
        message: response.data.data,
        subscribed: !/unsubscribed/i.test(response.data.data || "")
    })),
    // GET /api/v1/subscription/c/:channelId
    subscribers: (channelId) => api.get(`/subscription/c/${channelId}`).then(unwrap),
    // GET /api/v1/subscription/u/:subscriberId
    channels: (subscriberId) => api.get(`/subscription/u/${subscriberId}`).then(unwrap)
};

export const dashboardApi = {
    // GET /api/v1/dashboard/channel/stats
    stats: () => api.get("/dashboard/channel/stats").then(unwrap),
    // GET /api/v1/dashboard/channel/videos  { page, limit }
    videos: (params) => api.get("/dashboard/channel/videos", { params }).then(unwrap)
};

export const tweetApi = {
    // GET /api/v1/tweets/my-tweets
    list: () => api.get("/tweets/my-tweets").then(unwrap),
    // POST /api/v1/tweets/create-tweet  { content }
    create: (content) => api.post("/tweets/create-tweet", { content }).then(unwrap),
    // DELETE /api/v1/tweets/:tweetId
    remove: (tweetId) => api.delete(`/tweets/${tweetId}`).then(unwrap)
};
