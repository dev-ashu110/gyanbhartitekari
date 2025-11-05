import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OWNER_EMAIL = 'ashu1592125@gmail.com';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { userId, requestedRole } = await req.json();

    // Verify the userId matches the authenticated user
    if (userId !== user.id) {
      console.error('User ID mismatch:', { provided: userId, actual: user.id });
      return new Response(
        JSON.stringify({ error: 'User ID does not match authenticated user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Check if a pending approval request exists
    const { data: existingRequest, error: requestError } = await supabase
      .from('pending_role_requests')
      .select('id, status')
      .eq('user_id', userId)
      .eq('requested_role', requestedRole)
      .single();

    if (requestError && requestError.code !== 'PGRST116') {
      console.error('Error checking existing request:', requestError);
    }

    if (existingRequest && existingRequest.status === 'pending') {
      console.log('Duplicate request prevented for user:', userId);
      return new Response(
        JSON.stringify({ error: 'Approval request already pending' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      );
    }

    // Get user details
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError) throw userError;

    const userEmail = userData.user.email;
    const userName = userData.user.user_metadata?.full_name || userEmail;

    console.log(`Approval request: ${userName} (${userEmail}) requesting ${requestedRole} role`);

    // Determine recipients based on role
    let recipients: string[] = [];
    
    if (requestedRole === 'admin') {
      // Admin requests go to owner only
      recipients = [OWNER_EMAIL];
    } else if (requestedRole === 'teacher') {
      // Teacher requests go to all admins + owner
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (adminRoles) {
        for (const role of adminRoles) {
          const { data: admin } = await supabase.auth.admin.getUserById(role.user_id);
          if (admin?.user?.email) {
            recipients.push(admin.user.email);
          }
        }
      }
      recipients.push(OWNER_EMAIL);
    } else if (requestedRole === 'student') {
      // Student requests go to teachers, admins, and owner
      const { data: teacherRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['teacher', 'admin']);

      if (teacherRoles) {
        for (const role of teacherRoles) {
          const { data: user } = await supabase.auth.admin.getUserById(role.user_id);
          if (user?.user?.email) {
            recipients.push(user.user.email);
          }
        }
      }
      recipients.push(OWNER_EMAIL);
    }

    // Remove duplicates
    recipients = [...new Set(recipients)];

    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    // For now, log the email that would be sent
    console.log('Email notification would be sent to:', recipients);
    console.log('Subject:', `New ${requestedRole} approval request from ${userName}`);
    console.log('Content:', {
      userName,
      userEmail,
      requestedRole,
      approvalLink: `${supabaseUrl}/auth/v1/verify?type=signup&token=...`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Approval request logged',
        recipients,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in send-approval-email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
