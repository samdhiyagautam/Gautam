import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Code, Database, Cpu, Palette } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteSkill } from "@/actions/admin";
import { getAllSkills } from "@/lib/cms";
import { SKILL_CATEGORIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Skills",
  description: "Manage your skills",
};

const CATEGORY_ICONS = {
  "data-analytics": Database,
  "web-development": Code,
  "ai-automation": Cpu,
  "creative-technology": Palette,
};

export default async function AdminSkills() {
  const skills = await getAllSkills();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skills</h1>
          <p className="text-muted-foreground">Manage your skills and proficiency levels</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin">
              <span>← Dashboard</span>
            </Link>
          </Button>
          <Button variant="premium" asChild>
            <Link href="/admin/skills/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Link>
          </Button>
        </div>
      </div>

      {SKILL_CATEGORIES.map((category) => {
        const categorySkills = skills.filter((s) => s.category === category.value);
        const Icon = CATEGORY_ICONS[category.value as keyof typeof CATEGORY_ICONS];
        return (
          <Card key={category.value}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon className="h-4 w-4" />
                <CardTitle>{category.label}</CardTitle>
                <Badge variant="outline" className="text-xs">{categorySkills.length} skills</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {categorySkills.length === 0 ? (
                <p className="text-sm text-muted-foreground">No skills in this category yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-medium text-muted-foreground text-sm">Skill</th>
                        <th className="text-left p-3 font-medium text-muted-foreground text-sm">Proficiency</th>
                        <th className="text-left p-3 font-medium text-muted-foreground text-sm">Status</th>
                        <th className="text-right p-3 font-medium text-muted-foreground text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {categorySkills.map((skill) => (
                        <tr key={skill.id} className="hover:bg-accent/50">
                          <td className="p-3">
                            <p className="font-medium">{skill.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-xs">{skill.description}</p>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">{skill.proficiency.replace("-", " ")}</Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant={skill.isActive ? "premium" : "outline"}>
                              {skill.isActive ? "Active" : "Hidden"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" asChild aria-label="Edit skill">
                                <Link href={`/admin/skills/${skill.id}/edit`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              <DeleteButton id={skill.id} action={deleteSkill} label="Delete skill" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
