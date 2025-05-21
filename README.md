📄 DocuQuest
DocuQuest is an AI-powered academic research assistant that allows users to interact with their uploaded documents through a chat interface. Built using Next.js, it features OCR-based document analysis, authentication, dynamic dashboards, and real-time conversations.

🧠 Features
✍️ PDF & Image Upload with OCR Support

💬 Chat-based Interface for Document Interaction

🔐 Secure Authentication (OTP & NextAuth)

📊 User Dashboard with Analytics

📂 Source Panel to Manage Uploaded Documents

🚀 Tech Stack
Layer	Technology
Frontend	Next.js 14, React, Tailwind CSS
Backend	Next.js App Router (API Routes)
Auth	NextAuth.js, OTP Verification
Database	Supabase / Prisma ORM
OCR/AI Models	Integrated via APIs

📁 Project Structure
perl
Copy
Edit
src/
├── app/                    # Application routes and pages
│   ├── api/                # API endpoints (auth, files, chats)
│   ├── dashboard/          # Dashboard views and layout
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   └── verify_email/       # OTP verification UI
├── components/             # Reusable UI components
├── context/                # Global context providers
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── types/                  # TypeScript types
└── next-auth.d.ts          # NextAuth types extension
🛠️ Setup Instructions
Clone the repository:

bash
Copy
Edit
git clone https://github.com/yourusername/docuquest.git
cd docuquest
Install dependencies:

bash
Copy
Edit
npm install
Environment Setup:
Create a .env.local file and fill in the required environment variables:

env
Copy
Edit
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
DATABASE_URL=your-database-url
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
Run the application:

bash
Copy
Edit
npm run dev
📌 Deployment
You can deploy this project on:

Vercel (recommended for Next.js)

Render or Railway (for full-stack hosting)

Docker support can be added easily via Dockerfile and docker-compose.yml.

🙋‍♂️ Author
Vithjeshayan Sujanthan

Final Year Data Science Student @ NSBM | Plymouth University
