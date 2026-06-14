/**
 * İYS (İleti Yönetim Sistemi) consent types, as defined by the NetGSM İYS API.
 * @see https://www.netgsm.com.tr/sms/ileti-yonetim-sistemi-iys
 */

/** Communication channel the consent applies to. */
export type IysType = "ARAMA" | "MESAJ" | "EPOSTA";

/** Consent state: approval (ONAY) or rejection (RET). */
export type IysStatus = "ONAY" | "RET";

/** Whether the recipient is an individual or a merchant. */
export type IysRecipientType = "BIREYSEL" | "TACIR";

/**
 * Where the consent was collected. NetGSM accepts a fixed set of sources;
 * the common ones are listed here, but any string the API accepts is allowed.
 */
export type IysSource =
  | "HS_WEB"
  | "HS_FIZIKSEL_ORTAM"
  | "HS_ISLEM_MERKEZI"
  | "HS_CAGRI_MERKEZI"
  | "HS_SOSYAL_MEDYA"
  | "HS_EPOSTA"
  | "HS_ETKINLIK"
  | "HS_2D"
  | (string & {});

export interface NetgsmIysConfig {
  /** NetGSM API username (your subscriber number). */
  username: string;
  /** NetGSM API password. */
  password: string;
  /** Your İYS brand code (marka kodu / IYS_NO). */
  brandCode: string;
  /** Override the API base URL (defaults to https://api.netgsm.com.tr). */
  baseUrl?: string;
  /** Request timeout in milliseconds (default 15000). */
  timeoutMs?: number;
}

export interface ConsentInput {
  type: IysType;
  source: IysSource;
  /** Phone in +90XXXXXXXXXX form, or an email for EPOSTA. Phones are normalized for you. */
  recipient: string;
  status: IysStatus;
  /**
   * Consent timestamp. Accepts a Date (formatted to "YYYY-MM-DD HH:mm:ss")
   * or a pre-formatted string. Defaults to now.
   */
  consentDate?: Date | string;
  recipientType: IysRecipientType;
  /** Optional caller-supplied reference id echoed back in webhooks. */
  refid?: string;
}

export interface SearchInput {
  type: IysType;
  /** Phone in +90XXXXXXXXXX form, or an email. Phones are normalized for you. */
  recipient: string;
  recipientType: IysRecipientType;
}

/** Raw JSON response returned by the NetGSM İYS API. `code === "0"` means success. */
export interface NetgsmResponse {
  code?: string;
  error?: string;
  [key: string]: unknown;
}

/**
 * Shape of the async result NetGSM POSTs to your configured İYS webhook URL
 * once a submitted consent has been processed on the İYS side.
 */
export interface IysWebhookPayload {
  iyscode: number;
  brandcode: number;
  type: string;
  source: string;
  status: string;
  consentdate: string;
  recipienttype: string;
  retailercode: string;
  retaileraccess: string;
  submitid: string;
  recipient: string;
  resultstatus: string;
  errcode: string;
  errmsg: string;
  creationdate: string;
}
