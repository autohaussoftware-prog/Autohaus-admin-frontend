import { PageHeader } from "@/components/shared/page-header";
import { getCurrentUserProfile } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/profile-form";
import { AlertPreferencesPanel } from "@/components/profile/alert-preferences-panel";

export default async function PerfilPage() {
  const profile = await getCurrentUserProfile();

  return (
    <>
      <PageHeader
        eyebrow="Cuenta"
        title="Mi Perfil"
        description="Actualiza tu nombre, teléfono y contraseña de acceso."
      />
      <ProfileForm
        defaultName={profile.name}
        defaultPhone={profile.phone ?? ""}
      />
      <div className="mt-6">
        <AlertPreferencesPanel />
      </div>
    </>
  );
}
