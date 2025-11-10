"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ReactMarkdown from "react-markdown";

function AISearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const results = searchParams.get("results") || "";
  const error = searchParams.get("error");
  const timestamp = searchParams.get("timestamp") || new Date().toISOString();
  const source = searchParams.get("source") || "unknown";

  // Brand context parameters
  const brandName = searchParams.get("brandName");
  const brandDomain = searchParams.get("brandDomain");
  const brandLogo = searchParams.get("brandLogo");

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-red-800">
                  Search Error
                </h1>
                <p className="text-red-600">
                  Failed to process your search request
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 mb-2">Query:</p>
                <p className="text-red-700 bg-white px-3 py-2 rounded border">
                  {query}
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 mb-2">
                  Error Details:
                </p>
                <p className="text-red-700 bg-white px-3 py-2 rounded border font-mono text-sm">
                  {error}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-red-200">
              <div className="flex justify-between items-center text-sm text-red-600">
                <span>Source: {source}</span>
                <span>{new Date(timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            {brandLogo ? (
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                <Image
                  src={brandLogo}
                  width={16}
                  height={16}
                  alt={`${brandName} logo`}
                  className="w-8 h-8 object-contain"
                />
                <div className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center hidden">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {brandName
                  ? `${brandName} Search Results`
                  : "AI Search Results"}
              </h1>
              <p className="text-gray-600">
                {brandName
                  ? `Powered by Tedix • ${brandDomain}`
                  : "Powered by Tedix Brand Intelligence"}
              </p>
            </div>
          </div>

          {/* Search Query */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-blue-800 mb-2">
              Search Query:
            </p>
            <p className="text-blue-900 bg-white px-3 py-2 rounded border font-medium">
              {query}
            </p>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                AI-Generated Response
              </h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="max-w-none markdown-content">
                  <ReactMarkdown
                    components={{
                      // Custom styling for markdown elements
                      p: ({ children }) => (
                        <p className="mb-3 text-base leading-7 text-gray-700">
                          {children}
                        </p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900 bg-yellow-100 px-1 rounded">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic text-gray-800">{children}</em>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-4 space-y-2 pl-2">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-4 space-y-2 pl-2">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-gray-700 leading-6">{children}</li>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-xl font-bold mb-4 text-gray-900 border-b border-gray-300 pb-2">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg font-semibold mb-3 text-gray-900">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base font-semibold mb-2 text-gray-900">
                          {children}
                        </h3>
                      ),
                      code: ({ children }) => (
                        <code className="bg-blue-100 text-blue-900 px-2 py-1 rounded text-sm font-mono">
                          {children}
                        </code>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-400 bg-blue-50 pl-4 py-2 italic text-gray-700 mb-4 rounded-r">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {results}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Interactive Elements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2">
                  Search Insights
                </h3>
                <div className="space-y-2 text-sm text-purple-700">
                  <div className="flex justify-between">
                    <span>Response Quality:</span>
                    <span className="font-medium">High</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sources Used:</span>
                    <span className="font-medium">Brand Database</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Time:</span>
                    <span className="font-medium">&lt; 2s</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">
                  Next Actions
                </h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-green-700 hover:bg-green-100 rounded transition-colors">
                    📊 View detailed analytics
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-green-700 hover:bg-green-100 rounded transition-colors">
                    🔍 Refine search query
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-green-700 hover:bg-green-100 rounded transition-colors">
                    💾 Save to workspace
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span>Source: {source}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {new Date(timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1 text-blue-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="font-medium">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AISearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading search results...</p>
          </div>
        </div>
      }
    >
      <AISearchResults />
    </Suspense>
  );
}
