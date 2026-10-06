import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, TrendingUp, Users, FileText, FolderKanban, Settings, ExternalLink, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Admin dashboard overview",
};

export default async function AdminDashboard() {
  // Auth is enforced by the admin layout (client gate + middleware session refresh).
  // In a real implementation, these would come from database queries.
  const stats = {
    publishedProjects: 4,
    draftProjects: 2,
    experienceEntries: 2,
    skillsCount: 23,
    resumeStatus: "published",
    lastUpdated: new Date().toISOString(),
  };

  const recentActivity = [
    { id: 1, type: "project", action: "Published", title: "Portfolio Website", time: "2 hours ago" },
    { id: 2, type: "experience", action: "Updated", title: "Assistant Manager role", time: "1 day ago" },
    { id: 3, type: "skill", action: "Added", title: "TypeScript - Core", time: "2 days ago" },
    { id: 4, type: "resume", action: "Uploaded", title: "Resume v1.2", time: "3 days ago" },
  ];

  return (
    <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of your portfolio content</p>
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
            trend="+2 this month"
            href="/admin/projects"
            label="View all"
          />
          <StatCard
            title="Draft Projects"
            value={stats.draftProjects}
            icon={FileText}
            trend="Ready to review"
            href="/admin/projects?status=draft"
            label="Review drafts"
            variant="outline"
          />
          <StatCard
            title="Experience Entries"
            value={stats.experienceEntries}
            icon={Users}
            trend="2 positions"
            href="/admin/experience"
            label="Manage"
          />
          <StatCard
            title="Skills Tracked"
            value={stats.skillsCount}
            icon={TrendingUp}
            trend="4 categories"
            href="/admin/skills"
            label="Manage"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Resume Status</CardTitle>
              <Badge variant={stats.resumeStatus === "published" ? "premium" : "outline"}>
                {stats.resumeStatus}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">v1.0</p>
                  <p className="text-sm text-muted-foreground">Last updated {new Date(stats.lastUpdated).toLocaleDateString()}</p>
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
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/activity">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
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

function ActivityItem({ activity }: { activity: { id: number; type: string; action: string; title: string; time: string } }) {
  const typeIcons = {
    project: FolderKanban,
    experience: Users,
    skill: TrendingUp,
    resume: FileText,
  };
  const Icon = typeIcons[activity.type as keyof typeof typeIcons] || FolderKanban;

  return (
    <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-accent transition-colors">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{activity.action} <span className="font-normal text-foreground">{activity.title}</span></p>
        <p className="text-xs text-muted-foreground">{activity.type}</p>
      </div>
      <div className="flex items-center space-x-2 text-xs text-muted-foreground shrink-0">
        <Clock className="h-3 w-3" />
        <span>{activity.time}</span>
      </div>
    </div>
  );
}