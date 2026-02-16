import "dotenv/config";
import { createWhatsAppClient } from "../src";

const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const to = process.env.WHATSAPP_TO;

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
  const response = await client.sendText({
    to,
    text: "Bonjour, votre session est active et ce message a ete envoye via WhatsApp Cloud API."
  });

  console.log("Text sent:", response);
}

main().catch((error) => {
  console.error("sendText error:", error);
  process.exit(1);
});
