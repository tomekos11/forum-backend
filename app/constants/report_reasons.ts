export const REPORT_REASONS = {
  postReason: [
    { value: 'spam', plLabel: 'Spam', enLabel: 'Spam' },
    {
      value: 'violation_of_terms',
      plLabel: 'Naruszenie regulaminu',
      enLabel: 'Violation of terms',
    },
    {
      value: 'inappropriate_content',
      plLabel: 'Treść nieodpowiednia',
      enLabel: 'Inappropriate content',
    },
    { value: 'hate_speech', plLabel: 'Mowa nienawiści', enLabel: 'Hate speech' },
    {
      value: 'misleading_information',
      plLabel: 'Wprowadzające w błąd informacje',
      enLabel: 'Misleading information',
    },
    { value: 'offensive_language', plLabel: 'Obraźliwy język', enLabel: 'Offensive language' },
    { value: 'illegal_activity', plLabel: 'Działalność nielegalna', enLabel: 'Illegal activity' },
  ],
  userReason: [
    { value: 'offensive_behavior', plLabel: 'Obraźliwe zachowanie', enLabel: 'Offensive behavior' },
    { value: 'spam', plLabel: 'Spam', enLabel: 'Spam' },
    { value: 'fake_account', plLabel: 'Fałszywe konto', enLabel: 'Fake account' },
    { value: 'harassment', plLabel: 'Nękanie', enLabel: 'Harassment' },
    { value: 'identity_theft', plLabel: 'Kradzież tożsamości', enLabel: 'Identity theft' },
    { value: 'impersonation', plLabel: 'Podszywanie się', enLabel: 'Impersonation' },
    { value: 'violence_or_threats', plLabel: 'Przemoc lub groźby', enLabel: 'Violence or threats' },
  ],
  topicReason: [
    { value: 'off_topic', plLabel: 'Nie na temat', enLabel: 'Off topic' },
    { value: 'duplicate_topic', plLabel: 'Powielony temat', enLabel: 'Duplicate topic' },
    { value: 'offensive_language', plLabel: 'Obraźliwy język', enLabel: 'Offensive language' },
    { value: 'low_quality', plLabel: 'Niska jakość', enLabel: 'Low quality' },
    {
      value: 'irrelevant_discussion',
      plLabel: 'Nieistotna dyskusja',
      enLabel: 'Irrelevant discussion',
    },
  ],
  otherReason: [
    { value: 'other_reason', plLabel: 'Inny powód', enLabel: 'Other reason' },
    { value: 'security_issue', plLabel: 'Problem z bezpieczeństwem', enLabel: 'Security issue' },
    { value: 'privacy_breach', plLabel: 'Naruszenie prywatności', enLabel: 'Privacy breach' },
    { value: 'bug_report', plLabel: 'Zgłoszenie błędu', enLabel: 'Bug report' },
  ],
}

type Reason = {
  value: string
  plLabel: string
  enLabel: string
}

export const getValidReasons = (reportableType: string | undefined): readonly Reason[] => {
  if (reportableType === 'all') {
    return [
      ...REPORT_REASONS.postReason,
      ...REPORT_REASONS.userReason,
      ...REPORT_REASONS.topicReason,
      ...REPORT_REASONS.otherReason,
    ]
  }

  switch (reportableType) {
    case 'Post':
      return REPORT_REASONS.postReason
    case 'User':
      return REPORT_REASONS.userReason
    case 'Topic':
      return REPORT_REASONS.topicReason
    case 'Other':
      return REPORT_REASONS.otherReason
    default:
      return []
  }
}

type ReportableKey = 'post' | 'user' | 'topic' | 'other' | undefined
export const getReasons = (
  type: ReportableKey = undefined
): Partial<Record<'postReason' | 'userReason' | 'topicReason' | 'otherReason', Reason[]>> => {
  const reasonsMap = {
    post: { key: 'postReason', value: REPORT_REASONS.postReason },
    user: { key: 'userReason', value: REPORT_REASONS.userReason },
    topic: { key: 'topicReason', value: REPORT_REASONS.topicReason },
    other: { key: 'otherReason', value: REPORT_REASONS.otherReason },
  } as const

  if (!type) {
    return REPORT_REASONS
  }

  const entry = reasonsMap[type]
  return entry ? { [entry.key]: entry.value } : {}
}
