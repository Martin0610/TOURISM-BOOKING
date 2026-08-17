import { promises as dns } from 'dns';

// Common disposable/temporary email domains to block
const DISPOSABLE_DOMAINS = [
  '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.com',
  'throwaway.email', 'getnada.com', 'temp-mail.org', 'fakeinbox.com',
  'yopmail.com', 'mohmal.com', 'emailondeck.com', 'trashmail.com',
  'sharklasers.com', 'guerrillamail.info', 'grr.la', 'guerrillamail.biz',
  'spam4.me', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.de',
  'maildrop.cc', 'mailnesia.com', 'mintemail.com', 'mytemp.email',
  'tempmail.net', 'throwawaymail.com', '10minutesemail.net', 'dispostable.com',
];

// Common typos for popular email providers
const DOMAIN_TYPOS: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmial.co': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmil.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'yahho.com': 'yahoo.com',
  'yahhoo.com': 'yahoo.com',
  
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmil.com': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outlok.co': 'outlook.com',
  
  'iclod.com': 'icloud.com',
  'iclou.com': 'icloud.com',
  'icluod.com': 'icloud.com',
};

interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
  warning?: string;
}

/**
 * Basic email format validation using regex
 */
function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Extract domain from email
 */
function getDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() || '';
}

/**
 * Check if domain is in disposable email list
 */
function isDisposableEmail(email: string): boolean {
  const domain = getDomain(email);
  return DISPOSABLE_DOMAINS.includes(domain);
}

/**
 * Check for common typos and suggest corrections
 */
function checkTypo(email: string): string | null {
  const domain = getDomain(email);
  return DOMAIN_TYPOS[domain] || null;
}

/**
 * Verify domain has MX records (DNS check)
 * This runs on server-side only
 */
async function verifyDomainMXRecords(domain: string): Promise<boolean> {
  try {
    const addresses = await dns.resolveMx(domain);
    return addresses && addresses.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Client-side email validation (no DNS check)
 */
export function validateEmailClient(email: string): EmailValidationResult {
  // Format check
  if (!isValidEmailFormat(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    };
  }

  // Disposable email check
  if (isDisposableEmail(email)) {
    return {
      isValid: false,
      error: 'Temporary/disposable email addresses are not allowed',
    };
  }

  // Typo detection
  const suggestion = checkTypo(email);
  if (suggestion) {
    const correctedEmail = email.replace(getDomain(email), suggestion);
    return {
      isValid: true,
      warning: `Did you mean ${correctedEmail}?`,
      suggestion: correctedEmail,
    };
  }

  return { isValid: true };
}

/**
 * Server-side email validation (includes DNS check)
 */
export async function validateEmailServer(email: string): Promise<EmailValidationResult> {
  // First do client-side checks
  const clientValidation = validateEmailClient(email);
  if (!clientValidation.isValid) {
    return clientValidation;
  }

  // DNS MX record check
  const domain = getDomain(email);
  const hasMXRecords = await verifyDomainMXRecords(domain);
  
  if (!hasMXRecords) {
    return {
      isValid: false,
      error: `The email domain "${domain}" does not exist or cannot receive emails`,
    };
  }

  return clientValidation;
}

/**
 * API endpoint validation helper
 */
export async function validateEmailForRegistration(email: string): Promise<{
  valid: boolean;
  message?: string;
  suggestion?: string;
}> {
  const result = await validateEmailServer(email);
  
  if (!result.isValid) {
    return {
      valid: false,
      message: result.error,
    };
  }

  if (result.suggestion) {
    return {
      valid: true,
      message: result.warning,
      suggestion: result.suggestion,
    };
  }

  return { valid: true };
}
