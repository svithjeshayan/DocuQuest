"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Script from "next/script"
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAPI_KEY,
  dangerouslyAllowBrowser: true
});

// Bootstrap icons as React components
const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    fill="currentColor"
    className="bi bi-cloud-upload"
    viewBox="0 0 16 16"
  >
    <path
      fillRule="evenodd"
      d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 0-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z"
    />
    <path
      fillRule="evenodd"
      d="M7.646 4.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V14.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3z"
    />
  </svg>
)

const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    className="bi bi-send"
    viewBox="0 0 16 16"
  >
    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
  </svg>
)

const FileTextIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    className="bi bi-file-earmark-text"
    viewBox="0 0 16 16"
  >
    <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z" />
    <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
  </svg>
)

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    className="bi bi-x"
    viewBox="0 0 16 16"
  >
    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
  </svg>
)

type Message = {
  id: string
  content: string
  isUser: boolean
}

export default function PdfChat() {
  const [pdfUploaded, setPdfUploaded] = useState(false)
  const [pdfName, setPdfName] = useState("")
  const [pdfText, setPdfText] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [threadId, setThreadId] = useState(process.env.THREAD_ID)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load PDF.js script
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const extractTextFromPdf = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
  
      fileReader.onload = async (event) => {
        try {
          const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);
          if (!(window as any).pdfjsLib) {
            setTimeout(() => {
              extractTextFromPdf(file).then(resolve).catch(reject);
            }, 1000);
            return;
          }
  
          const loadingTask = (window as any).pdfjsLib.getDocument(typedArray);
          const pdf = await loadingTask.promise;
  
          let fullText = "";
  
          // Extract text from all pages
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
  
            // Use `getTextContent` with options to improve text extraction
            const textContent = await page.getTextContent({
              normalizeWhitespace: true, // Normalize whitespace
              disableCombineTextItems: false, // Combine text items into logical chunks
            });
  
            // Reconstruct text with proper line breaks and formatting
            const pageText = textContent.items
              .map((item: any) => {
                // Handle line breaks and spaces
                if (item.hasEOL) {
                  return item.str + "\n"; // Add a newline for end-of-line items
                }
                return item.str + " "; // Add a space between words
              })
              .join("")
              .replace(/\s+/g, " ") // Normalize multiple spaces
              .trim();
  
            fullText += pageText + "\n\n"; // Add a paragraph break between pages
          }
  
          resolve(fullText);
        } catch (error) {
          console.error("Error extracting text from PDF:", error);
          reject("Failed to extract text from PDF");
        }
      };
  
      fileReader.onerror = () => {
        reject("Error reading file");
      };
  
      fileReader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && file.type.startsWith("image/")) {
        setIsLoading(true);
        setPdfName(file.name);

        try {
            // Convert image to base64
            const base64Image = await convertImageToBase64(file);

            // Send image to backend API
            const response = await fetch("/api/analyze-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ base64Image }),
            });

            if (!response.ok) {
                throw new Error(`Error uploading image: ${response.statusText}`);
            }

            const data = await response.json();

           
            const thread = await openai.beta.threads.create();
             await openai.beta.threads.messages.create(thread.id, {
                role: "user",
                content: data.description,
              });
        
              // Store the thread ID in state for follow-up interactions
              setThreadId(thread.id);


            // Update chat messages with the description
           

            setPdfUploaded(true);
        } catch (error) {
            console.error("Error processing image:", error);
            alert("Error processing image. Please try again.");
        } finally {
            setIsLoading(false);
        }
    } else {
        alert("Please upload a valid image file (JPG, PNG, or JPEG).");
    }
};

// Convert image to base64
const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type === "application/pdf") {
      setIsLoading(true)
      setPdfName(file.name)

      try {
        const extractedText = await extractTextFromPdf(file)
        setPdfText(extractedText)

        // Create first message with the extracted text
        const firstMessage: Message = {
          id: Date.now().toString(),
          content: `What would you like to know about it?`,
          isUser: false,
        }

        // Log the first message to console
        console.log("First message:", firstMessage)

        // Set the message in the chat
        setMessages([firstMessage])
        setPdfUploaded(true)
      } catch (error) {
        console.error("Error processing PDF:", error)
        alert("Error processing PDF. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !threadId) return;
  
    // Add user message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
  
    try {
      // Send the user's message to the OpenAI Assistant thread
      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: inputMessage,
      });
  
      // Create a run to get the Assistant's response
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: process.env.ASSISTANT_ID, // Replace with your Assistant ID
      });
  
      // Poll for the run's completion
      let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      while (runStatus.status !== "completed") {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
        runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      }
  
      // Retrieve the Assistant's response
      const messages = await openai.beta.threads.messages.list(threadId);
      const assistantMessage = messages.data.find(
        (msg) => msg.role === "assistant"
      );
  
      if (assistantMessage) {
        // Find the text content in the assistant's message
        const textContent = assistantMessage.content.find(
          (content) => content.type === "text"
        );
  
        if (textContent && textContent.type === "text") {
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: textContent.text.value, // Access the text value
            isUser: false,
          };
          setMessages((prev) => [...prev, aiResponse]);
        } else {
          console.error("No text content found in the assistant's message.");
        }
      }
    } catch (error) {
      console.error("Error sending message to OpenAI:", error);
      alert("Error communicating with OpenAI. Please try again.");
    }
  };

  const resetUpload = () => {
    setPdfUploaded(false)
    setPdfName("")
    setPdfText("")
    setMessages([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (!pdfUploaded) {
    return (
      <>
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" />

        <div className="container">
          <div className="card mx-auto" style={{ maxWidth: "600px" }}>
            <div className="card-body">
              {isLoading ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Extracting text from Image...</p>
                </div>
              ) : (
                <div
                  className="border-dashed rounded p-5 text-center"
                  style={{ cursor: "pointer" }}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="d-none"
                    accept="application/jpeg"
                    onChange={handleFileUpload}
                  />
                  <div className="mb-3 text-secondary">
                    <UploadIcon />
                  </div>
                  <h5 className="mb-2">Upload a Image</h5>
                  <p className="text-muted small">Drag and drop or click to upload</p>
                  <button className="btn btn-primary mt-2">Select Image</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" />

      <div className="container">
        <div className="card mx-auto" style={{ maxWidth: "600px", height: "600px" }}>
          <div className="card-header d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FileTextIcon />
              <span className="ms-2 fw-medium text-truncate" style={{ maxWidth: "200px" }}>
                {pdfName}
              </span>
            </div>
            <button className="btn btn-sm btn-outline-secondary" onClick={resetUpload}>
              <CloseIcon />
            </button>
          </div>

          <div className="card-body overflow-auto" style={{ height: "500px" }}>
            <div className="d-flex flex-column gap-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`d-flex ${message.isUser ? "justify-content-end" : "justify-content-start"}`}
                >
                  <div
                    className={`p-3 rounded-3 ${message.isUser ? "bg-primary text-white" : "bg-light text-dark"}`}
                    style={{ maxWidth: "80%", whiteSpace: "pre-line" }}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-footer">
            <form onSubmit={handleSendMessage} className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask a question about the PDF..."
              />
              <button type="submit" className="btn btn-primary">
                <SendIcon />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

