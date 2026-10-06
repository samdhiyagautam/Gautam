import { Metadata } from "next";
import { Resume } from "@/components/portfolio/resume";

export const metadata: Metadata = {
  title: "Resume",
  description: "Download or view my professional resume",
};

export default function ResumePage() {
  return <Resume />;
}