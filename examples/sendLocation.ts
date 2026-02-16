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

const latitude = Number(process.env.WHATSAPP_LATITUDE ?? 5.35995);
const longitude = Number(process.env.WHATSAPP_LONGITUDE ?? -4.00826);

const client = createWhatsAppClient({
  accessToken,
  phoneNumberId,
  defaultLanguageCode: process.env.WHATSAPP_DEFAULT_LANG ?? "fr"
});

async function main(): Promise<void> {
  const response = await client.sendLocation({
    to,
    latitude,
    longitude,
    name: "KinDB HQ",
    address: "Abidjan"
  });

  console.log("Location sent:", response);
}

main().catch((error) => {
  console.error("sendLocation error:", error);
  process.exit(1);
});
