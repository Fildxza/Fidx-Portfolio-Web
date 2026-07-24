import { getProfilePhotoUrl, getResumeUrl, getSocialLinks } from "@/lib/queries";
import { CrudManager, type ColumnConfig, type FieldConfig } from "@/components/admin/crud-manager";
import { SettingsForm } from "./settings-form";
import { createSocialLink, deleteSocialLink, updateSocialLink } from "./actions";
import type { SocialLink } from "@/lib/types";

const columns: ColumnConfig<SocialLink & Record<string, unknown>>[] = [
  { key: "label", label: "Label" },
  { key: "url", label: "URL" },
];

const fields: FieldConfig[] = [
  { key: "label", label: "Label", type: "text", required: true },
  { key: "url", label: "URL", type: "text", required: true },
  { key: "icon", label: "Icon name (lucide-react)", type: "text" },
  { key: "sort_order", label: "Sort Order", type: "number" },
];

export default async function AdminSettingsPage() {
  const [resumeUrl, profilePhotoUrl, socialLinks] = await Promise.all([
    getResumeUrl(),
    getProfilePhotoUrl(),
    getSocialLinks(),
  ]);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="mb-6 text-2xl font-semibold">Settings</h1>
        <SettingsForm resumeUrl={resumeUrl} profilePhotoUrl={profilePhotoUrl} />
      </div>

      <CrudManager
        title="Social Links"
        description="Extra links shown around the site."
        columns={columns}
        fields={fields}
        rows={socialLinks as (SocialLink & Record<string, unknown>)[]}
        onCreate={createSocialLink}
        onUpdate={updateSocialLink}
        onDelete={deleteSocialLink}
      />
    </div>
  );
}
