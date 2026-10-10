import { Resend } from "resend";

type Email = { to: string; subject: string; text: string; html: string };

let resend: Resend | undefined;

// Sends through Resend; without RESEND_API_KEY it logs the message in
// development and refuses to run in production.
export async function sendEmail({ to, subject, text, html }: Email) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not set");
    }
    console.log(`\n[email:dev] to=${to}\nsubject=${subject}\n${text}\n`);
    return;
  }

  resend ??= new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "SyncSketch <onboarding@resend.dev>",
    to,
    subject,
    text,
    html,
  });
  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
