'use client';

import { useState } from 'react';
import { Mail, Link2, GitBranch, MapPin, Phone, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { isPlaceholderLink } from '@/lib/utils';
import type { Profile } from '@/types';

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function Contact({
  profile,
  deliveryConfigured,
}: {
  profile: Profile;
  deliveryConfigured: boolean;
}) {
  const contactEmail = profile.email;
  const CONTACT_INFO = [
    {
      icon: Mail,
      label: 'Email',
      value: profile.email,
      href: `mailto:${profile.email}`,
      description: 'Best for professional inquiries',
    },
    {
      icon: Link2,
      label: 'LinkedIn',
      value: profile.linkedin,
      href: profile.linkedin,
      description: 'Connect professionally',
      external: true,
    },
    {
      icon: GitBranch,
      label: 'GitHub',
      value: profile.github,
      href: profile.github,
      description: 'View code and projects',
      external: true,
    },
    {
      icon: MapPin,
      label: 'Location',
      value: profile.location,
      description: 'Open to hybrid/remote roles',
    },
    {
      icon: Phone,
      label: 'Phone',
      value: profile.phone,
      href: `tel:${profile.phone}`,
      description: 'Available during business hours',
    },
  ];
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setFormError(null);

    try {
      const form = e.target as HTMLFormElement;
      const honeypot = (new FormData(form).get('website') as string) || '';
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, website: honeypot }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        toast.success("Message sent! I will get back to you soon.");
      } else {
        setSubmitStatus('error');
        setFormError(data.error || 'Failed to send. Please try again or email directly.');
        toast.error(data.error || 'Failed to send message.');
      }
    } catch {
      setSubmitStatus('error');
      setFormError('Network error. Please try again or email directly.');
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section id="contact" className="py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Get In Touch</h2>
          <p className="text-lg text-muted-foreground">
            Have a project in mind or want to discuss opportunities? I&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Let&apos;s Build Something Useful</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Whether it&apos;s a data project, web application, AI automation, or just a conversation — I&apos;m open to discussing how I can help.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {CONTACT_INFO.map((item) => (
                  <div key={item.label} className="flex items-start space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                      <item.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.label}</div>
                      {item.href && !isPlaceholderLink(item.href) ? (
                        <a
                          href={item.href}
                          target={item.external ? '_blank' : undefined}
                          rel={item.external ? 'noopener noreferrer' : undefined}
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <div className="text-sm text-muted-foreground break-all">{item.value}</div>
                      )}
                      <div className="text-xs text-muted-foreground/70">{item.description}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Open to Opportunities</h4>
                    <p className="text-sm text-muted-foreground">
                      Currently seeking Data Analyst, BI Analyst, or Business Analyst roles. Available for immediate start.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Send a Message</CardTitle>
                <p className="text-muted-foreground text-sm">
                  {deliveryConfigured
                    ? "Or fill out the form below and I will get back to you within 24 hours."
                    : "Direct email is the fastest way to reach me right now."}
                </p>
              </CardHeader>
              <CardContent>
                {deliveryConfigured ? (
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {/* Honeypot anti-spam field — hidden from human users */}
                  <div className="hidden" aria-hidden="true">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" disabled={isSubmitting} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Project inquiry, job opportunity, collaboration, etc."
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell me about your project, role, or question..."
                      rows={6}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button type="submit" size="lg" variant="premium" disabled={isSubmitting} className="w-full sm:w-auto">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </Button>

                  {submitStatus === 'success' && (
                    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      <span>Message sent successfully! I will respond within 24 hours.</span>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="flex items-center space-x-2 text-destructive" role="alert">
                      <AlertCircle className="h-5 w-5" />
                      <span>{formError || 'Failed to send. Please try again or email directly.'}</span>
                    </div>
                  )}
                </form>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      The contact form is not connected yet — email me directly and I’ll respond within 24 hours.
                    </p>
                    {isEmail(contactEmail) ? (
                      <Button size="lg" variant="premium" asChild className="w-full sm:w-auto">
                        <a href={`mailto:${contactEmail}`} className="flex items-center space-x-2">
                          <Mail className="h-5 w-5" />
                          <span>Email Me</span>
                        </a>
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Direct contact details are being added — check back soon.
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground break-all">{contactEmail}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}