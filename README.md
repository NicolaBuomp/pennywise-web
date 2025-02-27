# Pennywise - Frontend

## Overview
Pennywise is a web application that helps users manage shared expenses and shopping lists within groups. This repository contains the frontend of the application, built with React, TypeScript, and integrated with Supabase for authentication.

## Features
- **User Authentication**: Sign up, login, email verification, and OAuth (Google)
- **Group Management**: Create and join expense sharing groups
- **Expense Tracking**: Record, split, and settle shared expenses
- **Shopping Lists**: Collaborative shopping lists that update in real-time
- **Profile Management**: Customize user profiles with avatar upload
- **Dark/Light Theme**: Support for different color themes
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack
- **Framework**: React with TypeScript
- **State Management**: Redux Toolkit with Redux Persist
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **HTTP Client**: Axios
- **Build Tool**: Vite

## Project Structure
```
src/
├── App.tsx                 # Main application component
├── main.tsx                # Application entry point
├── index.css               # Global styles
├── vite-env.d.ts           # Vite type definitions
├── components/             # Reusable UI components
│   ├── auth/               # Authentication components
│   └── layout/             # Layout components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
│   ├── api.ts              # API client
│   └── supabase.ts         # Supabase client
├── pages/                  # Page components
│   ├── auth/               # Authentication pages
│   ├── Dashboard.tsx       # Main dashboard
│   ├── Login.tsx           # Login page
│   ├── Register.tsx        # Registration page
│   ├── Profile.tsx         # User profile page
│   └── NotFound.tsx        # 404 page
├── store/                  # Redux store
│   ├── store.ts            # Store configuration
│   ├── auth/               # Auth slice
│   ├── groups/             # Groups slice
│   ├── shoppingLists/      # Shopping lists slice
│   ├── expenses/           # Expenses slice
│   └── profile/            # Profile slice
├── styles/                 # Additional styles
│   └── animations.css      # CSS animations
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## Authentication Flow
The application uses Supabase for authentication with the following features:
- Email/password authentication with email verification
- OAuth authentication with Google
- Session management and token refresh
- Secure authentication state persistence

## State Management
Redux Toolkit is used for state management with the following slices:
- `auth`: User authentication state
- `profile`: User profile information
- `groups`: User groups and memberships
- `shoppingLists`: Shopping lists and items
- `expenses`: Expense tracking and balances

## Routes
- `/` - Home page (redirects to dashboard if authenticated)
- `/login` - User login
- `/register` - User registration
- `/auth/callback` - OAuth and email verification callback
- `/email-verification` - Email verification page
- `/email-confirmed` - Email confirmation success page
- `/verify-email-manual` - Manual email verification
- `/dashboard` - Main application dashboard
- `/profile` - User profile management
- `/groups` - Group management
- `/groups/:groupId` - Group details

## Setup Instructions

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- Supabase account and project

### Environment Variables
Create a `.env.local` file with the following variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=http://localhost:3000/api
```

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production
```bash
npm run build
```

The built files will be in the `dist` directory and can be served by any static file server.

## Key Components

### Authentication Components
- `Login.tsx`: Handles user login with email/password and Google OAuth
- `Register.tsx`: User registration form
- `EmailVerification.tsx`: Email verification flow
- `AuthCallback.tsx`: Handles OAuth and email verification callbacks
- `ProtectedRoute.tsx`: Route guard for authenticated routes

### Layout Components
- `MainLayout.tsx`: Main application layout with navigation
- `Navbar.tsx`: Top navigation bar
- `Sidebar.tsx`: Side navigation menu

### Core Features
- **Group Management**: Create, join, and manage expense sharing groups
- **Expense Tracking**: Record expenses, split costs, and track balances
- **Shopping Lists**: Create and manage collaborative shopping lists
- **Profile Management**: Update user profile and upload avatar

## Theming
The application supports light and dark themes using CSS variables and Tailwind CSS. Theme settings are stored in the user profile.

## API Integration
The frontend communicates with the backend API using Axios. API requests include authentication tokens from Supabase, and the API client handles token refresh when needed.

## Error Handling
- API errors are captured and displayed to the user
- Form validation provides immediate feedback
- Authentication errors include helpful messages
- Network issues are handled gracefully

## Deployment
The application can be deployed to any static hosting service:

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `dist` directory to your hosting service of choice (Netlify, Vercel, Firebase, etc.)

3. Configure your hosting service to handle client-side routing by redirecting all requests to `index.html`

## Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License
This project is licensed under the MIT License.