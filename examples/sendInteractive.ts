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
  const response = await client.sendInteractive({
    to,
    interactiveType: "button",
    headerText: "Aide rapide",
    bodyText: "Que souhaitez-vous faire ?",
    footerText: "KinDB Assistant",
    buttons: [
      {
        id: "help_order",
        title: "Voir commande"
      },
      {
        id: "help_agent",
        title: "Parler a un agent"
      }
    ]
  });

  console.log("Interactive sent:", response);
}

main().catch((error) => {
  console.error("sendInteractive error:", error);
  process.exit(1);
});
