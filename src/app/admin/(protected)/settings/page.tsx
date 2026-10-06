import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { Save, Shield, Palette, Database, Key } from "lucide-react";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage site settings",
};

export default async function AdminSettings() {
  // Auth is enforced by the admin layout.
  return (
    <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Configure site-wide settings</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin">
              <span>← Dashboard</span>
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Authentication & Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="adminEmail">Admin Email</Label>
                <p className="text-sm text-muted-foreground">Email address for admin access</p>
              </div>
              <Input id="adminEmail" defaultValue="[ADD YOUR EMAIL]" disabled className="w-64" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireAuth">Require Authentication for Admin</Label>
                <p className="text-sm text-muted-foreground">All admin routes require login</p>
              </div>
              <Switch id="requireAuth" defaultChecked disabled />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                <p className="text-sm text-muted-foreground">Auto-signout after inactivity</p>
              </div>
              <Input id="sessionTimeout" type="number" defaultValue="24" className="w-24" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>Appearance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="defaultTheme">Default Theme</Label>
                <p className="text-sm text-muted-foreground">Site default theme (users can override)</p>
              </div>
              <select id="defaultTheme" className="border border-input bg-background rounded-md px-3 py-2 text-sm w-48">
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <p className="text-sm text-muted-foreground">Main brand color</p>
              </div>
              <Input id="primaryColor" type="color" defaultValue="#0a0a0a" className="w-12 h-10 cursor-pointer" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Database & Storage</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Supabase Connection</span>
                <span className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Connected
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Project URL: [ADD YOUR SUPABASE URL]</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Storage Bucket</span>
                <span className="text-muted-foreground text-sm">portfolio-assets</span>
              </div>
              <p className="text-sm text-muted-foreground">Used for resume, project images, OG images</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-destructive/5 border-destructive/20">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-destructive" />
              <CardTitle>Danger Zone</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">These actions are irreversible. Proceed with caution.</p>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="font-medium text-destructive">Delete All Data</p>
                <p className="text-sm text-muted-foreground">Permanently delete all portfolio content</p>
              </div>
              <Button variant="destructive" disabled>Delete Everything</Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button variant="premium">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
  );
}