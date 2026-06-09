import { v4 as uuidv4 } from 'uuid'

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
  provider: 'jitsi'
}

function generateJitsiLink(): string {
  return `https://meet.jit.si/brisaconsciente-${uuidv4()}`
}

export async function createVideoConference(options: CreateVideoConferenceOptions): Promise<VideoConferenceResult> {
  const meetLink = generateJitsiLink()

  return {
    meetLink,
    provider: 'jitsi',
  }
}

export async function deleteVideoConference(_eventId?: string | null): Promise<void> {
  // No-op: Jitsi links don't need cleanup
}
