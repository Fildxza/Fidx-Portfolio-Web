import { getCertificates } from "@/lib/queries";
import { CrudManager, type ColumnConfig, type FieldConfig } from "@/components/admin/crud-manager";
import { createCertificate, deleteCertificate, updateCertificate } from "./actions";
import type { Certificate } from "@/lib/types";

const columns: ColumnConfig<Certificate & Record<string, unknown>>[] = [
  { key: "title", label: "Title" },
  { key: "issuer", label: "Issuer" },
  { key: "issue_date", label: "Issued" },
];

const fields: FieldConfig[] = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "issuer", label: "Issuer", type: "text", required: true },
  { key: "issue_date", label: "Issue Date", type: "date" },
  { key: "credential_url", label: "Verification URL (optional)", type: "text" },
  {
    key: "file_url",
    label: "Certificate File (PDF or image)",
    type: "upload",
    accept: "application/pdf,image/*",
    uploadFolder: "certificates",
  },
  {
    key: "image_url",
    label: "Thumbnail Image",
    type: "upload",
    accept: "image/*",
    uploadFolder: "certificates",
  },
  { key: "sort_order", label: "Sort Order", type: "number" },
];

export default async function AdminCertificatesPage() {
  const certificates = await getCertificates();

  return (
    <CrudManager
      title="Certificates"
      description="Manage certifications shown on your portfolio."
      columns={columns}
      fields={fields}
      rows={certificates as (Certificate & Record<string, unknown>)[]}
      onCreate={createCertificate}
      onUpdate={updateCertificate}
      onDelete={deleteCertificate}
    />
  );
}
