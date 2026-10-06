import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/admin/profile-form";
import { getAdminProfile } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your professional profile",
};

export default async function AdminProfile() {
  const profile = await getAdminProfile();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your professional profile information</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin">
            <span>← Back to Dashboard</span>
          </Link>
        </Button>
      </div>

      <ProfileForm initial={profile} />
    </div>
  );
}
