import React from "react";

const Avatar = ({ profile, userName, size = "w-16 h-16" }) => {

    if (!profile) {
        return (
            <div className={`${size} rounded-full bg-gray-400 flex items-center justify-center`}>
                {userName.charAt(0).toUpperCase()}
            </div>
        );
    }

    if (profile.avatar_id) {

        const avatarUrl = `http://127.0.0.1:8000/static/avatars/avatar${profile.avatar_id}.jpg`;

        return (
            <img
                src={avatarUrl}
                alt="avatar"
                className={`${size} rounded-full object-cover`}
                onError={(e)=>{
                    e.target.src="http://127.0.0.1:8000/static/avatars/default.jpg"
                }}
            />
        );
    }

    return (
        <div className={`${size} rounded-full bg-gray-400 flex items-center justify-center`}>
            {userName.charAt(0).toUpperCase()}
        </div>
    );
};

export default Avatar;