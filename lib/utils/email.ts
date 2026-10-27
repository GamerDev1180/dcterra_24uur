import { Resend } from "resend"
import { env } from "@/lib/env"
import { query } from "@/lib/db"
import { formatEventDate } from "@/lib/site-defaults"

const resend = new Resend(env.RESEND_API_KEY)

// Generate unique Discord code
export function generateDiscordCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `DCTerra-${result}`
}

interface RegistrationEmailContext {
  orgName: string
  eventTitle: string
  eventDateLabel: string
  discordInviteLink: string
}

async function getRegistrationEmailContext(): Promise<RegistrationEmailContext> {
  const rows = (await query(`
    SELECT config_key, config_value FROM event_config
    WHERE config_key IN ('org_name', 'event_title', 'stream_start_time', 'discord_invite_link')
  `)) as any[]

  const config = rows.reduce((acc: Record<string, string>, row: any) => {
    acc[row.config_key] = row.config_value
    return acc
  }, {})

  const eventDateLabel = formatEventDate(config.stream_start_time) ?? "Binnenkort bekend"

  return {
    orgName: config.org_name || "DCTerra",
    eventTitle: config.event_title || "24H Livestream",
    eventDateLabel,
    discordInviteLink: config.discord_invite_link || "",
  }
}

// Email templates
export const emailTemplates = {
  registration: (name: string, discordCode: string, context: RegistrationEmailContext) => ({
    subject: `🎉 Welkom bij de ${context.eventTitle}!`,
    html: `
      <!DOCTYPE html>
      <html lang="nl">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Inschrijving bevestigd</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background-color: #d81b6f; background-image: linear-gradient(135deg, #d81b6f 0%, #28ace2 100%); color: white; padding: 40px 30px; text-align: center; }
            .content { padding: 40px 30px; }
            .discord-code { background: #f1f3f4; border: 2px dashed #d81b6f; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .code { font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #d81b6f; letter-spacing: 2px; }
            .rules { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; }
            .btn { display: inline-block; background: #d81b6f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header" style="background-color: #d81b6f; background-image: linear-gradient(135deg, #d81b6f 0%, #28ace2 100%); color: white; padding: 40px 30px; text-align: center;">
              <h1>🎉 Inschrijving bevestigd!</h1>
              <p>Welkom bij de ${context.eventTitle}, ten voordele van ${context.orgName}</p>
            </div>

            <div class="content">
              <h2>Hallo ${name}!</h2>
              <p>Bedankt voor je inschrijving voor de ${context.eventTitle}, ten voordele van ${context.orgName}. We kijken ernaar uit om je erbij te hebben!</p>

              <div class="discord-code">
                <h3>Jouw Discord-toegangscode</h3>
                <div class="code">${discordCode}</div>
                <p><small>Gebruik deze code om je aan te melden zodra je op onze Discord-server bent</small></p>
              </div>

              ${
                context.discordInviteLink
                  ? `<ol style="margin: 20px 0; padding-left: 20px;">
                <li>Klik op de knop hieronder om lid te worden van onze Discord-server</li>
                <li>Voer je toegangscode (<strong>${discordCode}</strong>) in wanneer daarom gevraagd wordt</li>
              </ol>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://dcterralivestream.nl/discord" class="btn">Word lid van de Discord-server</a>
              </div>`
                  : ""
              }

              <div class="rules">
                <h3>📋 Regels & richtlijnen</h3>
                <ul>
                  <li><strong>Respect:</strong> Behandel alle deelnemers met vriendelijkheid en respect</li>
                  <li><strong>Inhoud:</strong> Houd alle inhoud gepast en geschikt voor het hele gezin</li>
                  <li><strong>Deelname:</strong> Doe actief mee en draag positief bij aan de community</li>
                  <li><strong>Techniek:</strong> Test je apparatuur voordat het evenement begint</li>
                  <li><strong>Planning:</strong> Houd je aan je toegewezen tijdslot als je presenteert</li>
                  <li><strong>Doel:</strong> Vergeet niet dat we geld inzamelen voor ${context.orgName}</li>
                </ul>
              </div>

              <h3>📅 Evenementgegevens</h3>
              <ul>
                <li><strong>Datum:</strong> ${context.eventDateLabel}</li>
                <li><strong>Duur:</strong> 24 uur</li>
                <li><strong>Platform:</strong> Discord + streamingplatform</li>
                <li><strong>Doel:</strong> Ten voordele van ${context.orgName}</li>
              </ul>

              <p>Heb je vragen? Neem gerust contact op met ons team.</p>
            </div>

            <div class="footer">
              <p>Deze e-mail is verstuurd naar aanleiding van jouw inschrijving voor de ${context.eventTitle}.</p>
              <p><strong>24 uur live voor ${context.orgName}</strong></p>
              <p>Wil je ook doneren? Dat kan via <a href="https://wensstichtingdrenthe.nl/doneren" style="color:#d81b6f">wensstichtingdrenthe.nl/doneren</a>.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
}

// Send registration email
export async function sendRegistrationEmail(name: string, email: string, discordCode: string) {
  try {
    const context = await getRegistrationEmailContext()
    const template = emailTemplates.registration(name, discordCode, context)

    const { error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: template.subject,
      html: template.html,
    })

    if (error) {
      throw new Error(`Resend sendmail failed: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Email sending error:", error)
    return { success: false, error }
  }
}

// Validate email domain
export async function validateEmailDomain(email: string): Promise<boolean> {
  try {
    const domains = (await query("SELECT domain FROM allowed_domains")) as any[]

    if (domains.length === 0) {
      return false
    }

    return domains.some(({ domain }) => {
      if (domain.startsWith("@student.")) {
        const studentPattern = new RegExp(`^\\d+${domain.replace(".", "\\.")}$`)
        return studentPattern.test(email) || email.endsWith(domain)
      }
      return email.endsWith(domain)
    })
  } catch (error) {
    console.error("Email domain validation error:", error)
    return false
  }
}
