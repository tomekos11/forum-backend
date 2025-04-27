import Post from '#models/post'
import Topic from '#models/topic'
import User from '#models/user'
import vine from '@vinejs/vine'
import type { FieldContext } from '@vinejs/vine/types'

import { getValidReasons } from '../constants/report_reasons.js'

export const indexReportValidator = vine.compile(
  vine.object({
    status: vine.enum(['pending', 'in_progress', 'resolved', 'all']).optional(),
    type: vine.enum(['User', 'Post', 'Topic', 'Other']).optional(),
    page: vine.number().positive().optional(),
    perPage: vine.number().positive().max(100).optional(),
    reason: vine
      .string()
      .use(
        vine.createRule((value: unknown, _: unknown, field: FieldContext) => {
          if (typeof value !== 'string') {
            return
          }

          const validReasons = !field.parent.status
            ? getValidReasons('all')
            : getValidReasons(field.parent.type)

          if (!validReasons.includes(value)) {
            field.report(
              `The field "${field.name}" must contain one of the allowed reasons: ${validReasons.join(', ')}`,
              'invalidReason',
              field
            )
          }
        })()
      )
      .optional(),
  })
)

export const updateReportStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(['open', 'close']),
  })
)

export const storeReportValidator = vine.compile(
  vine.object({
    reportableType: vine.enum(['Post', 'User', 'Topic', 'Other']).nullable().optional(),
    reportableId: vine.number().nullable().optional(),
    reason: vine.string().use(
      vine.createRule((value: unknown, _: unknown, field: FieldContext) => {
        if (typeof value !== 'string') {
          return
        }

        const validReasons = getValidReasons(field.parent.reportableType)

        if (!validReasons.includes(value)) {
          field.report(
            `The field "${field.name}" must contain one of the allowed reasons: ${validReasons.join(', ')}`,
            'invalidReason',
            field
          )
        }
      })()
    ),
    message: vine.string().minLength(5),
  })
)

export const addMessageValidator = vine.compile(
  vine.object({
    message: vine.string().minLength(5),
  })
)

export const existsForType = async (
  reportableType: string,
  reportableId: number
): Promise<boolean> => {
  switch (reportableType) {
    case 'Post':
      return !!(await Post.find(reportableId))
    case 'User':
      return !!(await User.find(reportableId))
    case 'Topic':
      return !!(await Topic.find(reportableId))
    case 'Other':
      return true
    default:
      return false
  }
}
