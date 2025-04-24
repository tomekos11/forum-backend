export const REPORT_REASONS = {
  // Powody zgłoszenia postów
  post_reason: [
    'spam', // Spam
    'violation_of_terms', // Naruszenie regulaminu
    'inappropriate_content', // Treść nieodpowiednia
    'hate_speech', // Mowa nienawiści
    'misleading_information', // Wprowadzające w błąd informacje
    'offensive_language', // Obraźliwy język
    'illegal_activity', // Działalność nielegalna
  ],

  // Powody zgłoszenia użytkowników
  user_reason: [
    'offensive_behavior', // Obraźliwe zachowanie
    'spam', // Spam
    'fake_account', // Fałszywe konto
    'harassment', // Nękanie
    'identity_theft', // Kradzież tożsamości
    'impersonation', // Podszywanie się
    'violence_or_threats', // Przemoc lub groźby
  ],

  // Powody zgłoszenia tematów
  topic_reason: [
    'off_topic', // Nie na temat
    'duplicate_topic', // Powielony temat
    'offensive_language', // Obraźliwy język
    'low_quality', // Niska jakość
    'irrelevant_discussion', // Nieistotna dyskusja
  ],

  // Inne powody zgłoszenia
  other_reason: [
    'other_reason', // Inny powód
    'security_issue', // Problem z bezpieczeństwem
    'privacy_breach', // Naruszenie prywatności
    'bug_report', // Zgłoszenie błędu
  ],
} as const

export const getValidReasons = (reportableType: string | undefined): readonly string[] => {
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
