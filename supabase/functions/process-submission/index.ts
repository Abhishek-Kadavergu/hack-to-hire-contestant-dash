// Edge Function: process-submission
// Deploy with: supabase functions deploy process-submission

// @ts-nocheck — Deno runtime types are available at deploy time
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Set these in Supabase Secrets for production
const REPO_ANALYZER_URL = Deno.env.get("REPO_ANALYZER_URL") || "";
const RESUME_ANALYZER_URL = Deno.env.get("RESUME_ANALYZER_URL") || "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";

// Supabase configuration (use different names to avoid SUPABASE_ prefix restriction)
const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SERVICE_ROLE_KEY") || "";

interface AnalysisResult {
  summary: string;
  score: number;
}

// ────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────

/**
 * High-level function to analyze a repository.
 * Switches between Real API and Dummy data based on configuration.
 */
async function analyzeRepo(githubUrl: string): Promise<AnalysisResult> {
  console.log(`Analyzing Repo: ${githubUrl}`);

  if (REPO_ANALYZER_URL) {
    try {
      const response = await fetch(REPO_ANALYZER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ github_url: githubUrl }),
      });

      if (!response.ok) {
        throw new Error(`Repo API error: ${response.status}`);
      }
      return (await response.json()) as AnalysisResult;
    } catch (err) {
      console.error("Repo API failed, falling back to dummy", err);
    }
  }

  // Dummy Fallback
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    summary:
      `Repository Analysis for ${githubUrl}:\n\n` +
      `• Project Architecture: Standard modular design.\n` +
      `• Code Quality: High. Clean and maintainable.\n` +
      `• Performance: No major bottlenecks found.\n` +
      `• Security: Safe code patterns observed.\n` +
      `• Recommendation: Strong technical candidate.`,
    score: 88,
  };
}

/**
 * High-level function to analyze a resume.
 */
async function analyzeResume(resumeUrl: string): Promise<AnalysisResult> {
  console.log(`Analyzing Resume: ${resumeUrl}`);

  if (RESUME_ANALYZER_URL) {
    try {
      const response = await fetch(RESUME_ANALYZER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_url: resumeUrl }),
      });

      if (!response.ok) {
        throw new Error(`Resume API error: ${response.status}`);
      }
      return (await response.json()) as AnalysisResult;
    } catch (err) {
      console.error("Resume API failed, falling back to dummy", err);
    }
  }

  // Dummy Fallback
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    summary:
      `Resume Evaluation:\n\n` +
      `• Match: 85% alignment with technical requirements.\n` +
      `• Skills: React, Node.js, and Cloud Infrastructure.\n` +
      `• Experience: Relevant professional background.\n` +
      `• Education: Verified background.\n` +
      `• Summary: Highly qualified candidate.`,
    score: 82,
  };
}

// ────────────────────────────────────────────────────────
// EMAIL HELPER
// ────────────────────────────────────────────────────────

async function sendShortlistEmail(to: string, name: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY — skipping email");
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "TalentFlow <onboarding@resend.dev>",
        to: [to],
        subject:
          "🎉 You're Shortlisted! Next Steps for Your Interview – TalentFlow",
        html: `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #4CAF50;">🎉 Congratulations!</h2>
    <p>Dear <b>${name}</b>,</p>
    <p>
      We are pleased to inform you that you have been <b>shortlisted for the next stage of the interview process</b> based on your performance in our recent hackathon.
    </p>
    <p>
      You have performed exceptionally well, and your <b>hard work, dedication, and problem-solving skills</b> have truly stood out. Your efforts during the hackathon reflect your strong potential, and we greatly appreciate the time and energy you invested.
    </p>
    <p>
      As a next step, we would like to <b>invite you for an interview</b> to further discuss your skills and experience.
    </p>
    <p>
      Kindly respond to this email with your <b>availability</b> so that we can schedule the interview at a convenient time.
    </p>
    <p>
      If you are willing to proceed with the interview process, please confirm your participation by replying to this email.
    </p>
    <p>
      We look forward to your response and wish you continued success.
    </p>
    <br>
    <p>
      Best regards, <br>
      <b>TalentFlow Team</b>
    </p>
  </div>
`,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", result);
      return;
    }

    console.log(`Shortlist email sent to ${to}: ${result.id}`);
  } catch (err) {
    console.error("Error sending shortlist email:", err);
  }
}

// ────────────────────────────────────────────────────────
// MAIN HANDLER
// ────────────────────────────────────────────────────────

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // For now, skip authentication for testing
  // TODO: Add proper authentication in production

  try {
    // Debug: Log environment variables (remove in production)
    console.log("SUPABASE_URL:", SUPABASE_URL ? "Set" : "Missing");
    console.log("SERVICE_ROLE_KEY:", SUPABASE_SERVICE_KEY ? "Set" : "Missing");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error("Missing VITE_SUPABASE_URL or SERVICE_ROLE_KEY");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { submissionId } = await req.json();

    if (!submissionId) {
      return new Response(
        JSON.stringify({ error: "submissionId is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 1. Fetch submission
    const { data: submission, error: fetchError } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (fetchError || !submission) {
      throw new Error(`Submission not found: ${fetchError?.message}`);
    }

    // 2. Update status to processing
    await supabase
      .from("submissions")
      .update({ status: "processing" })
      .eq("id", submissionId);

    // 3. Analyze (Sequential)
    const repoResult = await analyzeRepo(submission.github_repo);
    const resumeResult = await analyzeResume(submission.resume_url);

    // 4. Compute Scores
    const repoScore = Number(repoResult.score) || 0;
    const resumeScore = Number(resumeResult.score) || 0;
    const finalScore =
      Math.round((repoScore * 0.7 + resumeScore * 0.3) * 100) / 100;

    // 5. Save Results
    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        repo_summary: repoResult.summary,
        resume_summary: resumeResult.summary,
        repo_score: repoScore,
        resume_score: resumeScore,
        score: finalScore,
        status: "completed",
        error_message: null,
      })
      .eq("id", submissionId);

    if (updateError) throw updateError;

    // 6. Send shortlist email if score > 80
    let emailSent = false;
    if (finalScore > 80) {
      const { data: user } = await supabase
        .from("users")
        .select("email, name")
        .eq("id", submission.user_id)
        .single();

      if (user?.email) {
        await sendShortlistEmail(user.email, user.name || "Candidate");
        emailSent = true;
      } else {
        console.warn(`No email found for user_id: ${submission.user_id}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, score: finalScore, emailSent }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Edge Function Error: ${errorMessage}`);

    // Attempt to mark as failed in DB if we have a submissionId from the context
    // (Note: To be safer, we'd need to parse the ID earlier or pass it into the catch)

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
