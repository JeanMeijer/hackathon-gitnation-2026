import CreateProfileForm from "../profile/create/create-profile-form";

export default function Onboarding() {
  return (
    <CreateProfileForm
      redirectTo="/"
      showCancel={false}
      submitLabel="Enter app"
      title="Create your profile"
      summary="Set up your attendee profile and choose the interests that should shape your recommendations."
    />
  );
}
