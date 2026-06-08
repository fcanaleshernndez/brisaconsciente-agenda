import { google } from 'googleapis'
import { v4 as uuidv4 } from 'uuid'

const clientId = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET
const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'
const defaultRedirectUri = `${process.env.NUXT_PUBLIC_URL || 'http://localhost:3000'}/api/admin/google-auth/callback`

let cachedCalendar: ReturnType<typeof google.calendar> | null = null

function getOAuth2Client(redirectUri?: string) {
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured')
  }
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri || defaultRedirectUri)
}

async function getCalendarClient() {
  if (cachedCalendar) return cachedCalendar

  if (!refreshToken) {
    throw new Error('GOOGLE_REFRESH_TOKEN not configured')
  }

  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({ refresh_token: refreshToken })
  cachedCalendar = google.calendar({ version: 'v3', auth: oauth2Client })
  return cachedCalendar
}

function getRedirectUri(baseUrl?: string): string | undefined {
  if (!baseUrl) return undefined
  return `${baseUrl}/api/admin/google-auth/callback`
}

export function getAuthUrl(baseUrl?: string): string {
  const oauth2Client = getOAuth2Client(getRedirectUri(baseUrl))
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar'],
  })
}

export async function exchangeCodeForToken(code: string, baseUrl?: string) {
  const oauth2Client = getOAuth2Client(getRedirectUri(baseUrl))
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

export async function refreshAccessToken(): Promise<void> {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({ refresh_token: refreshToken })
  const { credentials } = await oauth2Client.refreshAccessToken()
  oauth2Client.setCredentials(credentials)
}

export interface CreateMeetingOptions {
  summary: string
  description?: string
  startTime: string
  endTime: string
}

export interface MeetingResult {
  meetLink: string
  eventId: string
  htmlLink: string
}

export async function createGoogleMeetMeeting(options: CreateMeetingOptions): Promise<MeetingResult> {
  const calendar = await getCalendarClient()
  const requestId = uuidv4()

  const event = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: options.summary,
      description: options.description || '',
      start: {
        dateTime: options.startTime,
        timeZone: 'America/Santiago',
      },
      end: {
        dateTime: options.endTime,
        timeZone: 'America/Santiago',
      },
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    },
    conferenceDataVersion: 1,
    sendUpdates: 'none',
  })

  const meetLink = event.data.conferenceData?.entryPoints?.find(
    (ep: any) => ep.entryPointType === 'video'
  )?.uri || event.data.hangoutLink || ''

  if (!meetLink) {
    throw new Error('No se pudo crear el enlace de Meet')
  }

  return {
    meetLink,
    eventId: event.data.id || '',
    htmlLink: event.data.htmlLink || '',
  }
}

export async function deleteGoogleMeetEvent(eventId: string): Promise<void> {
  const calendar = await getCalendarClient()

  await calendar.events.delete({
    calendarId,
    eventId,
  })
}
