export interface CountryCode {
  code: string;
  name: string;
  flag: string;
  sample: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+91', name: 'India', flag: '🇮🇳', sample: '9876543210' },
  { code: '+1', name: 'United States / Canada', flag: '🇺🇸', sample: '2025550123' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧', sample: '7911123456' },
  { code: '+971', name: 'United Arab Emirates', flag: '🇦🇪', sample: '501234567' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬', sample: '81234567' },
  { code: '+61', name: 'Australia', flag: '🇦🇺', sample: '412345678' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', sample: '512345678' },
  { code: '+974', name: 'Qatar', flag: '🇶🇦', sample: '33123456' },
  { code: '+49', name: 'Germany', flag: '🇩🇪', sample: '1512345678' },
  { code: '+33', name: 'France', flag: '🇫🇷', sample: '612345678' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾', sample: '123456789' },
  { code: '+81', name: 'Japan', flag: '🇯🇵', sample: '9012345678' },
  { code: '+94', name: 'Sri Lanka', flag: '🇱🇰', sample: '712345678' },
  { code: '+977', name: 'Nepal', flag: '🇳🇵', sample: '9812345678' },
  { code: '+880', name: 'Bangladesh', flag: '🇧🇩', sample: '1712345678' },
  { code: '+64', name: 'New Zealand', flag: '🇳🇿', sample: '211234567' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦', sample: '821234567' },
  { code: '+41', name: 'Switzerland', flag: '🇨🇭', sample: '781234567' },
  { code: '+39', name: 'Italy', flag: '🇮🇹', sample: '3123456789' },
  { code: '+34', name: 'Spain', flag: '🇪🇸', sample: '612345678' },
];

/**
 * Parses a stored phone string like "+91 9876543210" or "+919876543210" or "9876543210"
 * into a countryCode and the remaining digits.
 */
export function parsePhoneNumber(fullPhone?: string | null): { countryCode: string; number: string } {
  if (!fullPhone || !fullPhone.trim()) {
    return { countryCode: '+91', number: '' };
  }

  const clean = fullPhone.trim();

  // If starts with +, match against our known country codes (sorted by length descending)
  if (clean.startsWith('+')) {
    const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
    for (const c of sortedCodes) {
      if (clean.startsWith(c.code)) {
        const rawNumber = clean.slice(c.code.length).replace(/\D/g, '');
        return { countryCode: c.code, number: rawNumber };
      }
    }
    // Fallback if country code not in list
    const match = clean.match(/^(\+\d{1,4})\s*(.*)$/);
    if (match) {
      return { countryCode: match[1], number: match[2].replace(/\D/g, '') };
    }
  }

  // If no country code prefix, treat as digits under default +91
  return { countryCode: '+91', number: clean.replace(/\D/g, '') };
}

/**
 * Formats a country code and phone number for storage or display
 */
export function formatPhoneNumber(countryCode: string, number: string): string {
  const digits = number.replace(/\D/g, '').trim();
  if (!digits) return '';
  const code = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
  return `${code} ${digits}`;
}
