import { formatConsentDate, formatTrPhone } from "./helpers";
import type {
  ConsentInput,
  NetgsmIysConfig,
  NetgsmResponse,
  SearchInput,
} from "./types";

const DEFAULT_BASE_URL = "https://api.netgsm.com.tr";
const DEFAULT_TIMEOUT_MS = 15000;

/** Thrown when the İYS API replies with a non-success code or an HTTP error. */
export class NetgsmIysError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly response?: NetgsmResponse,
  ) {
    super(message);
    this.name = "NetgsmIysError";
  }
}

/**
 * Minimal, dependency-free client for the NetGSM İYS (İleti Yönetim Sistemi) API.
 *
 * ```ts
 * const iys = new NetgsmIys({
 *   username: process.env.NETGSM_USERNAME!,
 *   password: process.env.NETGSM_PASSWORD!,
 *   brandCode: process.env.IYS_BRAND_CODE!,
 * });
 *
 * await iys.addConsent({
 *   type: "MESAJ",
 *   source: "HS_WEB",
 *   recipient: "0532 123 45 67",
 *   status: "ONAY",
 *   recipientType: "BIREYSEL",
 * });
 * ```
 */
export class NetgsmIys {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly config: NetgsmIysConfig) {
    if (!config.username || !config.password || !config.brandCode) {
      throw new Error("NetgsmIys: username, password and brandCode are required");
    }
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  /**
   * Register one or more consents with İYS (`POST /iys/add`).
   * Phone recipients are normalized and `consentDate` defaults to now.
   * Resolves with the raw API response; throws {@link NetgsmIysError} on failure.
   */
  async addConsent(input: ConsentInput | ConsentInput[]): Promise<NetgsmResponse> {
    const items = Array.isArray(input) ? input : [input];
    const data = items.map((c) => ({
      type: c.type,
      source: c.source,
      recipient: formatTrPhone(c.recipient),
      status: c.status,
      consentDate:
        c.consentDate instanceof Date || c.consentDate == null
          ? formatConsentDate(c.consentDate ?? undefined)
          : c.consentDate,
      recipientType: c.recipientType,
      ...(c.refid ? { refid: c.refid } : {}),
    }));
    return this.request("/iys/add", data);
  }

  /**
   * Query the registered consent status of a recipient (`POST /iys/search`).
   */
  async searchConsent(input: SearchInput): Promise<NetgsmResponse> {
    const data = [
      {
        type: input.type,
        recipient: formatTrPhone(input.recipient),
        recipientType: input.recipientType,
      },
    ];
    return this.request("/iys/search", data);
  }

  private async request(path: string, data: unknown[]): Promise<NetgsmResponse> {
    const body = JSON.stringify({
      header: {
        username: this.config.username,
        password: this.config.password,
        brandCode: this.config.brandCode,
      },
      body: { data },
    });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: controller.signal,
      });
    } catch (err) {
      throw new NetgsmIysError(
        `İYS request to ${path} failed: ${(err as Error).message}`,
      );
    } finally {
      clearTimeout(timer);
    }

    const text = await res.text();
    let json: NetgsmResponse;
    try {
      json = text ? (JSON.parse(text) as NetgsmResponse) : {};
    } catch {
      throw new NetgsmIysError(
        `İYS returned a non-JSON response (HTTP ${res.status}): ${text.slice(0, 200)}`,
      );
    }

    if (!res.ok) {
      throw new NetgsmIysError(`İYS HTTP ${res.status}`, json.code, json);
    }
    // The İYS API signals success with code "0".
    if (json.code != null && String(json.code) !== "0") {
      throw new NetgsmIysError(
        `İYS error (code ${json.code})${json.error ? `: ${json.error}` : ""}`,
        String(json.code),
        json,
      );
    }
    return json;
  }
}
