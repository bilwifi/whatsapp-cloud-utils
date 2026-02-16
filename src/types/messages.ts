import type { TemplateLanguageCode } from "./template";

export interface WhatsAppApiContact {
  input: string;
  wa_id: string;
}

export interface WhatsAppApiMessage {
  id: string;
  message_status?: string;
}

export interface WhatsAppApiResponse {
  messaging_product: "whatsapp";
  contacts?: WhatsAppApiContact[];
  messages?: WhatsAppApiMessage[];
}

export interface SendTextInput {
  to: string;
  text: string;
  previewUrl?: boolean;
}

export interface SendOtpViaTemplateInput {
  to: string;
  otp: string;
  templateName: string;
  languageCode?: TemplateLanguageCode;
}

export type ImageSourceInput =
  | {
      imageLink: string;
      imageId?: never;
    }
  | {
      imageLink?: never;
      imageId: string;
    };

export type DocumentSourceInput =
  | {
      documentLink: string;
      documentId?: never;
    }
  | {
      documentLink?: never;
      documentId: string;
    };

export type AudioSourceInput =
  | {
      audioLink: string;
      audioId?: never;
    }
  | {
      audioLink?: never;
      audioId: string;
    };

export type VideoSourceInput =
  | {
      videoLink: string;
      videoId?: never;
    }
  | {
      videoLink?: never;
      videoId: string;
    };

export type SendImageInput = {
  to: string;
  caption?: string;
} & ImageSourceInput;

export type SendDocumentInput = {
  to: string;
  filename?: string;
  caption?: string;
} & DocumentSourceInput;

export type SendAudioInput = {
  to: string;
} & AudioSourceInput;

export type SendVideoInput = {
  to: string;
  caption?: string;
} & VideoSourceInput;

export interface SendLocationInput {
  to: string;
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface ContactName {
  formatted_name: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  suffix?: string;
  prefix?: string;
}

export interface ContactAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  country_code?: string;
  type?: string;
}

export interface ContactEmail {
  email: string;
  type?: string;
}

export interface ContactOrg {
  company?: string;
  department?: string;
  title?: string;
}

export interface ContactPhone {
  phone?: string;
  wa_id?: string;
  type?: string;
}

export interface ContactUrl {
  url: string;
  type?: string;
}

export interface ContactInput {
  name: ContactName;
  birthday?: string;
  addresses?: ContactAddress[];
  emails?: ContactEmail[];
  org?: ContactOrg;
  phones?: ContactPhone[];
  urls?: ContactUrl[];
}

export interface SendContactsInput {
  to: string;
  contacts: ContactInput[];
}

export interface InteractiveReplyButton {
  id: string;
  title: string;
}

export interface InteractiveListRow {
  id: string;
  title: string;
  description?: string;
}

export interface InteractiveListSection {
  title?: string;
  rows: InteractiveListRow[];
}

export interface SendInteractiveButtonsInput {
  to: string;
  interactiveType: "button";
  bodyText: string;
  buttons: InteractiveReplyButton[];
  headerText?: string;
  footerText?: string;
}

export interface SendInteractiveListInput {
  to: string;
  interactiveType: "list";
  bodyText: string;
  buttonText: string;
  sections: InteractiveListSection[];
  headerText?: string;
  footerText?: string;
}

export type SendInteractiveInput =
  | SendInteractiveButtonsInput
  | SendInteractiveListInput;
