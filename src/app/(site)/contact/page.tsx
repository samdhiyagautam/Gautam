import { Metadata } from "next";
import { Contact } from "@/components/portfolio/contact";
import { getPublishedProfile, isContactConfigured } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Contact | Hire Gautam Samdhiya — Data Analyst",
  description:
    "Get in touch with Gautam Samdhiya for Data Analyst / BI Analyst roles, operational dashboard projects, or reporting automation inquiries.",
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
