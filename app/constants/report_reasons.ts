export const REPORT_REASONS = {
  post_reason: [
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
  user_reason: [
    { value: 'offensive_behavior', plLabel: 'Obraźliwe zachowanie', enLabel: 'Offensive behavior' },
    { value: 'spam', plLabel: 'Spam', enLabel: 'Spam' },
    { value: 'fake_account', plLabel: 'Fałszywe konto', enLabel: 'Fake account' },
    { value: 'harassment', plLabel: 'Nękanie', enLabel: 'Harassment' },
    { value: 'identity_theft', plLabel: 'Kradzież tożsamości', enLabel: 'Identity theft' },
    { value: 'impersonation', plLabel: 'Podszywanie się', enLabel: 'Impersonation' },
    { value: 'violence_or_threats', plLabel: 'Przemoc lub groźby', enLabel: 'Violence or threats' },
  ],
  topic_reason: [
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
  other_reason: [
    { value: 'other_reason', plLabel: 'Inny powód', enLabel: 'Other reason' },
    { value: 'security_issue', plLabel: 'Problem z bezpieczeństwem', enLabel: 'Security issue' },
    { value: 'privacy_breach', plLabel: 'Naruszenie prywatności', enLabel: 'Privacy breach' },
    { value: 'bug_report', plLabel: 'Zgłoszenie błędu', enLabel: 'Bug report' },
  ],
} as const

type Reason = {
  value: string
  plLabel: string
  enLabel: string
}

export const getValidReasons = (reportableType: string | undefined): readonly Reason[] => {
  if (reportableType === 'all') {
    return [
      ...REPORT_REASONS.post_reason,
      ...REPORT_REASONS.user_reason,
      ...REPORT_REASONS.topic_reason,
      ...REPORT_REASONS.other_reason,
    ]
  }

  switch (reportableType) {
    case 'Post':
      return REPORT_REASONS.post_reason
    case 'User':
      return REPORT_REASONS.user_reason
    case 'Topic':
      return REPORT_REASONS.topic_reason
    case 'Other':
      return REPORT_REASONS.other_reason
    default:
      return []
  }
}
