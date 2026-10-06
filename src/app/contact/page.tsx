import { Metadata } from "next";
import { Contact } from "@/components/portfolio/contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch for project inquiries, job opportunities, or collaboration",
};

export default function ContactPage() {
  return <Contact />;
}