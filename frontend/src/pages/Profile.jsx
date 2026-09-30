import useAuth from "../hooks/useAuth";

function Profile() {
    const { user } = useAuth();

    return (
        <main>
            <h1>Profile</h1>

            {user ? (
                <div>
                    <h2>{user.fullName}</h2>
                    <p>@{user.username}</p>
                </div>
            ) : (
                <p>No user logged in</p>
            )}
        </main>
    );
}

export default Profile;