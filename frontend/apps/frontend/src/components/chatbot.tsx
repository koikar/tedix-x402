"use client";

import { useChat } from "@ai-sdk/react";
import {
  isUIResource,
  type UIActionResult,
  UIResourceRenderer,
} from "@mcp-ui/client";
import { useLiveQuery } from "@tanstack/react-db";
import { useQueryClient } from "@tanstack/react-query";
import { CopyIcon, Globe, GlobeIcon, RefreshCcwIcon } from "lucide-react";
import Image from "next/image";
import { Fragment, useMemo, useState } from "react";
import { Action, Actions } from "@/components/ai-elements/actions";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Response } from "@/components/ai-elements/response";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import { createBrandsCollection } from "@/lib/collections";
import type { Brand } from "@/utils/supabase/types";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "./ai-elements/tool";

const models = [
  {
    name: "GPT 4o",
    value: "openai/gpt-4o",
  },
  {
    name: "Deepseek R1",
    value: "deepseek/deepseek-r1",
  },
];

const ChatBot = () => {
  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>(models[0].value);
  const [selectedBrand, setSelectedBrand] = useState<Brand["id"]>();

  const [webSearch, setWebSearch] = useState(false);
  const { messages, sendMessage, status, regenerate } = useChat();

  // Get the queryClient and create the brands collection
  const queryClient = useQueryClient();
  const brandsCollection = createBrandsCollection(queryClient);

  // Use live query to get brands data
  const {
    data: brands = [],
    // isLoading,
    // isError,
  } = useLiveQuery((q) =>
    q.from({ brand: brandsCollection }).select(({ brand }) => ({
      id: brand.id,
      name: brand.name,
      logo_url: brand.logo_url,
      primary_domain: brand.primary_domain,
    })),
  );

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    sendMessage(
      {
        text: message.text || "Sent with attachments",
        files: message.files,
      },
      {
        body: {
          model: model,
          webSearch: webSearch,
          enableMCPUI: true, // Flag to enable MCP-UI tools
          brandId: selectedBrand, // Pass selected brand ID
        },
      },
    );
    setInput("");
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
            brandId: selectedBrand, // Pass selected brand ID
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
            brandId: selectedBrand, // Pass selected brand ID
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
    <div className="flex flex-col h-full">
      <Conversation className="flex-1 min-h-0">
        <ConversationContent className="h-full overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id}>
              {message.role === "assistant" &&
                message.parts.filter((part) => part.type === "source-url")
                  .length > 0 && (
                  <Sources>
                    <SourcesTrigger
                      count={
                        message.parts.filter(
                          (part) => part.type === "source-url",
                        ).length
                      }
                    />
                    {message.parts
                      .filter((part) => part.type === "source-url")
                      .map((part, i) => (
                        <SourcesContent key={`${message.id}-${i}`}>
                          <Source
                            key={`${message.id}-${i}`}
                            href={part.url}
                            title={part.url}
                          />
                        </SourcesContent>
                      ))}
                  </Sources>
                )}
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case "text":
                    return (
                      <Fragment key={`${message.id}-${i}`}>
                        <Message from={message.role}>
                          <MessageContent>
                            <Response>{part.text}</Response>
                          </MessageContent>
                        </Message>
                        {message.role === "assistant" &&
                          i === messages.length - 1 && (
                            <Actions className="mt-2">
                              <Action
                                onClick={() => regenerate()}
                                label="Retry"
                              >
                                <RefreshCcwIcon className="size-3" />
                              </Action>
                              <Action
                                onClick={() =>
                                  navigator.clipboard.writeText(part.text)
                                }
                                label="Copy"
                              >
                                <CopyIcon className="size-3" />
                              </Action>
                            </Actions>
                          )}
                      </Fragment>
                    );
                  case "reasoning":
                    return (
                      <Reasoning
                        key={`${message.id}-${i}`}
                        className="w-full"
                        isStreaming={
                          status === "streaming" &&
                          i === message.parts.length - 1 &&
                          message.id === messages.at(-1)?.id
                        }
                      >
                        <ReasoningTrigger />
                        <ReasoningContent>{part.text}</ReasoningContent>
                      </Reasoning>
                    );
                  case "dynamic-tool": {
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
                          <div className="mt-4 space-y-4">{uiResources}</div>
                        )}
                      </div>
                    );
                  }
                  default:
                    return null;
                }
              })}
            </div>
          ))}
          {status === "submitted" && <Loader />}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput
        onSubmit={handleSubmit}
        className="flex-shrink-0 border-t bg-background/95 backdrop-blur"
        globalDrop
        multiple
      >
        <PromptInputHeader>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
        </PromptInputHeader>
        <PromptInputBody>
          <PromptInputTextarea
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            <PromptInputButton
              variant={webSearch ? "default" : "ghost"}
              onClick={() => setWebSearch(!webSearch)}
            >
              <GlobeIcon size={16} />
              <span>Search</span>
            </PromptInputButton>
            <PromptInputSelect
              onValueChange={(value) => {
                setModel(value);
              }}
              value={model}
            >
              <PromptInputSelectTrigger>
                <PromptInputSelectValue />
              </PromptInputSelectTrigger>
              <PromptInputSelectContent>
                {models.map((model) => (
                  <PromptInputSelectItem key={model.value} value={model.value}>
                    {model.name}
                  </PromptInputSelectItem>
                ))}
              </PromptInputSelectContent>
            </PromptInputSelect>
            <PromptInputSelect
              onValueChange={(value) => {
                setSelectedBrand(value);
              }}
              value={selectedBrand}
            >
              <PromptInputSelectTrigger>
                <PromptInputSelectValue placeholder="Select brand context" />
              </PromptInputSelectTrigger>
              <PromptInputSelectContent>
                <PromptInputSelectItem value="global">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Global Search
                  </div>
                </PromptInputSelectItem>
                {brands.map((brand) => (
                  <PromptInputSelectItem key={brand.id} value={brand.id}>
                    <div className="flex items-center gap-2">
                      {brand.logo_url && (
                        <Image
                          src={brand.logo_url}
                          alt={`${brand.name} logo`}
                          className="w-4 h-4 object-contain"
                          width={16}
                          height={16}
                        />
                      )}
                      <span>{brand.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({brand.primary_domain})
                      </span>
                    </div>
                  </PromptInputSelectItem>
                ))}
              </PromptInputSelectContent>
            </PromptInputSelect>
          </PromptInputTools>
          <PromptInputSubmit disabled={!input && !status} status={status} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
};

export default ChatBot;
