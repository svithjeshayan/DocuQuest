"use client";

import { useState, useEffect } from "react";
import PdfChat from "@/components/pdf-chat";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, X } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { signOut } from "next-auth/react";
import '@/components/css/global.css';

type Chat = {
  id: string;
  name: string;
  createdAt: Date;
  messages: Message[];
  threadId?: string | null;
};

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

export default function Home() {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading chats, please wait...</p>
      </div>
    );
  }

  const [chats, setChats] = useState<Chat[]>([]);
  const [isChatLoaded, setIsChatLoaded] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showFileDeleteConfirm, setShowFileDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

  const fetchData = async () => {
  setIsLoading(true);
  try {
    const chatsResponse = await fetch("/api/chats", {
      headers: { "User-Id": user.id },
    });
    const chatsData = await chatsResponse.json();
    setChats(chatsData);
    setIsChatLoaded(true);

    const filesResponse = await fetch("/api/files", {
      headers: { "User-Id": user.id },
    });
    const filesData = await filesResponse.json();
    console.log("Fetched files:", filesData);
    // Deduplicate files by id to prevent duplicates
    const uniqueFiles = Array.from(
      new Map(filesData.map((file: FileData) => [file.id, file])).values()
    ) as FileData[];
    setUploadedFiles(uniqueFiles);

    // Set active chat after files are fetched to ensure Sources panel updates
    if (chatsData.length > 0 && !activeChat) {
      const firstChatId = chatsData[0].id;
      setActiveChat(firstChatId);
      // Ensure files are associated with the active chat
      setUploadedFiles((prev) =>
        prev.map((file) => ({
          ...file,
          chatId: file.chatId || firstChatId, // Assign chatId if missing
        }))
      );
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    setIsLoading(false);
  }
};

const getSelectedFiles = () => {
  const selectedFiles = uploadedFiles.filter(
    (file) => file.chatId === activeChat && file.selected
  );
  console.log("Selected files for activeChat", activeChat, selectedFiles);
  return selectedFiles;
};
    fetchData();
  }, [user]);

  useEffect(() => {
    if (chats.length === 0 && isChatLoaded) {
      createNewChat();
    }
  }, [chats, isChatLoaded]);

  const createNewChat = async () => {
    if (!user) return;

    const newChat = {
      id: Date.now().toString(),
      name: "New Chat",
      createdAt: new Date(),
      messages: [],
      threadId: null,
    };

    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Id": user.id,
        },
        body: JSON.stringify({
          name: newChat.name,
          userId: user.id,
          threadId: null,
        }),
      });

      const savedChat = await response.json();
      setChats((prev) => [...prev, savedChat]);
      setActiveChat(savedChat.id);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const deleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(id);
  };

  const confirmDeleteChat = async (id: string) => {
    try {
      await fetch(`/api/chats/${id}`, {
        method: "DELETE",
        headers: { "User-Id": user?.id || "" },
      });
      setChats((prev) => prev.filter((chat) => chat.id !== id));
      setUploadedFiles((prev) => prev.filter((file) => file.chatId !== id));
      if (activeChat === id && chats.length > 1) {
        setActiveChat(chats[0].id === id ? chats[1].id : chats[0].id);
      } else {
        setActiveChat(null);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const deleteFile = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFileDeleteConfirm(id);
  };

  const confirmDeleteFile = async (id: string) => {
    try {
      await fetch(`/api/files/${id}`, {
        method: "DELETE",
        headers: { "User-Id": user?.id || "" },
      });
      setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
    } catch (error) {
      console.error("Error deleting file:", error);
    } finally {
      setShowFileDeleteConfirm(null);
    }
  };

  const renameChat = async (id: string, newName: string) => {
    try {
      await fetch(`/api/chats/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Id": user?.id || "",
        },
        body: JSON.stringify({ name: newName }),
      });
      setChats((prev) =>
        prev.map((chat) => (chat.id === id ? { ...chat, name: newName } : chat))
      );
    } catch (error) {
      console.error("Error renaming chat:", error);
    }
  };

  const addMessageToChat = async (chatId: string, message: Message) => {
    if (!user) return;

    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Id": user.id,
        },
        body: JSON.stringify({
          chatId,
          message: message.content,
          msgBy: message.isUser ? "USER" : "SYSTEM",
          createdAt: message.timestamp,
        }),
      });
      setChats((prev) => {
        const updatedChats = prev.map((chat) =>
          chat.id === chatId ? { ...chat, messages: [...chat.messages, message] } : chat
        );
        console.log("Updated messages for chat", chatId, updatedChats.find((chat) => chat.id === chatId)?.messages);
        return updatedChats;
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const addUploadedFile = async (file: {
    id: string;
    name: string;
    type: string;
    content: string;
    url?: string;
  }) => {
    if (!user || !activeChat) return;

    // Check if a file with the same name and chatId already exists
    const existingFile = uploadedFiles.find((f) => f.name === file.name && f.chatId === activeChat);
    if (existingFile) {
      console.log(`File "${file.name}" already exists for chat ${activeChat}. Skipping upload.`);
      return;
    }

    try {
      const response = await fetch("/api/files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Id": user.id,
        },
        body: JSON.stringify({
          chatId: activeChat,
          name: file.name.substring(0, 20) + "...",
          type: file.type,
          content: file.content,
          url: file.url,
          selected: true,
        }),
      });
      const savedFile = await response.json();
      setUploadedFiles((prev) => [...prev, savedFile]);
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };

  const toggleFileSelection = async (id: string) => {
    try {
      await fetch(`/api/files/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Id": user?.id || "",
        },
        body: JSON.stringify({
          selected: !uploadedFiles.find((file) => file.id === id)?.selected,
        }),
      });
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === id ? { ...file, selected: !file.selected } : file
        )
      );
    } catch (error) {
      console.error("Error toggling file selection:", error);
    }
  };

  const fetchFiles = async (chatId: string): Promise<FileData[]> => {
    try {
      const response = await fetch(`/api/files?chatId=${chatId}`, {
        headers: { "User-Id": user?.id || "" },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }
      const filesData = await response.json();
      console.log(`Fetched files for chat ${chatId}:`, filesData);
      return filesData;
    } catch (error) {
      console.error(`Error fetching files for chat ${chatId}:`, error);
      return [];
    }
  };

  const getSelectedFiles = () => {
    const selectedFiles = uploadedFiles.filter((file) => file.selected && file.chatId === activeChat);
    console.log("Selected files for activeChat", activeChat, selectedFiles);
    return selectedFiles;
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading chats, please wait...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/5 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">DocuQuest</h1>
        </div>
        <div className="p-4">
          <Button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white transition-colors duration-200"
          >
            <PlusCircle size={16} />
            New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 ${
                activeChat === chat.id ? "bg-gray-100" : ""
              }`}
            >
              <div className="truncate">{chat.name}</div>
              <button
                onClick={(e) => deleteChat(chat.id, e)}
                className="text-gray-500 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Logout
          </Button>
        </div>
        {showDeleteConfirm && (
          <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 bg-white p-6 rounded-lg shadow-lg z-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            </div>
            <p className="mb-6">Are you sure you want to delete this chat? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                variant={"destructive"}
                onClick={() => confirmDeleteChat(showDeleteConfirm)}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="w-3/5 border-r border-gray-200" style={{ background: "#ededed" }}>
        {activeChat ? (
          <PdfChat
            key={activeChat}
            chatId={activeChat}
            chatName={chats.find((chat) => chat.id === activeChat)?.name || ""}
            messages={chats.find((chat) => chat.id === activeChat)?.messages || []}
            threadId={chats.find((chat) => chat.id === activeChat)?.threadId || null}
            onRename={(newName) => renameChat(activeChat, newName)}
            onFileUpload={addUploadedFile}
            onMessageAdd={(message) => addMessageToChat(activeChat, message)}
            onThreadIdUpdate={(chatId: string, threadId: string | null) => {
              setChats((prev) =>
                prev.map((chat) =>
                  chat.id === chatId ? { ...chat, threadId } : chat
                )
              );
            }}
            selectedFiles={getSelectedFiles()}
            onFetchFiles={fetchFiles}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No chat selected. Create a new chat to start.
          </div>
        )}
      </div>
      <div className="w-1/5 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Sources</h2>
        </div>
        <div className="p-4">
          <Button
            onClick={() => document.getElementById("fileUploadInput")?.click()}
            className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white"
          >
            Add Source
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {uploadedFiles.filter((file) => file.chatId === activeChat).length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              No sources added yet
            </div>
          ) : (
            <div className="space-y-3">
              {uploadedFiles
                .filter((file) => file.chatId === activeChat)
                .map((file) => (
                  <div key={file.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id={`file-${file.id}`}
                        checked={file.selected}
                        onChange={() => toggleFileSelection(file.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <label
                            htmlFor={`file-${file.id}`}
                            className="font-medium text-gray-800 cursor-pointer"
                          >
                            {file.name}
                          </label>
                          <button
                            onClick={(e) => deleteFile(file.id, e)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {file.type === "pdf" ? "PDF Document" : "Image"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
          {showFileDeleteConfirm && (
            <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 bg-white p-6 rounded-lg shadow-lg z-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Confirm Delete</h3>
                <button
                  onClick={() => setShowFileDeleteConfirm(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={16} />
              </button>
              </div>
              <p className="mb-6">Are you sure you want to delete this file? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFileDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white"
                  variant={"destructive"}
                  onClick={() => confirmDeleteFile(showFileDeleteConfirm)}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}