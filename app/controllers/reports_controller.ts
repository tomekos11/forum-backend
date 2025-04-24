import type { HttpContext } from '@adonisjs/core/http'
import Report from '#models/report'
import {
  addMessageValidator,
  existsForType,
  indexReportValidator,
  storeReportValidator,
} from '#validators/report'
import ReportMessage from '#models/report_message'

export default class ReportsController {
  public async index({ request, response }: HttpContext) {
    const {
      status = 'pending',
      type,
      page = 1,
      perPage = 10,
    } = await indexReportValidator.validate(request.only(['status', 'type', 'page', 'perPage']))

    const reportsQuery = Report.query()
      .preload('reporter')
      .preload('messages', (query) => {
        query.orderBy('created_at', 'desc').groupLimit(1)
      })
      .orderBy('created_at', 'desc')

    if (status && status !== 'all') {
      reportsQuery.where('status', status)
    }

    if (type) {
      reportsQuery.where('reportable_type', type)
    }

    const paginated = await reportsQuery.paginate(page, perPage)
    return response.ok(paginated)
  }

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

  public async addMessage({ request, auth, response, params }: HttpContext) {
    //TODO czy administrator/moderator moze odpowiadac na swoje zgłoszenie?
    const user = auth.use('jwt').user!
    const report = await Report.findOrFail(params.id)

    if (report.reporterId !== user.id && user.role !== 'admin' && user.role !== 'moderator') {
      return response.badRequest({
        message: 'Tylko zgłaszający użytkownik lub admin/moderator może odpowiedzieć.',
      })
    }

    if (user.role === 'admin' || user.role === 'moderator') {
      if (report.status === 'pending') {
        report.status = 'in_progress'
      } else if (report.status === 'resolved') {
        return response.badRequest({
          message: 'Nie możesz odpowiedzieć na zgłoszenie, które zostało już rozwiązane.',
        })
      }
    } else if (user.id === report.reporterId) {
      if (report.status !== 'in_progress') {
        return response.badRequest({
          message: 'Zaczekaj na odpowiedź moderatora lub admina.',
        })
      }
    } else {
      return response.badRequest({
        message:
          'Tylko admin, moderator lub użytkownik zgłaszający mogą odpowiedzieć na to zgłoszenie.',
      })
    }

    const { message } = await addMessageValidator.validate(request.only(['message']))

    const reportMessage = await ReportMessage.create({
      reportId: report.id,
      userId: user.id,
      message: message,
      fromModerator: user.role === 'admin' || user.role === 'moderator',
    })
    await report.save()

    return response.created({
      message: 'Odpowiedź została dodana.',
      reportMessage,
    })
  }
  public async show({ params, response, auth }: HttpContext) {
    const user = auth.use('jwt').user!

    const report = await Report.query()
      .where('id', params.id)
      .preload('reporter')
      .preload('messages', (query) => {
        query.orderBy('created_at', 'asc').preload('user')
      })
      .firstOrFail()

    const isAdmin = user.role === 'admin' || user.role === 'moderator'
    const isReporter = report.reporterId === user.id

    if (!isAdmin && !isReporter) {
      return response.forbidden({
        message: 'Nie masz dostępu do tego zgłoszenia.',
      })
    }

    const reportable = await report.reportable()
    console.log(reportable)

    return response.ok({
      ...report.serialize(),
      reportable,
    })
  }
}
