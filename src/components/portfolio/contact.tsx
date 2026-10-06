'use client';

import { useState } from 'react';
import { Mail, Link2, GitBranch, MapPin, Phone, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CONTACT_INFO = [
  {
    icon: Mail,
    label: 'Email',
    value: '[ADD YOUR EMAIL]',
    href: 'mailto:[ADD YOUR EMAIL]',
    description: 'Best for professional inquiries',
  },
  {
    icon: Link2,
    label: 'LinkedIn',
    value: '[ADD YOUR LINKEDIN URL]',
    href: '[ADD YOUR LINKEDIN URL]',
    description: 'Connect professionally',
    external: true,
  },
  {
    icon: GitBranch,
    label: 'GitHub',
    value: '[ADD YOUR GITHUB URL]',
    href: '[ADD YOUR GITHUB URL]',
    description: 'View code and projects',
    external: true,
  },
  {
    icon: MapPin,
    label: 'Location',
    value: '[ADD YOUR LOCATION]',
    description: 'Open to hybrid/remote roles',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '[ADD YOUR PHONE]',
    href: 'tel:[ADD YOUR PHONE]',
    description: 'Available during business hours',
  },
];

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Simulate form submission - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For now, show success - replace with real API integration
    setSubmitStatus('success');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
    
    toast.success('Message sent! I\'ll get back to you soon.');
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
            Have a project in mind or want to discuss opportunities? I'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Let's Build Something Useful</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Whether it's a data project, web application, AI automation, or just a conversation — I'm open to discussing how I can help.
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
                      {item.href ? (
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
                  Or fill out the form below and I'll get back to you within 24 hours.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 animate-in fade-in">
                      <CheckCircle className="h-5 w-5" />
                      <span>Message sent successfully! I'll respond within 24 hours.</span>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="flex items-center space-x-2 text-destructive animate-in fade-in">
                      <AlertCircle className="h-5 w-5" />
                      <span>Failed to send. Please try again or email me directly.</span>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}