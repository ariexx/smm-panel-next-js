# SMM Panel

A Social Media Marketing Panel built with Next.js 15 and Supabase.

## Overview

This SMM Panel is a modern web application that provides social media marketing services. It is built with the latest technologies including Next.js 15 and Supabase for backend services and authentication.

## 🔧 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Supabase (PostgreSQL, Authentication)
- **Form Handling**: React Hook Form, Zod validation
- **Deployment**: Compatible with Vercel, Netlify, or any Next.js-supported hosting

## 📋 Prerequisites

Before getting started, make sure you have the following installed:

- Node.js (v18 or higher)
- npm, yarn, or pnpm (this project uses pnpm by default)
- Git

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd SMM-Panel
```

### 2. Install dependencies

```bash
pnpm install
# or
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# PostgreSQL Configuration (if needed directly)
POSTGRES_URL=your_postgres_connection_string
POSTGRES_PRISMA_URL=your_postgres_prisma_connection_string
POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_connection_string
POSTGRES_HOST=your_postgres_host
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database
```

### 4. Set up Supabase

1. Create a Supabase account at [supabase.com](https://supabase.com/) if you don't have one
2. Create a new Supabase project
3. Go to the SQL editor in your Supabase dashboard
4. Run the SQL commands from `supabase/schema.sql` to set up your database schema
5. Run the SQL commands from `supabase/seed.sql` to populate initial data (if needed)

### 5. Run the development server

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📖 Scripts

- `pnpm dev` - Start the development server with Turbopack
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint to check for code issues

## 🏗️ Project Structure

```
SMM Panel/
├── app/           # Next.js application routes and pages
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and shared code
├── public/        # Static assets
├── styles/        # Global styles
├── supabase/      # Supabase configuration and migrations
├── .env.local     # Environment variables (not tracked in git)
├── next.config.mjs # Next.js configuration
└── package.json   # Project dependencies and scripts
```

## 🤝 Contributing

We welcome contributions to improve the SMM Panel! Here's how you can contribute:

### Setup for contributing

1. Fork the repository
2. Create a new branch for your feature or bugfix: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run the linter to ensure code quality: `pnpm lint`
5. Commit your changes with a descriptive message
6. Push your branch to your fork: `git push origin feature/your-feature-name`
7. Create a Pull Request to the main repository

### Contribution Guidelines

- Follow the existing code style and conventions
- Add appropriate tests for your changes when possible
- Update documentation to reflect your changes
- Make sure your code passes all existing tests and linting

### Feature Requests and Bug Reports

If you find a bug or have a feature request, please create an issue in the repository with a clear description of the problem or suggestion.

## 📄 License

[MIT License](LICENSE)

## 📞 Support

If you need help or have questions, please create an issue in the repository.

---

Thank you for using and contributing to the SMM Panel! We hope it serves your social media marketing needs well.