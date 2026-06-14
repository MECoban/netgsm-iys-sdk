/**
 * Minimal usage example. Run with real credentials in your environment:
 *   NETGSM_USERNAME=... NETGSM_PASSWORD=... IYS_BRAND_CODE=... npx ts-node examples/basic.ts
 */
import { NetgsmIys, NetgsmIysError } from "../src";

async function main() {
  const iys = new NetgsmIys({
    username: process.env.NETGSM_USERNAME!,
    password: process.env.NETGSM_PASSWORD!,
    brandCode: process.env.IYS_BRAND_CODE!,
  });

  try {
    // Register an approval for an SMS (MESAJ) consent collected on the web.
    const added = await iys.addConsent({
      type: "MESAJ",
      source: "HS_WEB",
      recipient: "0532 123 45 67", // normalized to +905321234567
      status: "ONAY",
      recipientType: "BIREYSEL",
    });
    console.log("added:", added);

    // Query the current consent status of that recipient.
    const result = await iys.searchConsent({
      type: "MESAJ",
      recipient: "+905321234567",
      recipientType: "BIREYSEL",
    });
    console.log("search:", result);
  } catch (err) {
    if (err instanceof NetgsmIysError) {
      console.error(`İYS failed (code ${err.code}):`, err.message);
    } else {
      throw err;
    }
  }
}

main();
