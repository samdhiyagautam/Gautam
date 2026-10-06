import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { Loader2, Save, User, Mail, MapPin, Link2, GitBranch, Briefcase } from "lucide-react";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your professional profile",
};

const DEFAULT_PROFILE = {
  name: "[ADD YOUR NAME]",
  headline: "Assistant Manager | Data Analytics | AI-Enabled Business Solutions",
  heroDescription: "Assistant Manager with 2+ years of professional experience, combining business understanding, data analytics, AI-assisted workflows and modern technology to solve practical problems.",
  about: "I turn business problems into practical solutions using data, AI and modern technology. With 2+ years of experience as an Assistant Manager at Dhuri Na Venture Private Limited, I combine business understanding, data analytics, AI-assisted workflows, and modern technology to solve practical problems.\n\nMy journey from MAS Educative to Assistant Manager has been defined by continuous learning and practical application. I work with Python, SQL, Power BI, and Excel for data analysis; build web applications with Next.js, React, Supabase, and PostgreSQL; and leverage AI to accelerate research, analysis, development, and creative workflows.\n\nI focus on solving the underlying business problem rather than simply using technology. Whether it's building a dashboard that drives decisions, automating a repetitive workflow, or developing a web application that streamlines operations, my approach is always: understand the problem first, then apply the right tools.",
  location: "[ADD YOUR LOCATION]",
  email: "[ADD YOUR EMAIL]",
  phone: "[ADD YOUR PHONE]",
  linkedin: "[ADD YOUR LINKEDIN URL]",
  github: "[ADD YOUR GITHUB URL]",
  openToWork: true,
  ctaText: "Let's Build Something Useful",
};

export default async function AdminProfile() {
  // Auth is enforced by the admin layout.
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

        <form className="space-y-6" id="profile-form">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Basic Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" name="name" defaultValue={DEFAULT_PROFILE.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headline">Professional Headline *</Label>
                  <Input id="headline" name="headline" defaultValue={DEFAULT_PROFILE.headline} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroDescription">Hero Description *</Label>
                <Textarea id="heroDescription" name="heroDescription" rows={3} defaultValue={DEFAULT_PROFILE.heroDescription} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="about">About Me *</Label>
                <Textarea id="about" name="about" rows={6} defaultValue={DEFAULT_PROFILE.about} required />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle>Contact Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" defaultValue={DEFAULT_PROFILE.email} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" defaultValue={DEFAULT_PROFILE.phone} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" defaultValue={DEFAULT_PROFILE.location} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input id="linkedin" name="linkedin" defaultValue={DEFAULT_PROFILE.linkedin} placeholder="https://linkedin.com/in/..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub URL</Label>
                <Input id="github" name="github" defaultValue={DEFAULT_PROFILE.github} placeholder="https://github.com/..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <CardTitle>Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="openToWork">Open to Work</Label>
                  <p className="text-sm text-muted-foreground">Show 'Open to Opportunities' badge on portfolio</p>
                </div>
                <Switch id="openToWork" name="openToWork" defaultChecked={DEFAULT_PROFILE.openToWork} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaText">CTA Text</Label>
                <Input id="ctaText" name="ctaText" defaultValue={DEFAULT_PROFILE.ctaText} />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/admin/profile">Discard Changes</Link>
            </Button>
            <Button type="submit" variant="premium">
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </Button>
          </div>
        </form>
      </div>
  );
}