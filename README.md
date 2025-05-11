# ReLinkeder

ReLinkeder is an AI-powered platform designed to help professionals create engaging and personalized LinkedIn content. The application leverages advanced artificial intelligence to generate high-quality posts based on users' professional profiles, interests, and industry trends.

## Project Overview

ReLinkeder is built with the following technologies:
- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Next.js API Routes
- **Authentication**: Clerk
- **Database**: Neon (PostgreSQL)
- **AI Integration**: Multiple models including Cohere, OpenAI, Mistral, DeepSeek, and Gemini

## Live Demo

[Visit ReLinkeder](https://relinkeder.vercel.app)

## Features

### Core Functionality
- **AI-Generated LinkedIn Posts**: Create professional, engaging content with various AI models
- **Personalized Content**: Generate posts based on user profiles and reference links
- **Topic Generation**: AI suggests relevant topics based on industry trends and reference materials
- **Multiple AI Models**: Support for Cohere, OpenAI, Mistral, DeepSeek, and Gemini
- **Multi-language Support**: Generate content in various languages

### User Experience
- **Professional Profile Management**: Store career, interests, and goals
- **Reference Link Analysis**: Add links to articles and resources for better content relevance
- **Post Variations**: Get multiple content options with engagement predictions
- **Simple Sharing**: Share directly to LinkedIn or copy for scheduling

### Advanced Features
- **Chain of Thought**: Logical content development for more compelling posts
- **Topic Memory**: Avoids content repetition
- **Engagement Predictions**: Estimates post performance
- **Customization Options**: Adjust length, tone, and formality
- **Content Analytics**: Track post performance

## Screenshots

![Dashboard](https://i.imgur.com/Uvqbded.png)

![Profile Page](https://i.imgur.com/9L3BIKh.png)

## Authentication with Clerk

ReLinkeder uses Clerk for authentication and user management. Clerk provides a comprehensive solution that includes:

1. **User Authentication**: Secure sign-up and login processes
2. **Integration with Next.js**: Seamless integration with the Next.js framework
3. **User Management**: The application retrieves the current user with the `auth()` and `currentUser()` methods from Clerk
4. **Protected Routes**: Middleware ensures that certain routes are only accessible to authenticated users
5. **User Data Sync**: When a user registers through Clerk, their basic information is synced to the project's database:

```typescript
// When a user registers, their information is stored in the database
const { userId } = await auth()
const duser = await currentUser()
const first_name = duser?.fullName || duser?.firstName || duser?.lastName || duser?.emailAddresses[0].emailAddress.split("@")[0] || ""
const primaryEmail = duser?.emailAddresses[0].emailAddress || ""

await db.query(
  "INSERT INTO users (id, email, name) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING",
  [userId, primaryEmail, first_name]
);
```

6. **Authentication Checks**: API routes verify authentication before allowing access to sensitive operations:

```typescript
// Example of authentication check in an API route
const { userId } = await auth()

if (!userId) {
  return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
}
```

7. **Customized UI**: The login and registration pages use Clerk's components with custom styling to match the application's design.

## Getting Started

### Prerequisites
- Node.js
- API keys for the AI services you want to use (Cohere, OpenAI, Mistral, DeepSeek, or Gemini)
- Clerk account for authentication
- PostgreSQL database (Neon recommended)

### Installation

1. Clone the repository
```bash
git clone https://github.com/ArubikU/relinkeder.git
cd relinkeder
```

2. Install dependencies
```bash
npm install
# or
pnpm install
```

3. Set up environment variables
Create a `.env.local` file with the following variables:
```
# Database
DATABASE_URL=your_postgres_connection_string

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

4. Run the development server
```bash
npm run dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

[ArubikU](https://github.com/ArubikU)
