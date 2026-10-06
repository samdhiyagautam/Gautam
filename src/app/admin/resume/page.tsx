import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileText, Download, Upload, Eye, ExternalLink, Loader2, CheckCircle, AlertCircle, Trash2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Resume",
  description: "Manage your resume",
};

export default async function AdminResume() {
  // Auth is enforced by the admin layout.
  const resumeExists = false; // Would check database/storage in real implementation
  const currentVersion = "v1.0";
  const lastUpdated = new Date().toISOString();

  return (
    <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Resume</h1>
            <p className="text-muted-foreground">Manage your resume file</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin">
              <span>← Dashboard</span>
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Professional Resume</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {resumeExists ? `Current version: ${currentVersion}` : "No resume uploaded yet"}
                  </p>
                </div>
              </div>
              <Badge variant={resumeExists ? "premium" : "outline"}>
                {resumeExists ? "Published" : "Not Uploaded"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {resumeExists ? (
              <>
                <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-xl">
                  <div className="flex-1">
                    <p className="font-medium">{currentVersion}</p>
                    <p className="text-sm text-muted-foreground">Last updated {new Date(lastUpdated).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/resume.pdf" download>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Your Resume</h3>
                <p className="text-muted-foreground mb-6">Upload a PDF version of your resume to enable the download button on your portfolio.</p>
                <Button variant="premium" className="w-full sm:w-auto">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose PDF File
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Max file size: 5MB. PDF only.</p>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <h4 className="font-medium mb-3">Upload Guidelines</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>PDF format only</span></li>
                <li className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>Max 5MB file size</span></li>
                <li className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>File name will be "[Your Name]-Resume.pdf"</span></li>
                <li className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>Version tracking enabled</span></li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ExternalLink className="h-5 w-5" />
              <span>Public Resume Page</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Your resume is accessible at <code className="bg-background px-2 rounded">/resume</code> with both view and download options.
            </p>
            <Button variant="outline" asChild>
              <Link href="/resume" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Public Resume Page
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
  );
}