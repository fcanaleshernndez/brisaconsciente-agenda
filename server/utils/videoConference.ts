import { v4 as uuidv4 } from 'uuid'
import { createGoogleMeetMeeting, deleteGoogleMeetEvent } from './googleCalendar'

export interface CreateVideoConferenceOptions {
  summary: string
  description?: string
  startTime: string
  endTime: string
  patientEmail?: string
  patientName?: string
  professionalEmail?: string
  professionalName?: string
}

export interface VideoConferenceResult {
  meetLink: string
  eventId?: string
  provider: 'google_meet' | 'jitsi' | 'fallback'
}

const FALLBACK_MESSAGE = 'Hubo un problema generando el enlace de videollamada. El profesional se comunicará contigo para enviarte el enlace manualmente.'

function generateJitsiLink(): string {
  return `https://meet.jit.si/brisaconsciente-${uuidv4()}`
}

export async function createVideoConference(options: CreateVideoConferenceOptions): Promise<VideoConferenceResult> {
  try {
    const meeting = await createGoogleMeetMeeting({
      summary: options.summary,
      description: options.description,
      startTime: options.startTime,
      endTime: options.endTime,
    })

    return {
      meetLink: meeting.meetLink,
      eventId: meeting.eventId,
      provider: 'google_meet',
    }
  } catch (googleError: any) {
    console.error('Google Meet falló, usando Jitsi:', googleError?.message || googleError)

    try {
      return {
        meetLink: generateJitsiLink(),
        provider: 'jitsi',
      }
    } catch (jitsiError: any) {
      console.error('Jitsi también falló:', jitsiError?.message || jitsiError)

      return {
        meetLink: FALLBACK_MESSAGE,
        provider: 'fallback',
      }
    }
  }
}

export async function deleteVideoConference(eventId?: string | null): Promise<void> {
  if (!eventId) return
  await deleteGoogleMeetEvent(eventId)
}
