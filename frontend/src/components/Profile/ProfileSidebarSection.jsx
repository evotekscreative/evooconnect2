import ProfileSidebar from "./ProfileSidebar";
import ProfileSkills from "./ProfileSkills";
import ProfileSocialMedia from "./ProfileSocialMedia";

export default function ProfileSidebarSection({
  user,
  profileImage,
  apiUrl,
  connectionsCount,
  profileViews,
  onShowContactModal,
  socialPlatforms,
}) {
  return (
    <div>
      <ProfileSidebar
        user={user}
        profileImage={profileImage}
        apiUrl={apiUrl}
        connectionsCount={connectionsCount}
        profileViews={profileViews}
        onShowContactModal={onShowContactModal}
        socialPlatforms={socialPlatforms}
      />
      <ProfileSkills skills={user.skills} />
      <ProfileSocialMedia socials={user.socials} socialPlatforms={socialPlatforms} />
    </div>
  );
}