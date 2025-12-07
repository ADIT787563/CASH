"use client";

import { CheckCircle2, Target, Eye, Sparkles, Heart, Zap, Award, TrendingUp } from "lucide-react";

import { Footer } from "@/components/home/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 animate-gradient" />

        <div className="relative w-full px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">About Us</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Welcome to <span className="gradient-text">Our Platform</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              My name is <span className="font-semibold text-foreground">Ansh Kumar</span>, an 18-year-old student and the creator of this website. I built this platform with one clear intention: to offer a reliable, modern, and transparent solution that genuinely helps people.
            </p>
          </div>
        </div>
      </section>

      {/* Why This Platform Section */}
      <section className="py-16 lg:py-24">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why This Platform <span className="gradient-text">Was Created</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8">
              In today's fast-moving digital world, most online services look complicated, slow, or confusing. Users struggle with:
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                "Unclear processes",
                "Difficult interfaces",
                "Lack of transparency",
                "Poor customer service",
                "Limited trust"
              ].map((issue, index) => (
                <div key={index} className="flex items-center gap-3 p-4 glass-card rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                  <span className="text-foreground">{issue}</span>
                </div>
              ))}
            </div>

            <div className="glass-card p-8 rounded-2xl border-l-4 border-primary">
              <h3 className="text-2xl font-bold mb-4 text-primary">I wanted to change that.</h3>
              <p className="text-lg text-muted-foreground mb-4">
                This platform was built to bring simplicity, clarity, and trust back to the experience. The main idea was to create something that even a beginner can understand immediately—smooth, clean, fast, and designed for real people.
              </p>
              <p className="text-lg font-medium text-foreground">
                Everything here has a purpose: <span className="text-primary">To save your time, reduce confusion, and give you a service you can depend on.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How This Platform Helps Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              How This Platform <span className="gradient-text">Helps You</span>
            </h2>

            <p className="text-lg text-muted-foreground text-center mb-12">
              Our website was designed to solve real user problems in a practical way.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: Zap,
                  title: "Smooth User Experience",
                  description: "Every page is optimized for speed and clarity. Buttons, colors, animations, and the overall interface are created to feel premium and easy to use."
                },
                {
                  icon: Eye,
                  title: "Transparent Functionality",
                  description: "Nothing here is hidden or unclear. Whatever you interact with—forms, options, tools—works the way it is supposed to, without confusion or complexity."
                },
                {
                  icon: Award,
                  title: "Reliable Performance",
                  description: "From backend logic to frontend design, all features are developed to work consistently. No unnecessary loading, no messy steps, no frustration."
                },
                {
                  icon: CheckCircle2,
                  title: "Modern and Secure",
                  description: "I follow clean development practices and prioritize user data safety. Security, privacy, and reliability are key parts of how this platform is built."
                },
                {
                  icon: TrendingUp,
                  title: "Focused on Real Use Cases",
                  description: "This platform is not built for show. It is made to solve practical daily problems quickly and efficiently."
                }
              ].map((feature, index) => (
                <div key={index} className="glass-card p-6 rounded-xl hover:border-primary/30 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{index + 1}. {feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who Is Behind Section */}
      <section className="py-16 lg:py-24">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              Who Is <span className="gradient-text">Behind This Project</span>
            </h2>

            <div className="glass-card p-8 rounded-2xl">
              <p className="text-lg text-muted-foreground mb-6">
                I am <span className="font-bold text-foreground text-xl">Ansh Kumar</span>, currently an 18-year-old student with a strong interest in technology, development, and entrepreneurship.
              </p>

              <p className="text-lg text-muted-foreground mb-6">
                Even though I am still learning, I work with a clear mindset:
              </p>

              <div className="space-y-3 mb-6">
                {[
                  "Build things that genuinely help people",
                  "Keep improving the quality",
                  "Make technology simple and accessible",
                  "Stay honest, transparent, and responsible"
                ].map((point, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground text-lg">{point}</span>
                  </div>
                ))}
              </div>

              <p className="text-lg text-muted-foreground">
                Every feature on this platform is developed through constant research, testing, and refinement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Mission */}
              <div className="glass-card p-8 rounded-2xl border-t-4 border-primary">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-lg text-muted-foreground">
                  To build digital tools that are simple, fast, and trustworthy—tools that make life easier for users, without unnecessary complications.
                </p>
              </div>

              {/* Vision */}
              <div className="glass-card p-8 rounded-2xl border-t-4 border-accent">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                <p className="text-lg text-muted-foreground mb-4">
                  To become a platform that people can rely on confidently. A platform known for:
                </p>
                <div className="space-y-2">
                  {["Smooth design", "Reliable performance", "Honest service", "Continuous improvement"].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-lg text-muted-foreground mt-4">
                  As I grow in knowledge and skills, this platform will continue to grow as well.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 lg:py-24">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Our <span className="gradient-text">Core Values</span>
            </h2>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: CheckCircle2,
                  title: "Trust",
                  description: "Everything starts with transparency and honesty. Users should feel safe and confident.",
                  color: "primary"
                },
                {
                  icon: Zap,
                  title: "Simplicity",
                  description: "No complex processes. Everything is straight, simple, and clear.",
                  color: "accent"
                },
                {
                  icon: Award,
                  title: "Quality",
                  description: "Smooth performance, modern design, and consistent reliability.",
                  color: "secondary"
                },
                {
                  icon: TrendingUp,
                  title: "Learning & Improvement",
                  description: "As a student, I constantly learn new things and update the platform to keep it better than before.",
                  color: "success"
                }
              ].map((value, index) => (
                <div key={index} className="glass-card p-6 rounded-xl hover:scale-[1.02] transition-transform">
                  <div className={`w-12 h-12 rounded-xl bg-${value.color}/10 flex items-center justify-center mb-4`}>
                    <value.icon className={`w-6 h-6 text-${value.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
              <Heart className="w-8 h-8 text-primary" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Committed to <span className="gradient-text">Your Experience</span>
            </h2>

            <div className="space-y-4 text-lg text-muted-foreground mb-8">
              <p>Every feature you see here is built with care.</p>
              <p>Every update is tested.</p>
              <p>Every improvement is made for users.</p>
            </div>

            <div className="glass-card p-8 rounded-2xl inline-block">
              <p className="text-xl font-medium text-foreground mb-2">
                This platform is not just a project—it is a long-term journey.
              </p>
              <p className="text-lg text-muted-foreground">
                A journey of learning, building, improving, and earning user trust every day.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
