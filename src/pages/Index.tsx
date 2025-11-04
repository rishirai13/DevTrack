import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, Calendar, TrendingUp, Star, Github } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DevTrack</span>
          </Link>
          <Button onClick={() => navigate(user ? "/dashboard" : "/auth")}>
            {user ? "Go to Dashboard" : "Sign In"}
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              Track Your{" "}
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Developer Journey
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Empower your learning with DevTrack. Log daily progress, visualize insights, and watch your skills grow — one entry at a time.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button 
                size="lg" 
                className="shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                onClick={() => navigate(user ? "/dashboard" : "/auth")}
              >
                {user ? "Go to Dashboard" : "Get Started"}
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                <Github className="mr-2 h-5 w-5" />
                Sign in with GitHub
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Everything You Need to Track Your Growth
            </h2>
            <p className="text-lg text-muted-foreground">
              Simple, powerful tools for developer productivity
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Daily Logging</h3>
              <p className="text-muted-foreground">
                Capture your learning moments with our intuitive journal. Add entries, tags, and reflections in seconds.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Visual Insights</h3>
              <p className="text-muted-foreground">
                See your progress through beautiful charts. Track streaks, tag frequency, and learning patterns.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Share Your Journey</h3>
              <p className="text-muted-foreground">
                Build a public portfolio of your learning. Share achievements and inspire others in the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-12 text-center shadow-[0_0_40px_hsl(var(--primary)/0.15)]">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Start Your Journey Today
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join developers who are building better learning habits
            </p>
            <Button 
              size="lg" 
              className="shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
              onClick={() => navigate(user ? "/dashboard" : "/auth")}
            >
              {user ? "Go to Dashboard" : "Create Your Account"}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" />
                <span className="font-bold">DevTrack</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your developer progress journal. Track, reflect, and grow.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-foreground">Features</Link></li>
                <li><Link to="/" className="hover:text-foreground">Pricing</Link></li>
                <li><Link to="/" className="hover:text-foreground">Roadmap</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://github.com" className="hover:text-foreground">GitHub</a></li>
                <li><Link to="/" className="hover:text-foreground">Documentation</Link></li>
                <li><Link to="/" className="hover:text-foreground">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 DevTrack. Built for developers, by developers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
