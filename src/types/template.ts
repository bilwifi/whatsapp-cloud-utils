export type TemplateLanguageCode = string;

export type TemplateTextParameter = {
  type: "text";
  text: string;
};

export type TemplateCurrencyParameter = {
  type: "currency";
  currency: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
};

export type TemplateDateTimeParameter = {
  type: "date_time";
  date_time: {
    fallback_value: string;
  };
};

export type TemplateImageParameter = {
  type: "image";
  image: {
    link: string;
  };
};

export type TemplateDocumentParameter = {
  type: "document";
  document: {
    link: string;
    filename?: string;
  };
};

export type TemplateVideoParameter = {
  type: "video";
  video: {
    link: string;
  };
};

export type TemplateParameter =
  | TemplateTextParameter
  | TemplateCurrencyParameter
  | TemplateDateTimeParameter
  | TemplateImageParameter
  | TemplateDocumentParameter
  | TemplateVideoParameter;

export type TemplateButtonParameter =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "payload";
      payload: string;
    };

export interface TemplateBodyComponent {
  type: "body";
  parameters: TemplateParameter[];
}

export interface TemplateHeaderComponent {
  type: "header";
  parameters: TemplateParameter[];
}

export interface TemplateButtonComponent {
  type: "button";
  sub_type: "quick_reply" | "url" | "copy_code";
  index: number | `${number}`;
  parameters: TemplateButtonParameter[];
}

export type TemplateComponent =
  | TemplateBodyComponent
  | TemplateHeaderComponent
  | TemplateButtonComponent;

export interface SendTemplateInput {
  to: string;
  templateName: string;
  languageCode?: TemplateLanguageCode;
  components?: TemplateComponent[];
}
