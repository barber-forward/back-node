import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Injectable } from '@nestjs/common'

type DayOfWeek =
  | 'SUNDAY'
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'

interface GenerateSlotsParams {
  barbershopId: string
  serviceId: string
  date: Date
}

const DAY_OF_WEEK_MAP: Record<number, DayOfWeek> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async getAvailableSlots({
    barbershopId,
    serviceId,
    date,
  }: GenerateSlotsParams): Promise<string[]> {
    const dayOfWeek = DAY_OF_WEEK_MAP[date.getUTCDay()]

    const [businessHour, service, breakTimes, appointments] = await Promise.all(
      [
        this.prisma.businessHour.findUnique({
          where: {
            barbershopId_dayOfWeek: {
              barbershopId,
              dayOfWeek,
            },
          },
        }),
        this.prisma.service.findUnique({
          where: { id: serviceId },
        }),
        this.prisma.breakTime.findMany({
          where: { barbershopId, dayOfWeek },
        }),
        this.prisma.appointment.findMany({
          where: {
            barbershopId,
            date,
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
        }),
      ],
    )

    if (!businessHour || businessHour.isClosed) return []
    if (!service) return []

    const openMinutes = timeToMinutes(businessHour.openTime)
    const closeMinutes = timeToMinutes(businessHour.closeTime)
    const duration = service.duration

    const breakRanges = breakTimes.map((bt) => ({
      start: timeToMinutes(bt.startTime),
      end: timeToMinutes(bt.endTime),
    }))

    const appointmentRanges = appointments.map((apt) => ({
      start: timeToMinutes(apt.startTime),
      end: timeToMinutes(apt.endTime),
    }))

    const slots: string[] = []

    for (
      let slotStart = openMinutes;
      slotStart + duration <= closeMinutes;
      slotStart += duration
    ) {
      const slotEnd = slotStart + duration

      const overlapsBreak = breakRanges.some(
        (br) => slotStart < br.end && slotEnd > br.start,
      )
      if (overlapsBreak) continue

      const overlapsAppointment = appointmentRanges.some(
        (apt) => slotStart < apt.end && slotEnd > apt.start,
      )
      if (overlapsAppointment) continue

      slots.push(minutesToTime(slotStart))
    }

    return slots
  }
}
