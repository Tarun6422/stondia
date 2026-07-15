/* ------------------------------------------------------------------ */
/*  Simple User-Agent Parser for Catalog Analytics                     */
/*  Extracts browser, device, and OS from User-Agent strings           */
/*  No external dependencies needed                                    */
/* ------------------------------------------------------------------ */

export function parseUserAgent(ua: string): {
  browser: string;
  device: string;
  os: string;
} {
  if (!ua) return { browser: "Unknown", device: "Unknown", os: "Unknown" };

  const lower = ua.toLowerCase();

  // Browser detection
  let browser = "Unknown";
  if (lower.includes("edge") || lower.includes("edg/")) browser = "Edge";
  else if (lower.includes("opr") || lower.includes("opera")) browser = "Opera";
  else if (lower.includes("chrome") && !lower.includes("chromium")) browser = "Chrome";
  else if (lower.includes("chromium")) browser = "Chromium";
  else if (lower.includes("firefox") && !lower.includes("seamonkey")) browser = "Firefox";
  else if (lower.includes("safari") && !lower.includes("chrome")) browser = "Safari";
  else if (lower.includes("msie") || lower.includes("trident")) browser = "Internet Explorer";
  else if (lower.includes("brave")) browser = "Brave";
  else if (lower.includes("vivaldi")) browser = "Vivaldi";
  else if (lower.includes("samsung")) browser = "Samsung Internet";

  // Device detection
  let device = "Desktop";
  if (lower.includes("iphone") || lower.includes("ipad")) device = "iOS";
  else if (lower.includes("android") && !lower.includes("tablet")) device = "Android Phone";
  else if (lower.includes("android") && lower.includes("tablet")) device = "Android Tablet";
  else if (lower.includes("ipad")) device = "iPad";
  else if (lower.includes("ipod")) device = "iPod";
  else if (lower.includes("mobile") && lower.includes("windows")) device = "Windows Phone";
  else if (lower.includes("blackberry") || lower.includes("bb10")) device = "BlackBerry";
  else if (lower.includes("tablet") || lower.includes("playbook") || lower.includes("silk"))
    device = "Tablet";
  else if (lower.includes("bot") || lower.includes("spider") || lower.includes("crawler"))
    device = "Bot/Crawler";

  // OS detection
  let os = "Unknown";
  if (lower.includes("windows nt 10")) os = "Windows 10";
  else if (lower.includes("windows nt 6.3")) os = "Windows 8.1";
  else if (lower.includes("windows nt 6.2")) os = "Windows 8";
  else if (lower.includes("windows nt 6.1")) os = "Windows 7";
  else if (lower.includes("windows nt")) os = "Windows";
  else if (lower.includes("mac os x") || lower.includes("macintosh")) os = "macOS";
  else if (lower.includes("linux") && !lower.includes("android")) os = "Linux";
  else if (lower.includes("android")) os = "Android";
  else if (lower.includes("iphone") || lower.includes("ipad") || lower.includes("ipod"))
    os = "iOS";
  else if (lower.includes("cros")) os = "Chrome OS";

  return { browser, device, os };
}
