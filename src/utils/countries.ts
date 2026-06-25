export type Country = {
  code: string
  name: string
  flag: string
}

export const COUNTRIES: Country[] = [
  { code: 'af', name: 'Afghanistan', flag: '🇦🇫' },
  { code: 'al', name: 'Albania', flag: '🇦🇱' },
  { code: 'dz', name: 'Algeria', flag: '🇩🇿' },
  { code: 'ad', name: 'Andorra', flag: '🇦🇩' },
  { code: 'ao', name: 'Angola', flag: '🇦🇴' },
  { code: 'ar', name: 'Argentina', flag: '🇦🇷' },
  { code: 'am', name: 'Armenia', flag: '🇦🇲' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
  { code: 'at', name: 'Austria', flag: '🇦🇹' },
  { code: 'az', name: 'Azerbaijan', flag: '🇦🇿' },

  { code: 'bh', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'bd', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'by', name: 'Belarus', flag: '🇧🇾' },
  { code: 'be', name: 'Belgium', flag: '🇧🇪' },
  { code: 'bz', name: 'Belize', flag: '🇧🇿' },
  { code: 'bj', name: 'Benin', flag: '🇧🇯' },
  { code: 'bt', name: 'Bhutan', flag: '🇧🇹' },
  { code: 'bo', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'ba', name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { code: 'bw', name: 'Botswana', flag: '🇧🇼' },
  { code: 'br', name: 'Brazil', flag: '🇧🇷' },
  { code: 'bg', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'bf', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'bi', name: 'Burundi', flag: '🇧🇮' },

  { code: 'kh', name: 'Cambodia', flag: '🇰🇭' },
  { code: 'cm', name: 'Cameroon', flag: '🇨🇲' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
  { code: 'cv', name: 'Cape Verde', flag: '🇨🇻' },
  { code: 'cf', name: 'Central African Republic', flag: '🇨🇫' },
  { code: 'td', name: 'Chad', flag: '🇹🇩' },
  { code: 'cl', name: 'Chile', flag: '🇨🇱' },
  { code: 'cn', name: 'China', flag: '🇨🇳' },
  { code: 'co', name: 'Colombia', flag: '🇨🇴' },
  { code: 'km', name: 'Comoros', flag: '🇰🇲' },
  { code: 'cg', name: 'Congo', flag: '🇨🇬' },
  { code: 'cd', name: 'Democratic Republic of the Congo', flag: '🇨🇩' },
  { code: 'cr', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'hr', name: 'Croatia', flag: '🇭🇷' },
  { code: 'cu', name: 'Cuba', flag: '🇨🇺' },
  { code: 'cy', name: 'Cyprus', flag: '🇨🇾' },
  { code: 'cz', name: 'Czech Republic', flag: '🇨🇿' },

  { code: 'dk', name: 'Denmark', flag: '🇩🇰' },
  { code: 'dj', name: 'Djibouti', flag: '🇩🇯' },
  { code: 'do', name: 'Dominican Republic', flag: '🇩🇴' },

  { code: 'ec', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'eg', name: 'Egypt', flag: '🇪🇬' },
  { code: 'sv', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'ee', name: 'Estonia', flag: '🇪🇪' },
  { code: 'et', name: 'Ethiopia', flag: '🇪🇹' },

  { code: 'fi', name: 'Finland', flag: '🇫🇮' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },

  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'gh', name: 'Ghana', flag: '🇬🇭' },
  { code: 'gr', name: 'Greece', flag: '🇬🇷' },
  { code: 'gt', name: 'Guatemala', flag: '🇬🇹' },

  { code: 'hn', name: 'Honduras', flag: '🇭🇳' },
  { code: 'hu', name: 'Hungary', flag: '🇭🇺' },

  { code: 'is', name: 'Iceland', flag: '🇮🇸' },
  { code: 'in', name: 'India', flag: '🇮🇳' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'ir', name: 'Iran', flag: '🇮🇷' },
  { code: 'iq', name: 'Iraq', flag: '🇮🇶' },
  { code: 'ie', name: 'Ireland', flag: '🇮🇪' },
  { code: 'il', name: 'Israel', flag: '🇮🇱' },
  { code: 'it', name: 'Italy', flag: '🇮🇹' },

  { code: 'jp', name: 'Japan', flag: '🇯🇵' },

  { code: 'ke', name: 'Kenya', flag: '🇰🇪' },
  { code: 'kr', name: 'South Korea', flag: '🇰🇷' },

  { code: 'mx', name: 'Mexico', flag: '🇲🇽' },

  { code: 'nl', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'nz', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'ng', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'no', name: 'Norway', flag: '🇳🇴' },

  { code: 'pk', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'pa', name: 'Panama', flag: '🇵🇦' },
  { code: 'pe', name: 'Peru', flag: '🇵🇪' },
  { code: 'ph', name: 'Philippines', flag: '🇵🇭' },
  { code: 'pl', name: 'Poland', flag: '🇵🇱' },
  { code: 'pt', name: 'Portugal', flag: '🇵🇹' },

  { code: 'ro', name: 'Romania', flag: '🇷🇴' },
  { code: 'ru', name: 'Russia', flag: '🇷🇺' },

  { code: 'sa', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'rs', name: 'Serbia', flag: '🇷🇸' },
  { code: 'sg', name: 'Singapore', flag: '🇸🇬' },
  { code: 'za', name: 'South Africa', flag: '🇿🇦' },
  { code: 'es', name: 'Spain', flag: '🇪🇸' },
  { code: 'se', name: 'Sweden', flag: '🇸🇪' },
  { code: 'ch', name: 'Switzerland', flag: '🇨🇭' },

  { code: 'th', name: 'Thailand', flag: '🇹🇭' },
  { code: 'tr', name: 'Turkey', flag: '🇹🇷' },

  { code: 'ua', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'ae', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'us', name: 'United States', flag: '🇺🇸' },

  { code: 'uy', name: 'Uruguay', flag: '🇺🇾' },
  { code: 've', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'vn', name: 'Vietnam', flag: '🇻🇳' }
]