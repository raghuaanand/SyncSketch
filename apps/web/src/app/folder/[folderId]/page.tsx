import { Dashboard } from "@/components/dashboard";

export default function FolderPage({ params }: { params: { folderId: string } }) {
  return <Dashboard parentId={params.folderId} />;
}
