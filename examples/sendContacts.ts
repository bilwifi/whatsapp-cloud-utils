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
  phoneNumberId
});

async function main(): Promise<void> {
  const response = await client.sendContacts({
    to,
    contacts: [
      {
        name: {
          formatted_name: "Support KinDB",
          first_name: "Support"
        },
        phones: [
          {
            phone: "+2250700000000",
            type: "WORK"
          }
        ],
        emails: [
          {
            email: "support@kindb.app",
            type: "WORK"
          }
        ],
        org: {
          company: "KinDB",
          title: "Support"
        }
      }
    ]
  });

  console.log("Contacts sent:", response);
}

main().catch((error) => {
  console.error("sendContacts error:", error);
  process.exit(1);
});
