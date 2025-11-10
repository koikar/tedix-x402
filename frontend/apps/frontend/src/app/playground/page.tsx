"use client";

import { useChat } from "@ai-sdk/react";
import {
  isUIResource,
  type UIActionResult,
  UIResourceRenderer,
} from "@mcp-ui/client";
import { DefaultChatTransport } from "ai";
import { ArrowLeft, Globe } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Response } from "@/components/ai-elements/response";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";

import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ChatBot = dynamic(() => import("@/components/chatbot"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  ),
});

function BrandSelector({
  selectedBrand,
  onBrandChange,
}: {
  selectedBrand: { id: string; name: string; logo_url: string | null } | null;
  onBrandChange: (
    brand: { id: string; name: string; logo_url: string | null } | null,
  ) => void;
}) {
  const brands: Array<{
    id: string;
    name: string;
    logo_url: string | null;
    primary_domain: string;
  }> = [];

  return (
    <Select
      value={selectedBrand?.id || "global"}
      onValueChange={(value) => {
        if (value === "global") {
          onBrandChange(null);
        } else {
          const brand = brands?.find((b) => b.id === value);
          if (brand) {
            onBrandChange({
              id: brand.id,
              name: brand.name,
              logo_url: brand.logo_url,
            });
          }
        }
      }}
    >
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select brand context" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="global">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Global Search
          </div>
        </SelectItem>
        {brands?.map((brand) => (
          <SelectItem key={brand.id} value={brand.id}>
            <div className="flex items-center gap-2">
              {brand.logo_url && (
                <img
                  src={brand.logo_url}
                  alt={`${brand.name} logo`}
                  className="w-4 h-4 object-contain"
                />
              )}
              <span>{brand.name}</span>
              <span className="text-xs text-muted-foreground">
                ({brand.primary_domain})
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function PlaygroundPage() {
  // AI Chat functionality
  const [input, setInput] = useState("");
  const [model, setModel] = useState("google/gemini-1.5-pro");
  const [selectedBrand, setSelectedBrand] = useState<{
    id: string;
    name: string;
    logo_url: string | null;
  } | null>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onError: (error) => console.error(error),
  });

  const models = [
    { name: "Gemini 1.5 Pro", value: "google/gemini-1.5-pro" },
    { name: "Gemini 1.5 Flash", value: "google/gemini-1.5-flash" },
    { name: "GPT 4o", value: "openai/gpt-4o" },
    { name: "GPT 4o Mini", value: "openai/gpt-4o-mini" },
  ];

  // Chat handlers
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(
        { text: input },
        {
          body: {
            model: model,
            enableMCPUI: true, // Flag to enable MCP-UI tools
            brandId: selectedBrand?.id, // Pass selected brand ID
          },
        },
      );
      setInput("");
    }
  };

  // Handle actions from MCP-UI resources
  const handleUIAction = async (
    result: UIActionResult,
  ): Promise<{ status: string }> => {
    console.log("MCP-UI Action received:", result);

    if (result.type === "tool") {
      sendMessage(
        {
          text: `Execute ${result.payload.toolName} with params: ${JSON.stringify(result.payload.params)}`,
        },
        {
          body: {
            model: model,
            enableMCPUI: true,
            toolCall: result.payload,
            brandId: selectedBrand?.id, // Pass selected brand ID
          },
        },
      );
    } else if (result.type === "prompt") {
      sendMessage(
        { text: result.payload.prompt },
        {
          body: {
            model: model,
            enableMCPUI: true,
            brandId: selectedBrand?.id, // Pass selected brand ID
          },
        },
      );
    } else if (result.type === "link") {
      window.open(result.payload.url, "_blank");
    } else if (result.type === "notify") {
      console.log("Notification:", result.payload.message);
    }

    return { status: "Action handled by MCP-UI client" };
  };

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
              <h1 className="text-xl font-semibold">Brand Playground</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ModeToggle />
              <Badge variant="secondary" className="text-xs">
                AI-Powered Analysis
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* AI Chat Interface */}
          <div className="bg-card/50 backdrop-blur border rounded-xl shadow-sm h-[600px] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">AI Chat Interface</h3>
                <p className="text-sm text-muted-foreground">
                  Chat with AI about{" "}
                  {selectedBrand ? `${selectedBrand.name}` : "brands"} using MCP
                  tools
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Brand Selector */}
                {/*<div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">
                    Brand Context
                  </p>
                  <Suspense
                    fallback={
                      <Select disabled>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Loading brands..." />
                        </SelectTrigger>
                      </Select>
                    }
                  >
                    <BrandSelector
                      selectedBrand={selectedBrand}
                      onBrandChange={setSelectedBrand}
                    />
                  </Suspense>
                </div>*/}
                {/* Model Selector */}
                {/*<div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">AI Model</p>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>*/}
              </div>
            </div>

            <ChatBot />

            {/*<Conversation className="flex-1">
              <ConversationContent>
                {messages.map((message) => (
                  <Message from={message.role} key={message.id}>
                    <MessageContent>
                      {message.parts.map((part, i) => {
                        if (part.type === "text") {
                          return (
                            <Response key={`${message.id}-${i}`}>
                              {part.text}
                            </Response>
                          );
                        } else if (part.type === "reasoning") {
                          return (
                            <Reasoning
                              key={`${message.id}-${i}`}
                              className="w-full"
                              isStreaming={status === "streaming"}
                            >
                              <ReasoningTrigger />
                              <ReasoningContent>{part.text}</ReasoningContent>
                            </Reasoning>
                          );
                        } else if (
                          part.type === "dynamic-tool" ||
                          part.type.startsWith("tool-")
                        ) {
                          const toolOutput =
                            "output" in part ? part.output : undefined;
                          const uiResources: React.ReactNode[] = [];

                          if (
                            toolOutput &&
                            typeof toolOutput === "object" &&
                            "content" in toolOutput &&
                            Array.isArray(toolOutput.content)
                          ) {
                            toolOutput.content.forEach(
                              (contentItem: any, contentIndex: number) => {
                                if (isUIResource(contentItem)) {
                                  uiResources.push(
                                    <div
                                      key={`ui-${message.id}-${i}-${contentIndex}`}
                                      className="w-full my-4 border-2 border-blue-200 rounded-lg p-2"
                                    >
                                      <UIResourceRenderer
                                        resource={contentItem.resource}
                                        onUIAction={handleUIAction}
                                        htmlProps={{
                                          autoResizeIframe: true,
                                          style: {
                                            width: "100%",
                                            minHeight: "200px",
                                            maxHeight: "400px",
                                            border: "1px solid #e1e5e9",
                                            borderRadius: "8px",
                                          },
                                        }}
                                      />
                                    </div>,
                                  );
                                }
                              },
                            );
                          }

                          return (
                            <div key={`${message.id}-${i}`}>
                              <Tool defaultOpen={false}>
                                <ToolHeader part={part} />
                                <ToolContent>
                                  <ToolInput input={part.input} />
                                  <ToolOutput
                                    part={part}
                                    network={message.metadata?.network}
                                  />
                                </ToolContent>
                              </Tool>
                              {uiResources.length > 0 && (
                                <div className="mt-4 space-y-4">
                                  {uiResources}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </MessageContent>
                  </Message>
                ))}
                {status === "submitted" && <Loader />}
                {status === "error" && <div>Something went wrong</div>}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>*/}
          </div>
        </div>

        {/* Real-time Brand Monitoring Section */}
        {/*<div className="mt-8 space-y-6">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold">
              Real-time Brand Monitoring
            </h2>
            <Badge variant="secondary" className="text-xs">
              Live Updates
            </Badge>
          </div>

          <Tabs defaultValue="brands" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="brands">Brands</TabsTrigger>
              <TabsTrigger value="urls">Brand URLs</TabsTrigger>
            </TabsList>
            <TabsContent value="brands" className="space-y-4">
              <div className="bg-card/50 backdrop-blur border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Discovered Brands</h3>
                  <Badge variant="outline" className="text-xs">
                    Real-time
                  </Badge>
                </div>
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center p-8 text-muted-foreground">
                      <div className="text-center space-y-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                        <p>Loading brands...</p>
                      </div>
                    </div>
                  }
                >
                  <BrandsTable />
                </Suspense>
              </div>
            </TabsContent>
            <TabsContent value="urls" className="space-y-4">
              <div className="bg-card/50 backdrop-blur border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Brand URLs</h3>
                  <Badge variant="outline" className="text-xs">
                    Live Progress
                  </Badge>
                </div>
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center p-8 text-muted-foreground">
                      <div className="text-center space-y-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                        <p>Loading URLs...</p>
                      </div>
                    </div>
                  }
                >
                  <BrandUrlsTable />
                </Suspense>
              </div>
            </TabsContent>
          </Tabs>
          </div>*/}
      </div>
    </div>
  );
}
