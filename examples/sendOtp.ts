import "dotenv/config";
import { createWhatsAppClient } from "../src";

const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const to = process.env.WHATSAPP_TO;
const templateName = process.env.WHATSAPP_TEMPLATE_NAME ?? "otp_template";

if (!accessToken || !phoneNumberId || !to) {
  throw new Error(
    "Missing env vars. Required: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_TO"
  );
}

const client = createWhatsAppClient({
  accessToken,
  phoneNumberId,
  defaultLanguageCode: process.env.WHATSAPP_DEFAULT_LANG ?? "fr"
});

async function main(): Promise<void> {
  const otp = String(Math.floor(100000 + Math.random() * 900000));

  const response = await client.sendOtpViaTemplate({
    to,
    otp,
    templateName
  });

  console.log("OTP sent:", response);
}

main().catch((error) => {
  console.error("sendOtp error:", error);
  process.exit(1);
});
