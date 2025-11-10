"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-semibold">Terms of Service</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Terms of Service</h1>

          <p>
            <strong>Effective Date:</strong> January 1, 2025
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Tedix platform ("Service"), you agree to be bound by these
            Terms of Service ("Terms"). If you disagree with any part of these terms, then you may
            not access the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Tedix is an AI commerce platform that helps brands be discovered when people mention
            your brand in AI conversations. The Service includes brand content analysis, AI-powered
            recommendations, and ChatGPT integration tools.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            When you create an account with us, you must provide information that is accurate,
            complete, and current at all times. You are responsible for safeguarding the password
            and for all activities that occur under your account.
          </p>

          <h2>4. Acceptable Use</h2>
          <p>You may not use our Service:</p>
          <ul>
            <li>For any unlawful purpose or to solicit others to perform illegal activities</li>
            <li>
              To violate any international, federal, provincial, or state regulations, rules, or
              laws
            </li>
            <li>
              To infringe upon or violate our intellectual property rights or the intellectual
              property rights of others
            </li>
            <li>
              To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or
              discriminate
            </li>
            <li>To submit false or misleading information</li>
          </ul>

          <h2>5. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are and will remain
            the exclusive property of Tedix and its licensors. The Service is protected by
            copyright, trademark, and other laws.
          </p>

          <h2>6. Privacy Policy</h2>
          <p>
            Your privacy is important to us. Please review our Privacy Policy, which also governs
            your use of the Service, to understand our practices.
          </p>

          <h2>7. Termination</h2>
          <p>
            We may terminate or suspend your access immediately, without prior notice or liability,
            for any reason whatsoever, including without limitation if you breach the Terms.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            In no event shall Tedix, nor its directors, employees, partners, agents, suppliers, or
            affiliates, be liable for any indirect, incidental, special, consequential, or punitive
            damages, including without limitation, loss of profits, data, use, goodwill, or other
            intangible losses, resulting from your use of the Service.
          </p>

          <h2>9. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any
            time. If a revision is material, we will try to provide at least 30 days notice prior to
            any new terms taking effect.
          </p>

          <h2>10. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at
            legal@tedix.com.
          </p>
        </div>
      </div>
    </div>
  );
}
