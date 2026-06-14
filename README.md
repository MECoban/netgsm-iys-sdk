# netgsm-iys-sdk

> NetGSM **İYS** (İleti Yönetim Sistemi) onay API'si için bağımlılıksız, tip güvenli bir TypeScript istemcisi.

[![npm-ready](https://img.shields.io/badge/types-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](#neden)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Ticari elektronik ileti gönderen her firmanın izinleri **İYS**'ye işlemesi yasal zorunluluk (6563 sayılı kanun). Bu paket, NetGSM'in İYS API'siyle konuşmayı tek satıra indirir: izin **ekleme** ve **sorgulama**, otomatik telefon normalizasyonu ve tip güvenli hatalar.

## Neden

- **Sıfır bağımlılık** — Node 18+ yerleşik `fetch` kullanır, `axios`/`request` yok.
- **Tip güvenli** — `type`, `status`, `recipientType` gibi alanlar union tiplerle; yanlış değer derlemede yakalanır.
- **Pratik** — `+90`/`0`/boşluklu telefonları otomatik normalize eder, `consentDate`'i sizin için biçimlendirir.
- **Şeffaf hatalar** — başarısız çağrılar `code` ve ham yanıtla birlikte `NetgsmIysError` fırlatır.

## Kurulum

```bash
npm install MECoban/netgsm-iys-sdk
# veya
yarn add MECoban/netgsm-iys-sdk
```

> Henüz npm'de yayınlanmadı; şimdilik doğrudan GitHub'dan kurulur.

## Hızlı başlangıç

```ts
import { NetgsmIys } from "netgsm-iys-sdk";

const iys = new NetgsmIys({
  username: process.env.NETGSM_USERNAME!,
  password: process.env.NETGSM_PASSWORD!,
  brandCode: process.env.IYS_BRAND_CODE!, // İYS marka kodunuz
});

// Web'den alınan bir SMS onayını İYS'ye işle
await iys.addConsent({
  type: "MESAJ",
  source: "HS_WEB",
  recipient: "0532 123 45 67",   // otomatik +905321234567'ye çevrilir
  status: "ONAY",
  recipientType: "BIREYSEL",
});

// Bir alıcının onay durumunu sorgula
const result = await iys.searchConsent({
  type: "MESAJ",
  recipient: "+905321234567",
  recipientType: "BIREYSEL",
});
```

## API

### `new NetgsmIys(config)`

| Alan | Tip | Açıklama |
|---|---|---|
| `username` | `string` | NetGSM API kullanıcı adı (abone no) |
| `password` | `string` | NetGSM API şifresi |
| `brandCode` | `string` | İYS marka kodu (IYS_NO) |
| `baseUrl?` | `string` | API tabanı (varsayılan `https://api.netgsm.com.tr`) |
| `timeoutMs?` | `number` | İstek zaman aşımı (varsayılan `15000`) |

### `addConsent(input | input[])` → `POST /iys/add`

Tek bir onay ya da toplu liste işler. `consentDate` verilmezse şimdiki zaman kullanılır.

| Alan | Tip | Zorunlu |
|---|---|---|
| `type` | `"ARAMA" \| "MESAJ" \| "EPOSTA"` | ✓ |
| `source` | `IysSource` (örn. `"HS_WEB"`) | ✓ |
| `recipient` | `string` (telefon/e-posta) | ✓ |
| `status` | `"ONAY" \| "RET"` | ✓ |
| `recipientType` | `"BIREYSEL" \| "TACIR"` | ✓ |
| `consentDate` | `Date \| string` | — |
| `refid` | `string` | — |

### `searchConsent(input)` → `POST /iys/search`

`type`, `recipient`, `recipientType` ile bir alıcının kayıtlı onay durumunu sorgular.

## Webhook (asenkron sonuçlar)

İYS, gönderilen izinlerin işlenme sonucunu yapılandırdığınız webhook URL'ine POST eder. Gelen gövde için `IysWebhookPayload` tipi hazırdır:

```ts
import type { IysWebhookPayload } from "netgsm-iys-sdk";

app.post("/iys-webhook", (req, res) => {
  const result = req.body as IysWebhookPayload;
  // result.resultstatus, result.errcode, result.submitid ...
  res.send("OK");
});
```

## Hata yönetimi

```ts
import { NetgsmIysError } from "netgsm-iys-sdk";

try {
  await iys.addConsent(/* ... */);
} catch (err) {
  if (err instanceof NetgsmIysError) {
    console.error(`İYS hata (code ${err.code}):`, err.message, err.response);
  }
}
```

İYS API'si başarıyı `code: "0"` ile bildirir; bunun dışındaki her kod `NetgsmIysError` olarak yükselir.

## Notlar

- Bu, NetGSM'in resmî paketi **değildir**; bağımsız, açık kaynak bir istemcidir.
- `source` değerleri ve enum listesi İYS mevzuatına göre güncellenebilir; resmî [NetGSM İYS dokümanına](https://www.netgsm.com.tr/sms/ileti-yonetim-sistemi-iys) bakınız.

## Lisans

[MIT](LICENSE) © Mehmet Emin Coban
