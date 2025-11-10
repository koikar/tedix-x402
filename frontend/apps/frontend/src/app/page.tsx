"use client";

import { ArrowRight, Bot, Sparkles, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const [brandUrl, setBrandUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (brandUrl?.trim()) {
      setIsAnalyzing(true);
      router.push(`/playground?url=${encodeURIComponent(brandUrl.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Simplified Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold">Tedix</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/playground"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Playground
              </Link>
              <ModeToggle />
              <Button asChild>
                <Link href="/">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent dark:from-slate-100 dark:via-slate-200 dark:to-slate-300">
                AI Commerce
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Platform
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Be discovered when people are mentioning your brand in AI conversations.
            </p>

            {/* Brand Input */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Enter your brand URL (e.g., nike.com)"
                    value={brandUrl}
                    onChange={(e) => setBrandUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    disabled={isAnalyzing}
                  />
                </div>
                <Button type="submit" disabled={!brandUrl || isAnalyzing} className="px-6 py-3">
                  {isAnalyzing ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    "Analyze"
                  )}
                </Button>
              </form>
            </div>

            {/* Quick Examples */}
            <div className="flex flex-wrap justify-center gap-2">
              {["nike.com", "apple.com", "airbnb.com", "stripe.com"].map((url) => (
                <Button
                  key={url}
                  variant="outline"
                  size="sm"
                  onClick={() => setBrandUrl(url)}
                  disabled={isAnalyzing}
                  className="text-sm"
                >
                  {url}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">AI Commerce Use Cases</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how brands across industries are preparing for AI commerce
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background border rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bot className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">E-commerce</h3>
              <p className="text-muted-foreground">
                Product recommendations and shopping assistance through AI
              </p>
            </div>

            <div className="bg-background border rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">SaaS Tools</h3>
              <p className="text-muted-foreground">Feature explanations and integration guidance</p>
            </div>

            <div className="bg-background border rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Services</h3>
              <p className="text-muted-foreground">Service descriptions and expert matching</p>
            </div>
          </div>
        </div>
      </section>

      {/* ChatGPT App Store Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl sm:text-5xl font-bold">
              ChatGPT
              <br />
              <span className="text-accent">App Store</span>
              <br />
              Ready
            </h2>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your brand appears when millions of users ask ChatGPT for recommendations
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold">Connect Brand</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your URL and we'll import your content
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold">Generate App</h3>
                <p className="text-sm text-muted-foreground">AI generates your ChatGPT app</p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold">Go Live</h3>
                <p className="text-sm text-muted-foreground">
                  Users discover your brand through AI
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready for AI Distribution?</h2>
          <Button size="lg" className="text-lg px-8 py-4" asChild>
            <Link href="/">
              Launch Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Free tier • No credit card • Enterprise support
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <span className="font-bold">Tedix</span>
            </div>

            <div className="flex items-center space-x-8 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-accent transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-accent transition-colors">
                Privacy
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Tedix. Built for the AI commerce era.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
