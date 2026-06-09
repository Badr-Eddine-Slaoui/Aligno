import type {
  CreateTimeBlockDTO,
  UpdateTimeBlockDTO
} from '../dto/time-management.dto'

import type {
  CreateTimeBlockData,
  UpdateTimeBlockData
} from '../dao/time-block.dao'

import type {
  CreateDailyTemplateDTO,
  UpdateDailyTemplateDTO
} from '../dto/time-management.dto'

import type {
  CreateDailyTemplateData,
  UpdateDailyTemplateData
} from '../dao/daily-template.dao'

import type {
  CreateDailyScheduleDTO,
  UpdateDailyScheduleDTO
} from '../dto/time-management.dto'

import type {
  CreateDailyScheduleData,
  UpdateDailyScheduleData
} from '../dao/daily-schedule.dao'

export class TimeBlockMapper {
  static toCreateData(
    dto: CreateTimeBlockDTO,
    userId: string
  ): CreateTimeBlockData {
    return {
      ...dto,
      userId
    }
  }

  static toUpdateData(
    dto: UpdateTimeBlockDTO
  ): UpdateTimeBlockData {
    return {
      ...dto
    }
  }
}

export class DailyTemplateMapper {
  static toCreateData(
    dto: CreateDailyTemplateDTO,
    userId: string
  ): CreateDailyTemplateData {
    return {
      ...dto,
      userId
    }
  }

  static toUpdateData(
    dto: UpdateDailyTemplateDTO
  ): UpdateDailyTemplateData {
    return {
      ...dto
    }
  }
}


export class DailyScheduleMapper {
  static toCreateData(
    dto: CreateDailyScheduleDTO,
    userId: string
  ): CreateDailyScheduleData {
    return {
      ...dto,
      userId
    }
  }

  static toUpdateData(
    dto: UpdateDailyScheduleDTO
  ): UpdateDailyScheduleData {
    return {
      ...dto
    }
  }
}