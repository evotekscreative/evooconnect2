export default function ProfileSocialMedia({ socials, socialPlatforms }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="font-semibold text-lg mb-2">Social Media</h3>
      {Object.keys(socials).length > 0 ? (
        <div className="space-y-2">
          {Object.entries(socials).map(([platform, username]) => {
            const platformKey = platform.toLowerCase();
            const platformInfo = socialPlatforms.find(
              (p) => p.name.toLowerCase() === platformKey
            );
            let url = "#";
            if (platformKey === "instagram") url = `${username}`;
            else if (platformKey === "facebook") url = `${username}`;
            else if (platformKey === "twitter") url = `${username}`;
            else if (platformKey === "linkedin") url = `/${username}`;
            else if (platformKey === "github") url = `${username}`;

            return (
              <a
                key={platform}
                href={username ? url : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md text-blue-600 hover:underline"
                style={{ pointerEvents: username ? "auto" : "none" }}
              >
                {platformInfo && (
                  <div className={`p-2 rounded-full ${platformInfo.color} bg-gray-50`}>
                    {platformInfo.icon}
                  </div>
                )}
                <span className="text-base truncate max-w-[200px] overflow-hidden whitespace-nowrap">
                  @{username || "unknown"}
                </span>
              </a>
            );
          })}
        </div>
      ) : (
        <p className="text-base text-gray-500">
          No social media added yet.
        </p>
      )}
    </div>
  );
}