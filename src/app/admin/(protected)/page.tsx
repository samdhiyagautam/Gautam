import { Metadata } from "next";
import Link from "next/link";
import { Plus, TrendingUp, Users, FileText, FolderKanban, Settings, ExternalLink, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAllExperiences, getAllSkills, getAllProjects, getAllResumes, isSupabaseConfigured } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Admin dashboard overview",
};

export default async function AdminDashboard() {
  const [experiences, skills, projects, resumes] = await Promise.all([
    getAllExperiences(),
    getAllSkills(),
    getAllProjects(),
    getAllResumes(),
  ]);

  const publishedProjects = projects.filter((p) => p.status === "published").length;
  const draftProjects = projects.filter((p) => p.status !== "published").length;
  const publishedResume = resumes.find((r) => r.status === "published");
  const lastUpdated = [projects, experiences, skills]
    .flat()
    .map((item) => item.updatedAt)
    .sort()
    .reverse()[0];

  const stats = {
    publishedProjects,
    draftProjects,
    experienceEntries: experiences.length,
    skillsCount: skills.length,
    resumeStatus: publishedResume ? `published (${publishedResume.version})` : "not published",
    lastUpdated,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your portfolio content
            {!isSupabaseConfigured() && " — showing local fallback content (Supabase not configured)."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </Button>
          <Button variant="premium" asChild>
            <Link href="/admin/profile">
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Published Projects"
          value={stats.publishedProjects}
          icon={FolderKanban}
          trend={`${projects.length} total`}
          href="/admin/projects"
          label="View all"
        />
        <StatCard
          title="Draft Projects"
          value={stats.draftProjects}
          icon={FileText}
          trend="Ready to review"
          href="/admin/projects"
          label="Review drafts"
          variant="outline"
        />
        <StatCard
          title="Experience Entries"
          value={stats.experienceEntries}
          icon={Users}
          trend={`${experiences.filter((e) => e.isCurrent).length} current`}
          href="/admin/experience"
          label="Manage"
        />
        <StatCard
          title="Skills Tracked"
          value={stats.skillsCount}
          icon={TrendingUp}
          trend={`${skills.filter((s) => s.isActive).length} active`}
          href="/admin/skills"
          label="Manage"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Resume Status</CardTitle>
            <Badge variant={publishedResume ? "premium" : "outline"}>
              {publishedResume ? "published" : "not published"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{publishedResume?.version ?? "—"}</p>
                <p className="text-sm text-muted-foreground">
                  {publishedResume
                    ? `Last updated ${new Date(publishedResume.uploadedAt).toLocaleDateString()}`
                    : "Upload and publish a resume to go live."}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/resume">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Manage
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickAction
              icon={Plus}
              title="Add New Project"
              description="Create a new portfolio project"
              href="/admin/projects/new"
            />
            <QuickAction
              icon={FileText}
              title="Update Resume"
              description="Upload a new resume version"
              href="/admin/resume"
            />
            <QuickAction
              icon={Users}
              title="Add Experience"
              description="Add a new role or update current"
              href="/admin/experience/new"
            />
            <QuickAction
              icon={Settings}
              title="Edit Profile"
              description="Update your professional info"
              href="/admin/profile"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Latest Content</CardTitle>
          <span className="text-xs text-muted-foreground">
            {lastUpdated && lastUpdated !== new Date(0).toISOString()
              ? `Updated ${new Date(lastUpdated).toLocaleDateString()}`
              : "Fallback content"}
          </span>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {projects.slice(0, 4).map((project) => (
              <ActivityItem
                key={project.id}
                icon={FolderKanban}
                title={project.name}
                subtitle={`${project.category} · ${project.status}${project.isFeatured ? " · featured" : ""}`}
              />
            ))}
            {projects.length === 0 && (
              <p className="text-sm text-muted-foreground">No projects yet. Create your first one.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  href,
  label,
  variant = "default",
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  trend: string;
  href: string;
  label: string;
  variant?: "default" | "outline";
}) {
  return (
    <Card className={cn(variant === "outline" && "border-primary/20")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{trend}</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={href}>{label}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAction({ icon: Icon, title, description, href }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string; href: string }) {
  return (
    <Link href={href} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors group">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
    </Link>
  );
}

function ActivityItem({ icon: Icon, title, subtitle }: { icon: React.ComponentType<{ className?: string }>; title: string; subtitle: string }) {
  return (
    <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-accent transition-colors">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </div>
      <div className="flex items-center space-x-2 text-xs text-muted-foreground shrink-0">
        <Clock className="h-3 w-3" />
      </div>
    </div>
  );
}
