
import { Link } from "react-router-dom";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  Activity,
  Lock,
  Eye,
  UserCheck,
  Bell,
  CheckCircle2,
  Building,
  UserPlus,
  Users,
  Settings,
} from "lucide-react";

/**
 * Public landing page for the Citizen Grievance Portal.
 * Designed using modern government aesthetics, high typographic contrast, and WCAG recommendations.
 */
export const LandingPage = () => {
  const { user } = useAuth();

  const features = [
    {
      title: "Easy Complaint Submission",
      description: "Submit municipal grievances in under two minutes with category filters, description logs, and photo uploads.",
      icon: FileText,
    },
    {
      title: "Real-time Status Tracking",
      description: "Monitor the state of your reported concern with visual step-by-step progress bars and timestamps.",
      icon: Activity,
    },
    {
      title: "Secure Authentication",
      description: "All citizen accounts and official administrative operations are encrypted and securely authenticated.",
      icon: Lock,
    },
    {
      title: "Transparent Resolution Process",
      description: "Ensure accountability. Watch municipal actions update live, with audit trails of work and communication.",
      icon: Eye,
    },
    {
      title: "Department Assignment",
      description: "Automated routing engines direct issues to the correct department and assign a specific resolving officer.",
      icon: UserCheck,
    },
    {
      title: "Citizen Notifications",
      description: "Receive instant updates via alerts and notifications on your dashboard whenever actions are taken on your ticket.",
      icon: Bell,
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Register/Login",
      description: "Create a secure account using your email or sign in to verify your identity.",
    },
    {
      number: "2",
      title: "Submit Complaint",
      description: "Describe the concern, set the category, input location, and submit the ticket.",
    },
    {
      number: "3",
      title: "Department Reviews",
      description: "The portal routes the complaint, and the assigned officer begins verification.",
    },
    {
      number: "4",
      title: "Track & Resolve",
      description: "Follow progress live, correspond with resolving staff, and verify resolution.",
    },
  ];

  return (
    <div className="bg-background text-foreground">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Text Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                <ShieldCheck className="size-4" aria-hidden="true" />
                <span>Verified Public Services Portal</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading text-neutral-900 leading-tight">
                Empowering Communities through <br />
                <span className="text-primary">Transparent Grievance Resolves.</span>
              </h1>
              <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Connect directly with local municipal services. Report community grievances,
                track resolved parameters in real-time, and collaborate with assigned officers.
                Together, let's create a better public space.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Button variant="primary" size="lg" as={Link} to={
                  user
                    ? (user.role?.toLowerCase() === "admin"
                        ? "/admin/dashboard"
                        : (user.role?.toLowerCase() === "officer"
                            ? "/officer/dashboard"
                            : "/citizen/dashboard"))
                    : "/login"
                }>
                  Report a Grievance
                  <ArrowRight className="size-5 ml-1" aria-hidden="true" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => {
                  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
                }}>
                  Learn More
                </Button>
              </div>
            </div>

            {/* Hero Illustration / Dashboard Activity Mockup */}
            <div className="lg:col-span-5 w-full max-w-md mx-auto">
              <Card className="shadow-lg border border-neutral-200 overflow-hidden bg-white">
                <div className="bg-neutral-900 px-6 py-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-success animate-pulse" />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      Portal Monitor
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400">Live Statistics</span>
                </div>
                <CardContent className="p-6 space-y-6">
                  {/* Mock Chart / Activity Bars */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                        <span>Roads & Infrastructure</span>
                        <span>89% Resolved</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "89%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                        <span>Sanitation & Waste</span>
                        <span>96% Resolved</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-success rounded-full" style={{ width: "96%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                        <span>Water Supply</span>
                        <span>92% Resolved</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "92%" }} />
                      </div>
                    </div>
                  </div>

                  {/* Summary Counters */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100 text-center">
                    <div>
                      <p className="text-2xl font-bold text-neutral-900 font-heading">
                        12,480
                      </p>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                        Grievances Resolved
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary font-heading">
                        94.3%
                      </p>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                        Resolution Rate
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Features Section */}
      <section id="features" className="py-20 bg-neutral-100 border-y border-neutral-200">
        <Container size="lg">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-heading text-neutral-900">
              Modern Portal Capabilities
            </h2>
            <p className="text-base sm:text-lg text-neutral-600">
              Structured to optimize grievance filing, tracking, and communication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <Card key={idx} hover className="bg-white border-neutral-200">
                  <CardContent className="p-8 space-y-4">
                    <div className="size-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="size-6" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-bold font-heading text-neutral-900">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      {feat.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 3. How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <Container size="lg">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-heading text-neutral-900">
              How the Portal Works
            </h2>
            <p className="text-base sm:text-lg text-neutral-600">
              Four structured phases ensuring transparent processing of every ticket.
            </p>
          </div>

          <div className="relative">
            {/* Timeline connectors (visible on large screen) */}
            <div className="hidden lg:block absolute top-6 left-12 right-12 h-0.5 bg-neutral-200 -z-10" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, idx) => (
                <div key={idx} className="space-y-4 text-center lg:text-left relative bg-white px-2">
                  <div className="size-12 rounded-full bg-primary text-white flex items-center justify-center font-bold font-heading text-lg mx-auto lg:mx-0 shadow-md">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 font-heading">
                    {step.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* 4. Benefits Section */}
      <section id="about" className="py-20 bg-neutral-100 border-t border-neutral-200">
        <Container size="lg">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-heading text-neutral-900">
              Empowering All Stakeholders
            </h2>
            <p className="text-base sm:text-lg text-neutral-600">
              A comprehensive system designed to add value across the entire service ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Citizens Card */}
            <Card className="bg-white border-neutral-200 shadow-sm">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Users className="size-5" />
                  </div>
                  <h3 className="text-xl font-bold font-heading text-neutral-900">For Citizens</h3>
                </div>
                <ul className="space-y-3.5 text-sm text-neutral-600">
                  <li className="flex gap-2 items-start">
                    <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                    <span>Lodge concerns online in under 2 minutes, avoiding municipal queues.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                    <span>Track progress with step-by-step transparency.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                    <span>Receive instant updates when actions are taken.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Officers Card */}
            <Card className="bg-white border-neutral-200 shadow-sm">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Building className="size-5" />
                  </div>
                  <h3 className="text-xl font-bold font-heading text-neutral-900">For Officers</h3>
                </div>
                <ul className="space-y-3.5 text-sm text-neutral-600">
                  <li className="flex gap-2 items-start">
                    <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                    <span>Consolidated department dashboard to track outstanding issues.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                    <span>Provide direct resolution updates back to the reporting citizen.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                    <span>Maintain digital audit logs of department resolutions.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Admin Card */}
            <Card className="bg-white border-neutral-200 shadow-sm">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Settings className="size-5" />
                  </div>
                  <h3 className="text-xl font-bold font-heading text-neutral-900">For Administrators</h3>
                </div>
                <ul className="space-y-3.5 text-sm text-neutral-600">
                  <li className="flex gap-2 items-start">
                    <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                    <span>Audit resolving velocities across multiple departments.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                    <span>Track municipal resolution statistics to optimize workloads.</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                    <span>Configure categories, workflows, and resolve parameters.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* 5. Call To Action (CTA) Section */}
      <section className="py-20 bg-white">
        <Container size="lg">
          <div className="bg-neutral-950 text-white rounded-2xl p-8 sm:p-12 lg:p-16 text-center space-y-6 shadow-xl relative overflow-hidden">
            {/* Dynamic CSS visual helper */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-primary),transparent_50%)] opacity-30" />
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
                Ready to Join a Cleaner, Safer Community?
              </h2>
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                Create your official portal account now. Lodge public issues, receive alerts on changes,
                and help build a transparent community partnership.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button variant="primary" size="lg" as={Link} to="/signup" className="bg-primary text-white hover:bg-primary/95 border-0">
                  <UserPlus className="size-5 mr-1.5" />
                  Create Account
                </Button>
                <Button variant="outline" size="lg" as={Link} to="/login" className="border-neutral-700 hover:border-neutral-500 bg-transparent text-white hover:bg-neutral-900">
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
export default LandingPage;
