export { createWhatsAppClient } from "./client";
export { WhatsAppApiError } from "./errors";
export { normalizePhone } from "./helpers/normalizePhone";

export type {
  CreateWhatsAppClientOptions,
  WhatsAppClient
} from "./client";
export type {
  ContactAddress,
  ContactEmail,
  ContactInput,
  ContactName,
  ContactOrg,
  ContactPhone,
  ContactUrl,
  AudioSourceInput,
  DocumentSourceInput,
  ImageSourceInput,
  InteractiveListRow,
  InteractiveListSection,
  InteractiveReplyButton,
  SendAudioInput,
  SendContactsInput,
  SendDocumentInput,
  SendImageInput,
  SendInteractiveButtonsInput,
  SendInteractiveInput,
  SendInteractiveListInput,
  SendLocationInput,
  SendOtpViaTemplateInput,
  SendTextInput,
  SendVideoInput,
  VideoSourceInput,
  WhatsAppApiResponse
} from "./types/messages";
export type {
  SendTemplateInput,
  TemplateButtonComponent,
  TemplateButtonParameter,
  TemplateComponent,
  TemplateLanguageCode,
  TemplateParameter
} from "./types/template";
