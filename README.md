# PennyWise - Personal Finance App

PennyWise is a personal finance management application that helps users track their spending, manage budgets, and take control of their financial life.

## Authentication Implementation with Supabase

This project implements a complete authentication flow using Supabase Auth, Redux Toolkit, and React Router.

### Features

- User registration with email verification
- Login with email and password
- Session persistence using Supabase Auth
- Protected routes with React Router
- Responsive UI with Material-UI
- Dark/Light theme switch
- Form validation with Zod

### Authentication Flow

1. **Registration Process**:
   - User fills out the registration form
   - Client-side validation using Zod
   - Form submission to Supabase Auth
   - Email verification sent to user
   - Redirect to login with success message

2. **Login Process**:
   - User enters email and password
   - Client-side validation using Zod
   - Authentication with Supabase Auth
   - JWT token stored in browser (managed by Supabase)
   - Redux state updated with user and session information
   - Redirect to protected dashboard

3. **Session Management**:
   - On app load, check for existing session
   - Auto-login if valid session exists
   - Protected routes restrict access to authenticated users
   - Public routes redirect to dashboard if already logged in

4. **Logout Process**:
   - User clicks logout button
   - Supabase Auth signs out the user
   - Redux state cleared
   - Redirect to login page

## Project Structure

```
src/
├── components/
│   └── layout/
│       ├── AppLayout.tsx       # Main application layout
│       └── ThemeSwitcher.tsx   # Theme toggle component
├── hooks/
│   └── index.ts                # Custom Redux hooks
├── pages/
│   ├── auth/
│   │   ├── Login.tsx           # Login page
│   │   └── Register.tsx        # Registration page
│   └── dashboard/
│       └── Dashboard.tsx       # User dashboard
├── routes/
│   ├── index.tsx               # Main routing configuration
│   ├── ProtectedRoute.tsx      # Auth-required route wrapper
│   └── PublicRoute.tsx         # Public route wrapper
├── services/
│   ├── api.ts                  # API service for backend calls
│   └── supabase.ts             # Supabase client setup
├── store/
│   ├── index.ts                # Redux store configuration
│   └── slices/
│       ├── authSlice.ts        # Auth state management
│       └── themeSlice.ts       # Theme state management
├── theme/
│   └── theme.ts                # Theme configuration
├── App.tsx                     # Main app component
└── main.tsx                    # App entry point
```

## Setting Up Supabase

To set up Supabase for this project:

1. Create a Supabase account and project at [supabase.com](https://supabase.com)

2. Enable Email Auth in Authentication settings:
   - Go to Authentication > Providers
   - Enable Email provider
   - Configure email templates for verification

3. Create `.env` file in the project root:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Create a user profile table in your Supabase database:

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);
```

## Running the Project

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Future Enhancements

- Social login (Google, GitHub, etc.)
- Password reset functionality
- Email verification reminder
- User profile management
- Multi-factor authentication
- Role-based authorization

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.