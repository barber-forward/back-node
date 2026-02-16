import { BusinessHour } from '../entities/business-hour'
import { DayOfWeek } from '../enums'

export interface BusinessHourRepository {
  findById(id: string): Promise<BusinessHour | null>
  findByBarbershopId(barbershopId: string): Promise<BusinessHour[]>
  findByBarbershopIdAndDay(
    barbershopId: string,
    dayOfWeek: DayOfWeek,
  ): Promise<BusinessHour | null>
  create(businessHour: BusinessHour): Promise<void>
  save(businessHour: BusinessHour): Promise<void>
  delete(id: string): Promise<void>
}
