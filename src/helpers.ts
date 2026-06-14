/** Pad a number to two digits (e.g. 5 -> "05"). */
function padTo2(num: number): string {
  return num.toString().padStart(2, "0");
}

/**
 * Format a Date as "YYYY-MM-DD HH:mm:ss" in local time — the consent-date
 * format the NetGSM İYS API expects.
 */
export function formatConsentDate(date: Date = new Date()): string {
  const d = [date.getFullYear(), padTo2(date.getMonth() + 1), padTo2(date.getDate())].join("-");
  const t = [padTo2(date.getHours()), padTo2(date.getMinutes()), padTo2(date.getSeconds())].join(":");
  return `${d} ${t}`;
}

/**
 * Normalize a Turkish phone number to the +90XXXXXXXXXX form İYS expects.
 * Accepts inputs like "0532 123 45 67", "+90 532 123 45 67", "5321234567".
 * Non-phone recipients (e.g. emails for EPOSTA consents) are returned unchanged.
 */
export function formatTrPhone(input: string): string {
  if (input.includes("@")) return input.trim();

  let no = input.replace(/[\s()-]/g, "");
  if (no.startsWith("+90")) no = no.slice(3);
  else if (no.startsWith("0090")) no = no.slice(4);
  else if (no.startsWith("90") && no.length === 12) no = no.slice(2);
  else if (no.startsWith("0")) no = no.slice(1);

  return `+90${no}`;
}
