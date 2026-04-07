import { google } from 'googleapis'
import { v4 as uuidv4 } from 'uuid'

const clientId = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET
const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

function getOAuth2Client() {
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured')
  }

  return new google.auth.OAuth2(clientId, clientSecret, 'http://localhost:3000')
}

async function getCalendarClient() {
  if (!refreshToken) {
    throw new Error('GOOGLE_REFRESH_TOKEN not configured. Run the auth script first.')
  }

  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({ refresh_token: refreshToken })

  const { credentials } = await oauth2Client.refreshAccessToken()
  oauth2Client.setCredentials(credentials)

  return google.calendar({ version: 'v3', auth: oauth2Client })
}

export interface CreateMeetingOptions {
  summary: string
  description?: string
  startTime: string
  endTime: string
  patientEmail?: string
  patientName?: string
  professionalEmail?: string
  professionalName?: string
  location?: string
}

export interface MeetingResult {
  meetLink: string
  eventId: string
  htmlLink: string
}

export async function createGoogleMeetMeeting(options: CreateMeetingOptions): Promise<MeetingResult> {
  const calendar = await getCalendarClient()
  const requestId = uuidv4()

  const attendees: { email: string; displayName?: string }[] = []
  if (options.patientEmail) {
    attendees.push({ email: options.patientEmail, displayName: options.patientName })
  }
  if (options.professionalEmail) {
    attendees.push({ email: options.professionalEmail, displayName: options.professionalName })
  }

  const event = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: options.summary,
      description: options.description || '',
      location: options.location || '',
      start: {
        dateTime: options.startTime,
        timeZone: 'America/Santiago',
      },
      end: {
        dateTime: options.endTime,
        timeZone: 'America/Santiago',
      },
      attendees: attendees.length > 0 ? attendees : undefined,
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
    sendUpdates: 'all',
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
