# Gyan Bharti School Management System - Setup Guide

## Overview
Production-style school management system with role-based authentication, file uploads, and rich animations.

## Stack
- **Frontend**: React + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Supabase (Lovable Cloud)
- **Storage**: Supabase Storage
- **Email**: Edge Functions (ready for Resend/SendGrid integration)

## Database Setup

### 1. Run Migration
Approve and run the pending database migration to create:
- `approvals` table (role approval requests)
- `submissions` table (student file uploads)
- `notices` table (school announcements)
- `events` table (school events)
- `gallery_items` table (public gallery)

The migration includes:
- Row Level Security (RLS) policies for all tables
- Indexes for performance
- `updated_at` triggers
- Proper foreign key relationships

### 2. Storage Bucket
The `student-portfolios` bucket already exists. Ensure it has:
- Public read access for approved submissions
- Insert/update access only for authenticated students
- Admin access for all operations

### 3. Owner Setup
The system owner is: **ashu1592125@gmail.com**

To set yourself as owner:
1. Sign up with this email
2. Manually add owner role in backend:
   ```sql
   INSERT INTO user_roles (user_id, role) 
   VALUES ((SELECT id FROM auth.users WHERE email = 'ashu1592125@gmail.com'), 'owner');
   ```

## Routes

### Public Routes
- `/` - Home page with admission and login buttons
- `/visitor` - Public information portal
- `/about`, `/admissions`, `/academics` - Standard pages
- `/notices`, `/events`, `/gallery` - Public announcements
- `/auth` - Login/Signup page

### Protected Routes
- `/student` - Student dashboard (upload submissions, view status)
- `/teacher` - Teacher dashboard (review submissions)
- `/admin` - Admin panel (manage content, approve teachers/students)
- `/owner` - Owner dashboard (approve admins, view logs)

## User Flow

### 1. Signup & Role Selection
1. User signs up at `/auth`
2. After authentication, modal appears: "Which describes you perfectly?"
3. User selects role:
   - **Visitor**: Immediate access to `/visitor`
   - **Student**: Request sent to teachers/admins, temporary visitor access
   - **Teacher**: Request sent to admins + owner
   - **Admin**: Request sent to owner only

### 2. Approval Workflow

#### Admin Approval
- When user selects "Admin", edge function sends email to owner
- Owner logs into `/owner` dashboard
- Owner approves/rejects from pending list
- Upon approval, user gains admin access

#### Teacher Approval
- Request sent to all admins + owner
- Any admin can approve from `/admin` dashboard
- Upon approval, teacher can review student submissions

#### Student Approval
- Request sent to teachers + admins
- Once approved, student can upload files
- Submissions remain private until teacher/admin approves

### 3. File Upload (Students)
1. Student uploads file (PDF, DOCX, JPG, PNG, ZIP, max 10MB)
2. File stored in Supabase Storage: `student-portfolios/{userId}/{timestamp}_{filename}`
3. Metadata saved in `submissions` table with status: "pending"
4. Teacher/Admin reviews and approves/rejects
5. Approved submissions visible in public showcase

## Email Notifications

### Edge Function: `send-approval-email`
Located at `supabase/functions/send-approval-email/index.ts`

Currently logs email content. To enable actual sending:

#### Option 1: Resend
```typescript
import { Resend } from 'npm:resend@4.0.0';
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

await resend.emails.send({
  from: 'School <onboarding@your-domain.com>',
  to: recipients,
  subject: `New ${requestedRole} approval request`,
  html: `<p>${userName} (${userEmail}) has requested ${requestedRole} access.</p>`,
});
```

Add `RESEND_API_KEY` secret in backend.

#### Option 2: SendGrid
```typescript
const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    personalizations: [{ to: recipients.map(email => ({ email })) }],
    from: { email: 'noreply@your-domain.com' },
    subject: `New ${requestedRole} approval request`,
    content: [{ type: 'text/html', value: emailHtml }],
  }),
});
```

Add `SENDGRID_API_KEY` secret in backend.

## Animations & Performance

### Features
1. **Mouse-reactive background**: Cursor interactions with gradient layers
2. **Dynamic gradients**: Smooth color transitions across pages
3. **Parallax scrolling**: Multi-layer depth effects
4. **Glassmorphism**: Frosted glass cards with backdrop blur

### Performance Toggles
Planned features (add to user settings):
- "Reduce Motion" (respects `prefers-reduced-motion`)
- "Low Gradient Intensity"
- "Disable Cursor Reactivity"

Current implementation uses:
- GPU-accelerated transforms (`translate3d`)
- `requestAnimationFrame` for smooth animations
- `will-change` hints for performance

## Security

### RLS Policies
All tables have Row Level Security enabled:
- **approvals**: Users see own requests; owner sees all
- **submissions**: Students see own; teachers/admins see all
- **user_roles**: Users see own role; admins see all
- **school_info**: Public read; admin write
- **teachers**: Public read; admin write

### File Upload Validation
- Client-side: Max 10MB, specific file types
- Server-side: Storage policies enforce user-specific paths
- RLS ensures only owners can access their files

### Admin Protection
- Owner access restricted to `ashu1592125@gmail.com`
- Admin promotion only via owner approval
- Teacher approval only via admin/owner
- All role changes logged in `approvals` table

## QA Checklist

### Authentication
- [ ] Sign up with email/password works
- [ ] Login redirects to appropriate dashboard
- [ ] Role selection modal appears after signup
- [ ] Google OAuth integration (if configured)

### Role Selection
- [ ] Visitor: Immediate access, no approval needed
- [ ] Student: Request logged, temporary visitor access granted
- [ ] Teacher: Request sent to admins + owner
- [ ] Admin: Request sent to owner only

### Email Notifications
- [ ] Admin signup sends email to owner
- [ ] Teacher signup sends email to admins + owner
- [ ] Student signup sends email to teachers/admins
- [ ] Approval links are secure and single-use (when implemented)

### Student Dashboard
- [ ] Upload form appears when "New Submission" clicked
- [ ] File validation works (type, size)
- [ ] Upload progress shown
- [ ] Submission appears in list with "pending" status
- [ ] Approved/rejected status updates in real-time

### Teacher Dashboard
- [ ] All student submissions visible
- [ ] Pending count accurate
- [ ] Review form appears when "Review" clicked
- [ ] Approve/Reject buttons work
- [ ] Feedback saves correctly

### Admin Dashboard
- [ ] Teacher approval requests visible
- [ ] Student approval requests visible
- [ ] Approve/Reject updates user_roles table
- [ ] Content management features accessible

### Owner Dashboard
- [ ] Only accessible to ashu1592125@gmail.com
- [ ] Admin approval requests visible
- [ ] Approval/rejection logs all actions
- [ ] Full approval history displayed

### File Storage
- [ ] Files upload to correct bucket path
- [ ] Public URLs generated correctly
- [ ] File preview/download works
- [ ] RLS prevents unauthorized access

### Animations
- [ ] Global gradient background visible on all pages
- [ ] Mouse follower cursor displays
- [ ] Parallax layers animate on scroll
- [ ] Glassmorphism effects render correctly
- [ ] Dark/light mode toggle works
- [ ] Liquid navigation morphs properly

### Performance
- [ ] Page load time < 3 seconds
- [ ] Animations run at 60fps
- [ ] No layout shifts during load
- [ ] Images lazy load correctly
- [ ] Mobile responsiveness verified

## Environment Variables
Already configured in Lovable Cloud:
```
VITE_SUPABASE_URL=https://pivubcbpntiimckktato.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[auto-configured]
VITE_SUPABASE_PROJECT_ID=pivubcbpntiimckktato
```

## Deployment
1. Approve and run pending database migration
2. Set owner role for ashu1592125@gmail.com
3. Configure email service (Resend or SendGrid)
4. Test approval workflow end-to-end
5. Deploy via Lovable publish button

## Support
- **Owner**: ashu1592125@gmail.com
- **School**: Gyan Bharti Senior Secondary School
- **Address**: WRPJ+GG6, 41, SH 69, Tekari, Bihar 824236
- **Phone**: +91-94314-48688

---

**Made with ❤️ By Aashutosh Ranjan**
