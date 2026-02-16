# whatsapp-cloud-utils

Librairie TypeScript reusable pour envoyer des messages via **Meta WhatsApp Cloud API**.

## Fonctionnalites

- Factory client: `createWhatsAppClient()`
- Envoi de templates approuvees: `sendTemplate()`
- Envoi de texte session 24h: `sendText()`
- Helper OTP: `sendOtpViaTemplate()`
- Support media etendu: `sendImage()`, `sendDocument()`, `sendAudio()`, `sendVideo()`
- Support localisation: `sendLocation()`
- Support contacts vCard-like: `sendContacts()`
- Support messages interactifs: `sendInteractive()` (buttons/list)
- Media via URL publique ou media ID Meta
- Gestion d'erreurs backend-friendly: `WhatsAppApiError`
- Normalisation des numeros: `normalizePhone()`

## Installation

```bash
npm install @bilwifi/whatsapp-cloud-utils --registry=https://npm.pkg.github.com
```

## Configuration Meta (token + phone number id)

1. Ouvrir Meta for Developers.
2. Recuperer un Access Token (temporary ou system user token).
3. Recuperer le `phone_number_id` de votre numero WhatsApp Business.
4. Ajouter ces valeurs dans vos variables d'environnement.

Exemple `.env`:

```env
WHATSAPP_ACCESS_TOKEN=your_meta_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_DEFAULT_LANG=fr
```

## Initialisation

```ts
import { createWhatsAppClient } from "@bilwifi/whatsapp-cloud-utils";

const wa = createWhatsAppClient({
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  apiVersion: "v21.0", // optionnel
  defaultLanguageCode: "fr" // optionnel
});
```

## Exemple OTP

```ts
await wa.sendOtpViaTemplate({
  to: "+2250700000000",
  otp: "123456",
  templateName: "otp_login"
});
```

Le helper OTP injecte automatiquement:

- `otp` dans le `body`
- `otp` dans le bouton URL `index: 0`

## Exemple Template

```ts
await wa.sendTemplate({
  to: "+2250700000000",
  templateName: "order_update",
  components: [
    {
      type: "header",
      parameters: [{ type: "text", text: "COMMANDE #A-1029" }]
    },
    {
      type: "body",
      parameters: [
        { type: "text", text: "Peniel" },
        { type: "text", text: "expediee" }
      ]
    },
    {
      type: "button",
      sub_type: "url",
      index: 0,
      parameters: [{ type: "text", text: "A-1029" }]
    },
    {
      type: "button",
      sub_type: "quick_reply",
      index: 1,
      parameters: [{ type: "payload", payload: "CONFIRM_ORDER" }]
    }
  ]
});
```

## Exemple message texte

```ts
await wa.sendText({
  to: "+2250700000000",
  text: "Bonjour, ceci est un message de session 24h.",
  previewUrl: false
});
```

## Exemple location

```ts
await wa.sendLocation({
  to: "+2250700000000",
  latitude: 5.35995,
  longitude: -4.00826,
  name: "KinDB HQ",
  address: "Abidjan"
});
```

## Exemple media (link ou id)

```ts
await wa.sendImage({
  to: "+2250700000000",
  imageLink: "https://cdn.example.com/welcome.jpg",
  caption: "Bienvenue"
});

await wa.sendDocument({
  to: "+2250700000000",
  documentId: "123456789012345"
});
```

## Exemple contacts

```ts
await wa.sendContacts({
  to: "+2250700000000",
  contacts: [
    {
      name: { formatted_name: "Support KinDB", first_name: "Support" },
      phones: [{ phone: "+2250700000000", type: "WORK" }],
      emails: [{ email: "support@kindb.app", type: "WORK" }]
    }
  ]
});
```

## Exemple interactif (buttons)

```ts
await wa.sendInteractive({
  to: "+2250700000000",
  interactiveType: "button",
  bodyText: "Que souhaitez-vous faire ?",
  buttons: [
    { id: "help_order", title: "Voir commande" },
    { id: "help_agent", title: "Parler a un agent" }
  ]
});
```

## Exemple interactif (list)

```ts
await wa.sendInteractive({
  to: "+2250700000000",
  interactiveType: "list",
  bodyText: "Choisissez une categorie",
  buttonText: "Ouvrir menu",
  sections: [
    {
      title: "Support",
      rows: [
        { id: "billing", title: "Facturation" },
        { id: "delivery", title: "Livraison" }
      ]
    }
  ]
});
```

## Rappel important: regle des 24h

- Hors fenetre de 24h apres le dernier message utilisateur, WhatsApp impose l'usage d'un template approuve.
- `sendText()` doit etre utilise uniquement dans la fenetre de session.
- `sendTemplate()` fonctionne hors fenetre, si le template est approuve.

## Gestion d'erreurs

```ts
import { WhatsAppApiError } from "@bilwifi/whatsapp-cloud-utils";

try {
  await wa.sendText({ to: "+2250700000000", text: "Hello" });
} catch (error) {
  if (error instanceof WhatsAppApiError) {
    console.error(error.status); // HTTP status
    console.error(error.responseBody); // payload Meta
  }
}
```

## Compatibilite

- Node.js 18+
- Next.js
- NestJS
- Express

## Scripts utiles (developpement local)

```bash
npm run build
npm run test
npm run example:otp
npm run example:template
npm run example:text
npm run example:location
npm run example:contacts
npm run example:interactive
```

## Futur support

- `sendImage()` (disponible)
- `sendDocument()` (disponible)
- `sendAudio()` (disponible)
- `sendVideo()` (disponible)
- `sendLocation()` (disponible)
- `sendContacts()` (disponible)
- `sendInteractive()` buttons/list (disponible)
- Extension prevue possible pour catalog/messages flow/commerce
