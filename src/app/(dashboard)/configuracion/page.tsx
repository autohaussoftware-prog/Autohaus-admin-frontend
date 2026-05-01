import { PageHeader } from "@/components/shared/page-header";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { getSettings } from "@/lib/data/settings";
import { getUserRole } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, role] = await Promise.all([getSettings(), getUserRole()]);
  const canEdit = ["owner", "admin"].includes(role);

  return (
    <>
      <PageHeader
        eyebrow="Configuración"
        title="Reglas internas del sistema"
        description="Parámetros de comisiones, rentabilidad y alertas operativas. Editables por dueños y administradores."
      />
      <SettingsPanel settings={settings} canEdit={canEdit} />
    </>
  );
}
