import ProfileAbout from "./ProfileAbout";
import ProfileExperience from "./ProfileExperience";
import ProfileEducation from "./ProfileEducation";
import ProfilePosts from "./ProfilePosts";

export default function ProfileMainSection({
  user,
  experiences,
  apiUrl,
  formatDate,
  handleEditExperience,
  setEditingExperience,
  setExperienceForm,
  setShowExperienceModal,
  educations,
  handleEditEducation,
  setShowEducationModal,
  userPosts,
  profileImage,
  scrollLeft,
  scrollRight,
}) {
  return (
    <div className="w-full md:w-2/3 space-y-4">
      <ProfileAbout about={user.about} />
      <ProfileExperience
        experiences={experiences}
        apiUrl={apiUrl}
        formatDate={formatDate}
        onEditExperience={handleEditExperience}
        onAddExperience={() => {
          setEditingExperience(null);
          setExperienceForm({
            job_title: "",
            company_name: "",
            location: "",
            start_month: "Month",
            start_year: "Year",
            end_month: "Month",
            end_year: "Year",
            caption: "",
            photo: null,
          });
          setShowExperienceModal(true);
        }}
      />
      <ProfileEducation
        educations={educations}
        apiUrl={apiUrl}
        formatDate={formatDate}
        onEditEducation={handleEditEducation}
        onAddEducation={() => setShowEducationModal(true)}
      />
      <ProfilePosts
        userPosts={userPosts}
        user={user}
        profileImage={profileImage}
        apiUrl={apiUrl}
        scrollLeft={scrollLeft}
        scrollRight={scrollRight}
      />
    </div>
  );
}