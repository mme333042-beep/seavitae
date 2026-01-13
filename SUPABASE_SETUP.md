# SeaVitae Supabase Backend Implementation

## Overview

This document describes the production backend implementation for SeaVitae using Supabase.

## Setup Instructions

### 1. Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Note down your project URL and API keys

### 2. Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run Database Migrations

In the Supabase SQL Editor, run the migration files in order:

1. `supabase/migrations/001_initial_schema.sql` - Creates all tables and functions
2. `supabase/migrations/002_row_level_security.sql` - Enables RLS policies

---

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `users` | Extends auth.users with role (jobseeker/employer) |
| `jobseekers` | Jobseeker profiles with visibility settings |
| `employers` | Employer profiles (individual or company) |
| `cvs` | CV metadata with lock status and versioning |
| `cv_sections` | Structured CV content (experience, education, skills, etc.) |
| `saved_cvs` | Immutable CV snapshots saved by employers |
| `messages` | Direct messages between users |
| `interviews` | Interview requests from employers to jobseekers |
| `invites` | Soft launch invite codes |

### Key Features

- **CV Locking**: CVs automatically lock when jobseeker visibility is ON
- **Immutable Snapshots**: saved_cvs entries cannot be updated (no UPDATE RLS policy)
- **Role-Based Access**: RLS policies enforce jobseeker/employer data separation
- **PDF Download Restriction**: Only jobseekers can download CVs (application-layer)

---

## Row Level Security

### Jobseekers
- Can read/write only their own profile and CV
- Can see who saved their CV (employer info only)

### Employers
- Can read only visible jobseeker profiles
- Can save CV snapshots (immutable)
- Cannot download CVs (application-layer restriction)
- Can send interview requests to visible jobseekers

### Saved CVs
- Immutable once created (no UPDATE policy)
- Employers can delete their own saved CVs
- Jobseekers can see who saved their CV

---

## Modified Files

### New Files Created

#### Supabase Infrastructure
- `lib/supabase/client.ts` - Browser client (anon key)
- `lib/supabase/server.ts` - Server client (cookies) + Admin client (service role)
- `lib/supabase/types.ts` - TypeScript types matching database schema
- `lib/supabase/auth.ts` - Authentication functions (signUp, signIn, signOut)
- `lib/supabase/index.ts` - Re-exports all supabase modules

#### Data Services
- `lib/supabase/services/jobseekers.ts` - Jobseeker & CV operations
- `lib/supabase/services/employers.ts` - Employer & saved CV operations
- `lib/supabase/services/messages.ts` - Messaging functions
- `lib/supabase/services/interviews.ts` - Interview request management
- `lib/supabase/services/invites.ts` - Invite code management
- `lib/supabase/services/index.ts` - Re-exports all services

#### Database Migrations
- `supabase/migrations/001_initial_schema.sql` - Full database schema
- `supabase/migrations/002_row_level_security.sql` - RLS policies

#### Configuration
- `.env.example` - Environment variable template

### Updated Files

#### Authentication Pages
- `app/login/page.tsx` - Now uses Supabase signIn
- `app/employer/company/create-account/page.tsx` - Uses Supabase signUp
- `app/employer/individual/create-account/page.tsx` - Uses Supabase signUp
- `app/employer/company/details/page.tsx` - Creates employer profile in Supabase

#### Dashboard Pages
- `app/employer/dashboard/page.tsx` - Loads real employer data, searches visible jobseekers
- `app/jobseeker/dashboard/page.tsx` - Loads real jobseeker/CV data, controls visibility
- `app/jobseeker/create-profile/page.tsx` - Saves to Supabase jobseekers + cv_sections

---

## Architecture Decisions

1. **Supabase Auth** - Handles all authentication, sessions stored in cookies
2. **Separate Tables** - jobseekers and employers are separate, linked to users by user_id
3. **Section-Based CVs** - CV content stored as JSONB in cv_sections table
4. **Immutable Snapshots** - saved_cvs has no UPDATE RLS policy
5. **Visibility Locking** - Database trigger syncs CV lock status with visibility
6. **Client + Server Clients** - anon client for browser, admin client for server-only operations

---

## Security Notes

1. **Never expose service role key** - Only used in server-side code
2. **RLS enforces data boundaries** - Even with valid session, users can only access permitted data
3. **PDF download** - Enforced at application layer (jobseeker-only)
4. **Invite codes** - Required during soft launch mode

---

## Testing

1. Create accounts for both employer and jobseeker
2. As jobseeker: Create CV, toggle visibility
3. As employer: Search for jobseekers, view CV, save CV
4. Verify CV lock when visibility is ON
5. Verify saved CV is immutable
