import type { HttpContext } from '@adonisjs/core/http'
import Report from '#models/report'
import {
  addMessageValidator,
  existsForType,
  indexReportValidator,
  storeReportValidator,
  updateReportStatusValidator,
} from '#validators/report'
import ReportMessage from '#models/report_message'
import { getReasons } from '../constants/report_reasons.js'

/*
 * Report status:
 * - pending - > waiting for admin/moderator
 * - in_progress - > admin/moderator is working on it (user can add message)
 * - resolved - > admin/moderator has resolved the report or user has closed it
 */
export default class ReportsController {
  /*
  Pododawać rzeczy związane z reasonem -> pobieranie po reasonie, grupowanie po reasonnie, info ile z jakich kategorii k
  */
  public async index({ request, response }: HttpContext) {
    const {
      status = 'pending',
      type,
      page = 1,
      perPage = 10,
      reason,
    } = await indexReportValidator.validate(
      request.only(['status', 'type', 'page', 'perPage', 'reason'])
    )

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

    if (reason) {
      reportsQuery.where('reason', reason)
    }

    const paginated = await reportsQuery.paginate(page, perPage)

    const statusCounts = await Report.query().select('status').count('* as total').groupBy('status')

    const typeCounts = await Report.query()
      .select('reportable_type')
      .count('* as total')
      .groupBy('reportable_type')

    const stats = {
      statuses: Object.fromEntries(statusCounts.map((row) => [row.status, +row.$extras.total])),
      types: Object.fromEntries(typeCounts.map((row) => [row.reportableType, +row.$extras.total])),
    }

    return response.ok({
      meta: paginated.getMeta(),
      data: paginated.serialize().data,
      stats,
    })
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

    if (user.isAtLeastModerator) {
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
      fromModerator: user.isAtLeastModerator,
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

    const isAdmin = user.isAtLeastModerator
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

  public async updateStatus({ auth, params, request, response }: HttpContext) {
    const user = auth.use('jwt').user!
    const { status } = await updateReportStatusValidator.validate(request.only(['status']))
    const report = await Report.findOrFail(params.id)

    if (user.id === report.reporterId) {
      if (status !== 'close') {
        return response.badRequest({
          message: 'Zgłaszający użytkownik może tylko zamknąć zgłoszenie.',
        })
      }
      report.status = 'resolved'
    } else if (user.isAtLeastModerator) {
      if ((report.status === 'pending' || report.status === 'in_progress') && status === 'close') {
        report.status = 'resolved'
      } else if (report.status === 'resolved') {
        const lastMessage = await ReportMessage.query()
          .where('report_id', report.id)
          .orderBy('created_at', 'desc')
          .first()

        if (lastMessage?.userId === report.reporterId) {
          report.status = 'pending'
        } else if (lastMessage?.userId !== report.reporterId) {
          report.status = 'in_progress'
        }
      }
    } else {
      return response.forbidden({
        message: 'Nie masz uprawnień do zmiany statusu zgłoszenia.',
      })
    }

    await report.save()

    return response.ok({
      message: `Status zgłoszenia został zmieniony.`,
      report,
    })
  }
  public async myReports({ auth, request, response }: HttpContext) {
    const user = auth.use('jwt').user!
    const {
      status = 'all',
      type,
      page = 1,
      perPage = 10,
    } = await indexReportValidator.validate(request.only(['status', 'type', 'page', 'perPage']))

    const query = Report.query()
      .where('reporter_id', user.id)
      .orderBy('created_at', 'desc')
      .preload('messages', (messageQuery) => {
        messageQuery.groupOrderBy('created_at', 'asc').groupLimit(1)
      })

    if (status && status !== 'all') {
      query.where('status', status)
    }

    if (type) {
      query.where('reportable_type', type)
    }

    const paginatedReports = await query.paginate(page, perPage)

    return response.ok(paginatedReports)
  }

  public async getReportReasons({ response, request }: HttpContext) {
    const { reason } = request.only(['reason'])
    const reasons = await getReasons(reason)
    return response.ok(reasons)
  }
}
