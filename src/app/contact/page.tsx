import { Metadata } from "next";
import { Contact } from "@/components/portfolio/contact";
import { getPublishedProfile, isContactConfigured } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch for project inquiries, job opportunities, or collaboration",
};

export default async function ContactPage() {
  const profile = await getPublishedProfile();
  return (
    <>
      <h1 className="sr-only">Contact — Gautam Samdhiya, Data Analyst</h1>
      <Contact profile={profile} deliveryConfigured={isContactConfigured()} />
    </>
  );
}
