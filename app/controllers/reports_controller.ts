import type { HttpContext } from '@adonisjs/core/http'
import Report from '#models/report'
import { existsForType, storeReportValidator } from '#validators/report'
import ReportMessage from '#models/report_message'

export default class ReportsController {
  public async store({ request, auth, response }: HttpContext) {
    const user = auth.use('jwt').user!

    const { reportableType, reportableId, reason, message } = await storeReportValidator.validate(
      request.only(['reportableType', 'reportableId', 'reason', 'message'])
    )

    if (
      (reportableType === 'Other' && reportableId) ||
      (reportableType !== 'Other' &&
        (!reportableId || !reportableType || !(await existsForType(reportableType, reportableId))))
    ) {
      return response.badRequest({
        message: 'Zgłaszany obiekt nie istnieje.',
      })
    }

    const report = await Report.create({
      reporterId: user.id,
      reportableType: reportableType,
      reportableId: reportableId,
      reason: reason,
    })

    const reportMessage = await ReportMessage.create({
      reportId: report.id,
      userId: user.id,
      message: message,
    })

    return response.created({
      report,
      reportMessage,
    })
  }
}
