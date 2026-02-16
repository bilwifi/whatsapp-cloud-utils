import "dotenv/config";
import { createWhatsAppClient } from "../src";

const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const to = process.env.WHATSAPP_TO;
const templateName = process.env.WHATSAPP_TEMPLATE_NAME ?? "order_update";

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
  const response = await client.sendTemplate({
    to,
    templateName,
    components: [
      {
        type: "header",
        parameters: [
          {
            type: "text",
            text: "COMMANDE #A-1029"
          }
        ]
      },
      {
        type: "body",
        parameters: [
          {
            type: "text",
            text: "Peniel"
          },
          {
            type: "text",
            text: "expediee"
          }
        ]
      },
      {
        type: "button",
        sub_type: "url",
        index: 0,
        parameters: [
          {
            type: "text",
            text: "A-1029"
          }
        ]
      },
      {
        type: "button",
        sub_type: "quick_reply",
        index: 1,
        parameters: [
          {
            type: "payload",
            payload: "CONFIRM_ORDER"
          }
        ]
      }
    ]
  });

  console.log("Template sent:", response);
}

main().catch((error) => {
  console.error("sendTemplate error:", error);
  process.exit(1);
});
