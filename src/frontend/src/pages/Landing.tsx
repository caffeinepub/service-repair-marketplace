import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Globe,
  HardHat,
  Search,
  Shield,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import { useAppContext } from "../hooks/useAppContext";
import { useGetAllJobs, useGetProviders } from "../hooks/useQueries";
import { JOB_CATEGORIES } from "../lib/constants";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Post a Job",
    desc: "Government institutions post repair & maintenance requirements with budget, deadline, and location details.",
    icon: ClipboardList,
    color: "bg-blue-50 text-primary",
  },
  {
    step: "02",
    title: "Providers Bid",
    desc: "Verified ITI-trained service providers browse jobs and submit competitive bids with their approach.",
    icon: HardHat,
    color: "bg-orange-50 text-accent-orange",
  },
  {
    step: "03",
    title: "Select & Assign",
    desc: "Institutions review bids, select the best provider, and assign the work with a single click.",
    icon: CheckCircle2,
    color: "bg-green-50 text-green-600",
  },
  {
    step: "04",
    title: "Rate & Review",
    desc: "After completion, institutions rate providers and give feedback to build trust in the ecosystem.",
    icon: Star,
    color: "bg-purple-50 text-purple-600",
  },
];

const FEATURES = [
  {
    icon: Shield,
    title: "Verified Providers",
    desc: "All ITI-trained service providers are verified by platform admins before they can bid.",
  },
  {
    icon: Zap,
    title: "Fast Bidding",
    desc: "Get multiple competitive bids within hours of posting. Compare and choose the best.",
  },
  {
    icon: Globe,
    title: "Decentralized",
    desc: "Built on Internet Computer Protocol — no central server, permanent and tamper-proof records.",
  },
];

export default function Landing() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const { data: allJobs } = useGetAllJobs();
  const { data: providers } = useGetProviders();
  const { isAuthenticated } = useAppContext();

  const totalJobs = allJobs?.length ?? 0;
  const totalProviders = providers?.length ?? 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category && category !== "all") params.set("category", category);
    window.location.href = `/jobs?${params.toString()}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="hero-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-white border border-border rounded-full px-3 py-1 text-xs font-medium text-primary mb-5 shadow-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Powered by Internet Computer Protocol
              </div>
              <h1 className="font-display font-extrabold text-foreground text-4xl sm:text-5xl lg:text-5xl xl:text-6xl leading-tight mb-5">
                Connect Institutions with{" "}
                <span className="text-primary">Skilled Service</span> Providers
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-xl">
                India's premier government-grade marketplace for repair &amp;
                maintenance services. Post jobs, find verified ITI-trained
                providers, and track work to completion.
              </p>

              {/* Search bar */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="flex flex-col sm:flex-row gap-2 bg-white border border-border rounded-xl p-2 shadow-card">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search jobs..."
                      className="pl-9 border-0 shadow-none focus-visible:ring-0 bg-transparent"
                      data-ocid="landing.search_input"
                    />
                  </div>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger
                      className="sm:w-40 border-0 shadow-none focus:ring-0 bg-transparent"
                      data-ocid="landing.category.select"
                    >
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {JOB_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="submit"
                    className="bg-primary text-white rounded-lg"
                    data-ocid="landing.search.button"
                  >
                    <Search className="h-4 w-4 mr-1.5" />
                    Search
                  </Button>
                </div>
              </form>

              {/* CTAs — only show when not logged in */}
              {!isAuthenticated && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="bg-primary text-white rounded-lg shadow-btn hover:bg-primary/90"
                    data-ocid="landing.institution.primary_button"
                  >
                    <Link to="/auth">
                      <Building2 className="h-4 w-4 mr-2" />
                      I'm an Institution
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    className="bg-accent-orange text-white rounded-lg hover:bg-accent-orange/90"
                    data-ocid="landing.provider.primary_button"
                  >
                    <Link to="/auth">
                      <HardHat className="h-4 w-4 mr-2" />
                      I'm a Service Provider
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex justify-center lg:justify-end"
            >
              <img
                src="/assets/generated/hero-srm-illustration.dim_600x450.png"
                alt="Service and Repair Marketplace"
                className="w-full max-w-lg rounded-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 z-10 relative">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Total Jobs",
              value: totalJobs > 0 ? totalJobs : "—",
              icon: Briefcase,
              color: "text-primary",
            },
            {
              label: "Service Providers",
              value: totalProviders > 0 ? totalProviders : "—",
              icon: Users,
              color: "text-accent-orange",
            },
            {
              label: "Avg. Rating",
              value: "—",
              icon: Star,
              color: "text-yellow-500",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
            >
              <Card className="border border-border shadow-card rounded-xl bg-white">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Role cards — always show admin card; show institution/provider only when logged out */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div
          className={`grid grid-cols-1 gap-6 ${
            isAuthenticated ? "max-w-md mx-auto" : "md:grid-cols-3"
          }`}
        >
          {!isAuthenticated && (
            <>
              <Card className="border border-border rounded-xl shadow-card overflow-hidden">
                <div className="h-2 bg-primary" />
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground text-xl mb-2">
                    For Government Institutions
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Post repair &amp; maintenance jobs, review bids from
                    verified providers, track work progress, and manage your
                    entire service procurement digitally.
                  </p>
                  <ul className="space-y-2 mb-5">
                    {[
                      "Post detailed job requests with images",
                      "Compare bids and select best provider",
                      "Track job status in real-time",
                      "Rate and review service quality",
                    ].map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-sm text-foreground/80"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="bg-primary text-white rounded-lg"
                    data-ocid="landing.institution.secondary_button"
                  >
                    <Link to="/auth">
                      Get Started <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-border rounded-xl shadow-card overflow-hidden">
                <div className="h-2 bg-accent-orange" />
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-accent-orange/10 flex items-center justify-center mb-4">
                    <HardHat className="h-6 w-6 text-accent-orange" />
                  </div>
                  <h3 className="font-display font-bold text-foreground text-xl mb-2">
                    For ITI Service Providers
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Browse government job postings, submit competitive bids,
                    showcase your ITI certifications, and grow your professional
                    reputation.
                  </p>
                  <ul className="space-y-2 mb-5">
                    {[
                      "Browse hundreds of job listings",
                      "Submit bids with your best price",
                      "Build verified service portfolio",
                      "Get paid for quality work",
                    ].map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-sm text-foreground/80"
                      >
                        <CheckCircle2 className="h-4 w-4 text-accent-orange flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="bg-accent-orange text-white rounded-lg hover:bg-accent-orange/90"
                    data-ocid="landing.provider.secondary_button"
                  >
                    <Link to="/auth">
                      Join as Provider <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Admin card — always visible */}
          <Card
            className="border border-border rounded-xl shadow-card overflow-hidden"
            data-ocid="landing.admin.card"
          >
            <div className="h-2 bg-destructive" />
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="font-display font-bold text-foreground text-xl mb-2">
                Platform Administrator
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Access the admin dashboard to verify service providers, monitor
                jobs, manage users, and maintain platform integrity.
              </p>
              <ul className="space-y-2 mb-5">
                {[
                  "Verify ITI-trained service providers",
                  "Monitor all active jobs",
                  "Manage all platform users",
                  "View platform analytics",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-foreground/80"
                  >
                    <CheckCircle2 className="h-4 w-4 text-destructive flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="bg-destructive text-white rounded-lg hover:bg-destructive/90"
                data-ocid="landing.admin.primary_button"
              >
                <Link to="/auth">
                  Login as Admin <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="hero-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-foreground text-3xl sm:text-4xl mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              From posting to completion in four simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border border-border rounded-xl bg-white shadow-card h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center`}
                      >
                        <step.icon className="h-5 w-5" />
                      </div>
                      <span className="font-display font-bold text-foreground/30 text-2xl">
                        {step.step}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-foreground text-lg mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-foreground text-3xl sm:text-4xl mb-3">
            Why Choose SRM?
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <f.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground text-lg mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section
        id="contact"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16"
      >
        <div className="bg-primary rounded-2xl p-8 sm:p-12 text-center text-white">
          <h2 className="font-display font-bold text-2xl sm:text-3xl mb-3">
            Ready to Get Started?
          </h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            Join thousands of institutions and service providers already on the
            platform.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-white/90 rounded-lg font-semibold"
            data-ocid="landing.cta.primary_button"
          >
            <Link to="/auth">
              Create Your Account <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
