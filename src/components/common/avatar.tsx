import React, { useState } from "react";

interface AvatarProps {
  src?: string | null;
  firstName?: string;
  lastName?: string;
  size?: number; // px (default 56)
  className?: string;
}

const getInitials = (first?: string, last?: string) => {
  return `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  firstName,
  lastName,
  size = 56,
  className = "",
}) => {
  const [imgError, setImgError] = useState(false);

  const showFallback = !src || imgError;

  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center bg-gray-200 ${className}`}
      style={{ width: size, height: size }}
    >
      {showFallback ? (
        <span className="text-sm font-semibold text-gray-700">
          {getInitials(firstName, lastName)}
        </span>
      ) : (
        <img
          src={src}
          alt={`${firstName || ""} ${lastName || ""}`}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
};

export default Avatar;