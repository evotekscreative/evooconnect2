import { Instagram, Facebook, Twitter, Linkedin, Github } from "lucide-react";

const socialPlatforms = [
  {
    name: "instagram",
    icon: <Instagram className="w-5 h-5" />,
    color: "text-pink-500",
  },
  {
    name: "facebook",
    icon: <Facebook className="w-5 h-5" />,
    color: "text-blue-500",
  },
  {
    name: "twitter",
    icon: <Twitter className="w-5 h-5" />,
    color: "text-blue-400",
  },
  {
    name: "linkedin",
    icon: <Linkedin className="w-5 h-5" />,
    color: "text-blue-700",
  },
  { name: "github", icon: <Github className="w-5 h-5" />, color: "text-black" },
];

export default function ProfileSocialMedia({ socials }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="font-semibold text-lg mb-2">Social Media</h3>
      {Object.keys(socials).length > 0 ? (
        <div className="space-y-2">
          {Object.entries(socials).map(([platform, value]) => {
            const platformInfo = socialPlatforms.find(
              (p) => p.name === platform
            );
            const isLink =
              typeof value === "string" &&
              (value.startsWith("http://") || value.startsWith("https://"));
            return (
              <div
                key={platform}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md"
              >
                {platformInfo && (
                  <div
                    className={`p-2 rounded-full ${platformInfo.color} bg-gray-50`}
                  >
                    {platformInfo.icon}
                  </div>
                )}
                {isLink ? (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-base truncate max-w-[200px] overflow-hidden whitespace-nowrap"
                  >
                    {value}
                  </a>
                ) : (
                  <span className="text-base truncate max-w-[200px] overflow-hidden whitespace-nowrap">
                    @{value}
                  </span>
                )}
              </div>
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