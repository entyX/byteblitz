// ============================================================================
// Country metadata — stored on profiles as an ISO-style two-letter code.
// Existing accounts without a value deliberately resolve to the United States
// so the v1.2.0 leaderboard remains complete without a migration.
// ============================================================================

export const COUNTRIES = [
  ["US", "United States", "🇺🇸"],
  ["CA", "Canada", "🇨🇦"],
  ["MX", "Mexico", "🇲🇽"],
  ["BR", "Brazil", "🇧🇷"],
  ["AR", "Argentina", "🇦🇷"],
  ["CL", "Chile", "🇨🇱"],
  ["CO", "Colombia", "🇨🇴"],
  ["GB", "United Kingdom", "🇬🇧"],
  ["IE", "Ireland", "🇮🇪"],
  ["FR", "France", "🇫🇷"],
  ["DE", "Germany", "🇩🇪"],
  ["ES", "Spain", "🇪🇸"],
  ["IT", "Italy", "🇮🇹"],
  ["NL", "Netherlands", "🇳🇱"],
  ["SE", "Sweden", "🇸🇪"],
  ["NO", "Norway", "🇳🇴"],
  ["PL", "Poland", "🇵🇱"],
  ["TR", "Turkey", "🇹🇷"],
  ["UA", "Ukraine", "🇺🇦"],
  ["IN", "India", "🇮🇳"],
  ["PK", "Pakistan", "🇵🇰"],
  ["BD", "Bangladesh", "🇧🇩"],
  ["JP", "Japan", "🇯🇵"],
  ["KR", "South Korea", "🇰🇷"],
  ["CN", "China", "🇨🇳"],
  ["PH", "Philippines", "🇵🇭"],
  ["ID", "Indonesia", "🇮🇩"],
  ["SG", "Singapore", "🇸🇬"],
  ["AU", "Australia", "🇦🇺"],
  ["NZ", "New Zealand", "🇳🇿"],
  ["ZA", "South Africa", "🇿🇦"],
  ["NG", "Nigeria", "🇳🇬"],
  ["EG", "Egypt", "🇪🇬"],
  ["AE", "United Arab Emirates", "🇦🇪"],
];

const BY_CODE = new Map(COUNTRIES.map(([code, name, flag]) => [code, { code, name, flag }]));

export function countryFor(code) {
  return BY_CODE.get(String(code || "US").toUpperCase()) || BY_CODE.get("US");
}

export function countryOptions(selected = "US") {
  const code = countryFor(selected).code;
  return COUNTRIES.map(([value, name, flag]) => ({ value, label: `${flag}  ${name}`, selected: value === code }));
}

export function countryLabel(code) {
  const country = countryFor(code);
  return `${country.flag} ${country.name}`;
}
