import { normalizePhone } from "./helpers/normalizePhone";
import { postJson } from "./helpers/request";
import type {
  ContactInput,
  SendAudioInput,
  SendContactsInput,
  SendDocumentInput,
  SendImageInput,
  SendInteractiveInput,
  SendInteractiveListInput,
  SendLocationInput,
  SendOtpViaTemplateInput,
  SendTextInput,
  SendVideoInput,
  WhatsAppApiResponse
} from "./types/messages";
import type {
  SendTemplateInput,
  TemplateButtonComponent,
  TemplateComponent,
  TemplateLanguageCode
} from "./types/template";

export interface CreateWhatsAppClientOptions {
  accessToken: string;
  phoneNumberId: string;
  apiVersion?: string;
  defaultLanguageCode?: TemplateLanguageCode;
}

export interface WhatsAppClient {
  sendTemplate(input: SendTemplateInput): Promise<WhatsAppApiResponse>;
  sendText(input: SendTextInput): Promise<WhatsAppApiResponse>;
  sendOtpViaTemplate(
    input: SendOtpViaTemplateInput
  ): Promise<WhatsAppApiResponse>;
  sendImage(input: SendImageInput): Promise<WhatsAppApiResponse>;
  sendDocument(input: SendDocumentInput): Promise<WhatsAppApiResponse>;
  sendAudio(input: SendAudioInput): Promise<WhatsAppApiResponse>;
  sendVideo(input: SendVideoInput): Promise<WhatsAppApiResponse>;
  sendLocation(input: SendLocationInput): Promise<WhatsAppApiResponse>;
  sendContacts(input: SendContactsInput): Promise<WhatsAppApiResponse>;
  sendInteractive(input: SendInteractiveInput): Promise<WhatsAppApiResponse>;
}

const DEFAULT_API_VERSION = "v21.0";
const DEFAULT_LANGUAGE_CODE = "en_US";

type WhatsAppMessageType =
  | "template"
  | "text"
  | "image"
  | "document"
  | "audio"
  | "video"
  | "location"
  | "contacts"
  | "interactive";

type ApiTemplateButtonComponent = Omit<TemplateButtonComponent, "index"> & {
  index: string;
};

type ApiTemplateComponent =
  | Exclude<TemplateComponent, TemplateButtonComponent>
  | ApiTemplateButtonComponent;

type MediaReference =
  | {
      link: string;
    }
  | {
      id: string;
    };

interface ResolveMediaReferenceOptions {
  link?: string;
  id?: string;
  linkField: string;
  idField: string;
}

function ensureConfig(value: string, name: string): void {
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required configuration: ${name}`);
  }
}

function assertNonEmpty(value: string, name: string): string {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(`'${name}' cannot be empty.`);
  }

  return normalized;
}

function ensureFiniteRange(
  value: number,
  min: number,
  max: number,
  field: string
): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`'${field}' must be between ${min} and ${max}.`);
  }
}

function resolveMediaReference({
  link,
  id,
  linkField,
  idField
}: ResolveMediaReferenceOptions): MediaReference {
  const normalizedLink = typeof link === "string" ? link.trim() : "";
  const normalizedId = typeof id === "string" ? id.trim() : "";

  if (
    (normalizedLink.length === 0 && normalizedId.length === 0) ||
    (normalizedLink.length > 0 && normalizedId.length > 0)
  ) {
    throw new Error(
      `Provide exactly one of '${linkField}' or '${idField}'.`
    );
  }

  if (normalizedLink.length > 0) {
    return { link: normalizedLink };
  }

  return { id: normalizedId };
}

function normalizeOptionalText(
  value: string | undefined,
  fieldName: string
): string | undefined {
  if (typeof value === "undefined") {
    return undefined;
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(`'${fieldName}' cannot be empty when provided.`);
  }

  return normalized;
}

function normalizeContact(contact: ContactInput, index: number): ContactInput {
  if (!contact || typeof contact !== "object") {
    throw new Error(`'contacts[${index}]' must be an object.`);
  }

  const formattedName = assertNonEmpty(
    contact.name?.formatted_name ?? "",
    `contacts[${index}].name.formatted_name`
  );

  return {
    ...contact,
    name: {
      ...contact.name,
      formatted_name: formattedName
    }
  };
}

function buildInteractiveListAction(input: SendInteractiveListInput): {
  button: string;
  sections: Array<{
    title?: string;
    rows: Array<{
      id: string;
      title: string;
      description?: string;
    }>;
  }>;
} {
  if (input.sections.length === 0) {
    throw new Error("'sections' must contain at least one section.");
  }

  const sections = input.sections.map((section, sectionIndex) => {
    if (section.rows.length === 0) {
      throw new Error(
        `'sections[${sectionIndex}].rows' must contain at least one row.`
      );
    }

    const normalizedRows = section.rows.map((row, rowIndex) => ({
      id: assertNonEmpty(
        row.id,
        `sections[${sectionIndex}].rows[${rowIndex}].id`
      ),
      title: assertNonEmpty(
        row.title,
        `sections[${sectionIndex}].rows[${rowIndex}].title`
      ),
      description: normalizeOptionalText(
        row.description,
        `sections[${sectionIndex}].rows[${rowIndex}].description`
      )
    }));

    const normalizedTitle = normalizeOptionalText(
      section.title,
      `sections[${sectionIndex}].title`
    );

    if (normalizedTitle) {
      return {
        title: normalizedTitle,
        rows: normalizedRows
      };
    }

    return {
      rows: normalizedRows
    };
  });

  const totalRows = sections.reduce(
    (sum, section) => sum + section.rows.length,
    0
  );
  if (totalRows > 10) {
    throw new Error("Interactive list supports up to 10 rows in total.");
  }

  return {
    button: assertNonEmpty(input.buttonText, "buttonText"),
    sections
  };
}

function buildInteractivePayload(input: SendInteractiveInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    type: input.interactiveType,
    body: {
      text: assertNonEmpty(input.bodyText, "bodyText")
    }
  };

  const normalizedHeaderText = normalizeOptionalText(
    input.headerText,
    "headerText"
  );
  if (normalizedHeaderText) {
    payload.header = {
      type: "text",
      text: normalizedHeaderText
    };
  }

  const normalizedFooterText = normalizeOptionalText(
    input.footerText,
    "footerText"
  );
  if (normalizedFooterText) {
    payload.footer = {
      text: normalizedFooterText
    };
  }

  if (input.interactiveType === "button") {
    if (input.buttons.length === 0 || input.buttons.length > 3) {
      throw new Error("'buttons' must contain between 1 and 3 items.");
    }

    payload.action = {
      buttons: input.buttons.map((button, index) => ({
        type: "reply",
        reply: {
          id: assertNonEmpty(button.id, `buttons[${index}].id`),
          title: assertNonEmpty(button.title, `buttons[${index}].title`)
        }
      }))
    };

    return payload;
  }

  payload.action = buildInteractiveListAction(input);

  return payload;
}

function normalizeTemplateComponents(
  components: TemplateComponent[] | undefined
): ApiTemplateComponent[] | undefined {
  if (!components || components.length === 0) {
    return undefined;
  }

  return components.map((component) => {
    if (component.type !== "button") {
      return component;
    }

    return {
      ...component,
      index: String(component.index)
    };
  });
}

export function createWhatsAppClient({
  accessToken,
  phoneNumberId,
  apiVersion = DEFAULT_API_VERSION,
  defaultLanguageCode = DEFAULT_LANGUAGE_CODE
}: CreateWhatsAppClientOptions): WhatsAppClient {
  ensureConfig(accessToken, "accessToken");
  ensureConfig(phoneNumberId, "phoneNumberId");

  const endpoint = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  async function sendMessage(
    type: WhatsAppMessageType,
    to: string,
    content: unknown
  ): Promise<WhatsAppApiResponse> {
    const payload: Record<string, unknown> = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: normalizePhone(to),
      type
    };

    payload[type] = content;

    return postJson<WhatsAppApiResponse>({
      url: endpoint,
      accessToken,
      body: payload
    });
  }

  async function sendTemplate({
    to,
    templateName,
    languageCode,
    components
  }: SendTemplateInput): Promise<WhatsAppApiResponse> {
    const normalizedTemplateName = assertNonEmpty(
      templateName,
      "templateName"
    );

    const templatePayload: {
      name: string;
      language: { code: string };
      components?: ApiTemplateComponent[];
    } = {
      name: normalizedTemplateName,
      language: {
        code: languageCode ?? defaultLanguageCode
      }
    };

    const normalizedComponents = normalizeTemplateComponents(components);
    if (normalizedComponents) {
      templatePayload.components = normalizedComponents;
    }

    return sendMessage("template", to, templatePayload);
  }

  async function sendText({
    to,
    text,
    previewUrl = false
  }: SendTextInput): Promise<WhatsAppApiResponse> {
    const textPayload = {
      body: assertNonEmpty(text, "text"),
      preview_url: previewUrl
    };

    return sendMessage("text", to, textPayload);
  }

  async function sendOtpViaTemplate({
    to,
    otp,
    templateName,
    languageCode
  }: SendOtpViaTemplateInput): Promise<WhatsAppApiResponse> {
    const normalizedOtp = assertNonEmpty(otp, "otp");

    return sendTemplate({
      to,
      templateName,
      languageCode,
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: normalizedOtp }]
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [{ type: "text", text: normalizedOtp }]
        }
      ]
    });
  }

  async function sendImage(input: SendImageInput): Promise<WhatsAppApiResponse> {
    const media = resolveMediaReference({
      link: "imageLink" in input ? input.imageLink : undefined,
      id: "imageId" in input ? input.imageId : undefined,
      linkField: "imageLink",
      idField: "imageId"
    });

    const imagePayload: Record<string, unknown> = {
      ...media
    };

    if (input.caption) {
      imagePayload.caption = input.caption;
    }

    return sendMessage("image", input.to, imagePayload);
  }

  async function sendDocument(
    input: SendDocumentInput
  ): Promise<WhatsAppApiResponse> {
    const media = resolveMediaReference({
      link: "documentLink" in input ? input.documentLink : undefined,
      id: "documentId" in input ? input.documentId : undefined,
      linkField: "documentLink",
      idField: "documentId"
    });

    const documentPayload: Record<string, unknown> = {
      ...media
    };

    if (input.filename) {
      documentPayload.filename = input.filename;
    }

    if (input.caption) {
      documentPayload.caption = input.caption;
    }

    return sendMessage("document", input.to, documentPayload);
  }

  async function sendAudio(input: SendAudioInput): Promise<WhatsAppApiResponse> {
    const media = resolveMediaReference({
      link: "audioLink" in input ? input.audioLink : undefined,
      id: "audioId" in input ? input.audioId : undefined,
      linkField: "audioLink",
      idField: "audioId"
    });

    return sendMessage("audio", input.to, media);
  }

  async function sendVideo(input: SendVideoInput): Promise<WhatsAppApiResponse> {
    const media = resolveMediaReference({
      link: "videoLink" in input ? input.videoLink : undefined,
      id: "videoId" in input ? input.videoId : undefined,
      linkField: "videoLink",
      idField: "videoId"
    });

    const videoPayload: Record<string, unknown> = {
      ...media
    };

    if (input.caption) {
      videoPayload.caption = input.caption;
    }

    return sendMessage("video", input.to, videoPayload);
  }

  async function sendLocation({
    to,
    latitude,
    longitude,
    name,
    address
  }: SendLocationInput): Promise<WhatsAppApiResponse> {
    ensureFiniteRange(latitude, -90, 90, "latitude");
    ensureFiniteRange(longitude, -180, 180, "longitude");

    const locationPayload: Record<string, unknown> = {
      latitude,
      longitude
    };

    if (name) {
      locationPayload.name = name;
    }

    if (address) {
      locationPayload.address = address;
    }

    return sendMessage("location", to, locationPayload);
  }

  async function sendContacts({
    to,
    contacts
  }: SendContactsInput): Promise<WhatsAppApiResponse> {
    if (!Array.isArray(contacts) || contacts.length === 0) {
      throw new Error("'contacts' must contain at least one contact.");
    }

    const normalizedContacts = contacts.map((contact, index) =>
      normalizeContact(contact, index)
    );

    return sendMessage("contacts", to, normalizedContacts);
  }

  async function sendInteractive(
    input: SendInteractiveInput
  ): Promise<WhatsAppApiResponse> {
    const interactivePayload = buildInteractivePayload(input);
    return sendMessage("interactive", input.to, interactivePayload);
  }

  return {
    sendTemplate,
    sendText,
    sendOtpViaTemplate,
    sendImage,
    sendDocument,
    sendAudio,
    sendVideo,
    sendLocation,
    sendContacts,
    sendInteractive
  };
}
