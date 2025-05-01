"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import Script from "next/script";
import { OpenAI } from "openai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare, Loader2, Edit2 } from "lucide-react";
import parse, { domToReact, Element } from "html-react-parser";
import sanitizeHtml from "sanitize-html"; 
import "@/components/css/global.css"; 

// Initialize OpenAI with the provided API key
// WARNING: Hardcoding API keys in client-side code is insecure. For production, move to server-side API routes.
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
};

type FileData = {
  id: string;
  name: string;
  type: string;
  content: string;
  url?: string;
  selected: boolean;
  chatId: string;
};

interface PdfChatProps {
  chatId: string;
  messages: Message[];
  chatName: string;
  threadId: string | null;
  onRename: (newName: string) => void;
  onFileUpload: (file: FileData) => void;
  onMessageAdd: (message: Message) => void;
  onThreadIdUpdate: (chatId: string, threadId: string | null) => void;
  selectedFiles: FileData[];
}

export default function PdfChat({
  chatId,
  messages: parentMessages,
  chatName,
  threadId: initialThreadId,
  onRename,
  onFileUpload,
  onMessageAdd,
  onThreadIdUpdate,
  selectedFiles,
}: PdfChatProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>(parentMessages);
  const [threadId, setThreadId] = useState<string | null>(initialThreadId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [typewriterMessages, setTypewriterMessages] = useState<Map<string, string>>(new Map());
  const [assistantId, setAssistantId] = useState<string>("asst_jWYrduIi2q9am5ho6TJxric0"); // Default to general chat
  const [chatType, setChatType] = useState<string>("general");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (assistantId === "asst_jWYrduIi2q9am5ho6TJxric0") {
      setChatType("general");
    } else if (assistantId === "asst_esfTILv1Q0BeKYWQIPLJf92p") {
      setChatType("qa");
    }
  }, [assistantId]);

  const typewriterEffect = (messageId: string, content: string) => {
    const words = content.split(' ');  // Split the content into words
    let index = 0;

    const intervalId = setInterval(() => {
        setTypewriterMessages((prev) => {
            const newContent = prev.get(messageId) || "";
            if (index < words.length) {
                // Add a new word with the fade-in class
                const wordWithFadeIn = `<span class="fade-word">${words[index]}</span>`;
                return new Map(prev).set(messageId, newContent + (newContent ? ' ' : '') + wordWithFadeIn);
            } else {
                clearInterval(intervalId);
                return prev;
            }
        });
        index += 1;
    }, 50); // Adjust the speed here (50ms between each word)
};




  // Sync local messages with parent messages
  useEffect(() => {
    setLocalMessages(parentMessages);
  }, [parentMessages]);

  // Update threadId when initialThreadId changes (e.g., when switching chats)
  useEffect(() => {
    setThreadId(initialThreadId);
  }, [initialThreadId]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  // Focus rename input when editing
  useEffect(() => {
    if (isRenaming) {
      renameInputRef.current?.focus();
    }
  }, [isRenaming]);

  // Detect changes in selectedFiles (checked/unchecked)
  const prevSelectedFilesRef = useRef<FileData[]>([]);
  useEffect(() => {
    const hasSelectionChanged = () => {
      const prevFiles = prevSelectedFilesRef.current;
      const currFiles = selectedFiles;
      if (prevFiles.length !== currFiles.length) return true;
      return prevFiles.some((prevFile, index) => {
        const currFile = currFiles[index];
        return prevFile.id !== currFile.id || prevFile.selected !== currFile.selected;
      });
    };

    if (hasSelectionChanged() && selectedFiles.length > 0 && !threadId) {
      createThreadIfNeeded();
    }
    prevSelectedFilesRef.current = selectedFiles;
  }, [selectedFiles, threadId]);

  const saveThreadId = async (newThreadId: string | null) => {
    try {
      await fetch(`/api/chats/${chatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Id": localStorage.getItem("userId") || "", // Adjust based on your user context
        },
        body: JSON.stringify({ threadId: newThreadId }),
      });
      onThreadIdUpdate(chatId, newThreadId);
    } catch (error) {
      console.error("Error saving thread ID:", error);
    }
  };

  const createThreadIfNeeded = async () => {
    if (!threadId) {
      try {
        const thread = await openai.beta.threads.create();
        setThreadId(thread.id);
        await saveThreadId(thread.id);
        return thread.id;
      } catch (error) {
        console.error("Error creating thread:", error);
        setError("Failed to initialize chat. Please try again.");
        throw error;
      }
    }
    return threadId;
  };

  const toggleAssistant = async () => {
    const newAssistantId = assistantId === "asst_jWYrduIi2q9am5ho6TJxric0" 
      ? "asst_esfTILv1Q0BeKYWQIPLJf92p" 
      : "asst_jWYrduIi2q9am5ho6TJxric0";
    setAssistantId(newAssistantId);
    setIsLoading(true); // Show spinner in send button
    setError(null);

    try {
      const currentThreadId = await createThreadIfNeeded(); // Reuse or create thread

      const defaultMessageContent = newAssistantId === "asst_jWYrduIi2q9am5ho6TJxric0"
        ? "Welcome to General Chat! How can I assist you today?"
        : "Start asking questions about the uploaded documents.";

      if (newAssistantId === "asst_jWYrduIi2q9am5ho6TJxric0") {
        // General Assistant: Add default message directly
        const defaultMessage: Message = {
          id: Date.now().toString(),
          content: defaultMessageContent,
          isUser: false,
          timestamp: new Date(),
        };

        setLocalMessages([defaultMessage]);
        onMessageAdd(defaultMessage);

        // Add to OpenAI thread for consistency
        await openai.beta.threads.messages.create(currentThreadId, {
          role: "assistant",
          content: defaultMessageContent,
        });
      } else {
        // Q&A Assistant: Send user message with selected file content and run assistant
        let messageContent = defaultMessageContent;
        if (selectedFiles.length > 0) {
          messageContent += "\n\nReference the following content:\n\n";
          selectedFiles.forEach((file) => {
            messageContent += `--- ${file.name} ---\n${file.content.substring(0, 5000)}\n\n`;
          });
        } else {
          messageContent += "\n\nNo documents are currently selected.";
        }

        await openai.beta.threads.messages.create(currentThreadId, {
          role: "user",
          content: messageContent,
        });

        // Create a run to prompt the assistant to respond
        const run = await openai.beta.threads.runs.create(currentThreadId, {
          assistant_id: newAssistantId,
        });

        // Wait for the run to complete
        let runStatus = await openai.beta.threads.runs.retrieve(currentThreadId, run.id);
        while (runStatus.status !== "completed") {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          runStatus = await openai.beta.threads.runs.retrieve(currentThreadId, run.id);
        }

        // Fetch the assistant's response
        const threadMessages = await openai.beta.threads.messages.list(currentThreadId);
        const assistantMessage = threadMessages.data.find((msg) => msg.role === "assistant");

        if (assistantMessage && assistantMessage.content[0].type === "text") {
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: assistantMessage.content[0].text.value,
            isUser: false,
            timestamp: new Date(),
          };
          typewriterEffect(aiResponse.id, aiResponse.content);
          setLocalMessages([aiResponse]);
          onMessageAdd(aiResponse);
        } else {
          // Fallback: Show the default user message
          const fallbackMessage: Message = {
            id: Date.now().toString(),
            content: defaultMessageContent,
            isUser: true,
            timestamp: new Date(),
          };
          setLocalMessages([fallbackMessage]);
          onMessageAdd(fallbackMessage);
          setError("No response from Q&A Assistant. You can start asking questions.");
        }
      }
    } catch (error) {
      console.error("Error sending default message:", error);
      setError("Failed to initialize new chat. Please try again.");
    } finally {
      setIsLoading(false); // Hide spinner
    }
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = async (event) => {
        try {
          const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);
          if (!(window as any).pdfjsLib) {
            throw new Error("PDF.js not loaded");
          }
          const loadingTask = (window as any).pdfjsLib.getDocument(typedArray);
          const pdf = await loadingTask.promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent({
              normalizeWhitespace: true,
              disableCombineTextItems: false,
            });
            const pageText = textContent.items
              .map((item: any) => (item.hasEOL ? item.str + "\n" : item.str + " "))
              .join("")
              .replace(/\s+/g, " ")
              .trim();
            fullText += pageText + "\n\n";
          }
          if (!fullText.trim()) {
            throw new Error("No text could be extracted from the PDF");
          }
          resolve(fullText);
        } catch (error) {
          reject("Failed to extract text from PDF");
        }
      };
      fileReader.onerror = () => reject("Error reading file");
      fileReader.readAsArrayBuffer(file);
    });
  };

  const processImageFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject("Failed to process image");
        }
      };
      reader.onerror = () => reject("Error reading file");
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      let fileData: FileData;
      const currentThreadId = await createThreadIfNeeded();

      if (file.type === "application/pdf") {
        const extractedText = await extractTextFromPdf(file);
        fileData = {
          id: Date.now().toString(),
          name: file.name,
          type: "pdf",
          content: extractedText,
          selected: true,
          chatId: chatId,
        };
        onFileUpload(fileData);
        await openai.beta.threads.messages.create(currentThreadId, {
          role: "user",
          content: `I've uploaded a PDF named "${file.name}". Here's the content: ${extractedText.substring(0, 1000)}...`,
        });
      } else if (file.type.startsWith("image/")) {
        const imageData = await processImageFile(file);
        fileData = {
          id: Date.now().toString(),
          name: file.name,
          type: "image",
          content: "Image uploaded",
          url: imageData,
          selected: true,
          chatId: chatId,
        };
        onFileUpload(fileData);
        await openai.beta.threads.messages.create(currentThreadId, {
          role: "user",
          content: `I've uploaded an image named "${file.name}". Please analyze it.`,
        });
      } else {
        throw new Error("Unsupported file type");
      }

      if (localMessages.length === 0) {
        onRename(file.name.substring(0, 20) + "...");
      }

      await openai.beta.threads.messages.create(currentThreadId, {
        role: "user",
        content: `${
          chatType === "general" ? "concise summary in 2 sentence, format in html, " : "Start Ask Question"
        }\n\nReference the following content:\n\n--- ${fileData.name} ---\n${fileData.content.substring(0, 5000)}\n\n`,
      });

      const run = await openai.beta.threads.runs.create(currentThreadId, {
        assistant_id: assistantId,
      });

      let runStatus = await openai.beta.threads.runs.retrieve(currentThreadId, run.id);
      while (runStatus.status !== "completed") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(currentThreadId, run.id);
      }

      const threadMessages = await openai.beta.threads.messages.list(currentThreadId);
      const assistantMessage = threadMessages.data.find((msg) => msg.role === "assistant");

      if (assistantMessage && assistantMessage.content[0].type === "text") {
        let aiResponseContent = assistantMessage.content[0].text.value
          .replace(/`/g, "")
          .replace(/html/gi, "");

        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponseContent,
          isUser: false,
          timestamp: new Date(),
        };

        typewriterEffect(aiResponse.id, aiResponseContent);
        setLocalMessages((prev) => [...prev, aiResponse]);
        onMessageAdd(aiResponse);
      } else {
        setError("No response from Assistant.");
      }
    } catch (error) {
      setError(`Error processing ${file.type === "application/pdf" ? "PDF" : "image"}: ${error instanceof Error ? error.message : "Unknown error"}`);
      console.error("Error processing file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString() + "user",
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setLocalMessages((prev) => [...prev, userMessage]);
    onMessageAdd(userMessage);
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    try {
      const currentThreadId = await createThreadIfNeeded();

      let messageContent = inputMessage;
      if (selectedFiles.length > 0) {
        messageContent += "\n\nReference the following content to answer my question:\n\n";
        selectedFiles.forEach((file) => {
          messageContent += `--- ${file.name} ---\n${file.content.substring(0, 5000)}\n\n`;
        });
      } else {
        messageContent += "\n\nNo documents are selected. Please provide an answer based on general knowledge or indicate if specific information is required.";
      }

      await openai.beta.threads.messages.create(currentThreadId, {
        role: "user",
        content: messageContent,
      });

      const run = await openai.beta.threads.runs.create(currentThreadId, {
        assistant_id: assistantId,
      });

      let runStatus = await openai.beta.threads.runs.retrieve(currentThreadId, run.id);
      while (runStatus.status !== "completed") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(currentThreadId, run.id);
      }

      const threadMessages = await openai.beta.threads.messages.list(currentThreadId);
      const assistantMessage = threadMessages.data.find((msg) => msg.role === "assistant");

      if (assistantMessage && assistantMessage.content[0].type === "text") {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: assistantMessage.content[0].text.value,
          isUser: false,
          timestamp: new Date(),
        };
        typewriterEffect(aiResponse.id, aiResponse.content);
        setLocalMessages((prev) => [...prev, aiResponse]);
        onMessageAdd(aiResponse);
      } else {
        setError("No response from Assistant.");
      }
    } catch (error) {
      setError("Error communicating with AI. Please try again.");
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChatName.trim()) {
      onRename(newChatName);
    }
    setIsRenaming(false);
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      console.error("Invalid date:", date);
      return "Invalid Time";
    }
    return dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessageContent = (content: string) => {
    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: ["div", "h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "li", "b", "i", "strong", "em", "br"],
      allowedAttributes: {
        "*": ["class", "style"],
      },
    });

    return parse(sanitizedContent, {
      replace: (domNode) => {
        if (domNode instanceof Element && domNode.name === "p") {
          const nextSibling = domNode.next;
          const isLastP = !nextSibling || (nextSibling instanceof Element && nextSibling.name !== "p");
          return (
            <>
              {domToReact([domNode])}
              {!isLastP && <div style={{ height: "12px" }} />}
            </>
          );
        }
        return undefined;
      },
    });
  };

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        onLoad={() => {
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        }}
      />
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {isRenaming ? (
              <form onSubmit={handleRenameSubmit} className="flex items-center gap-2">
                <Input
                  ref={renameInputRef}
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  className="h-8 w-48"
                  placeholder="Enter chat name"
                />
                <Button type="submit" size="sm" variant="ghost">
                  Save
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setIsRenaming(false)}>
                  Cancel
                </Button>
              </form>
            ) : (
              <>
                <MessageSquare className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-medium">{chatName}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-6 w-6"
                  onClick={() => {
                    setNewChatName(chatName);
                    setIsRenaming(true);
                  }}
                >
                  <Edit2 className="h-4 w-4 text-gray-500" />
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAssistant}
              disabled={isLoading}
            >
              {assistantId === "asst_jWYrduIi2q9am5ho6TJxric0" ? "Switch to Q&A Chat" : "Switch to General Chat"}
            </Button>
            <input
              id="fileUploadInput"
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="application/pdf,image/*"
              onChange={handleFileUpload}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {localMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No messages yet</p>
                <p className="text-sm mt-2">Upload a file from the Sources panel or start a new conversation</p>
              </div>
            </div>
          ) : (
            localMessages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser ? "bg-black text-white" : "bg-white text-gray-800"
                  }`}
                >
                  <div className={`mb-1`}>
                    {message.isUser ? message.content : renderMessageContent(typewriterMessages.get(message.id) || message.content)}
                  </div>
                  <div className={`text-xs ${message.isUser ? "text-blue-200" : "text-gray-500"} text-right`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        {error && <div className="p-3 mx-4 mb-2 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
        <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              selectedFiles.length > 0
                ? `Ask about ${selectedFiles.map((f) => f.name).join(", ")}...`
                : "Type your message..."
            }
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="bg-black hover:bg-gray-900 text-white"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </>
  );
}