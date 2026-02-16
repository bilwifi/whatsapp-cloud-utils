import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWhatsAppClient } from "../src/client";
import { WhatsAppApiError } from "../src/errors";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

describe("createWhatsAppClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sends OTP via template in body and url button index 0", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse({
          messaging_product: "whatsapp",
          messages: [{ id: "wamid.HBgM..." }]
        })
      );

    const client = createWhatsAppClient({
      accessToken: "token",
      phoneNumberId: "123456789"
    });

    await client.sendOtpViaTemplate({
      to: "+225 07 00 00 00 00",
      otp: "482931",
      templateName: "otp_login"
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://graph.facebook.com/v21.0/123456789/messages"
    );

    const request = options as RequestInit;
    const parsedBody = JSON.parse(String(request.body));
    expect(parsedBody.to).toBe("2250700000000");
    expect(parsedBody.type).toBe("template");
    expect(parsedBody.template.components).toEqual([
      {
        type: "body",
        parameters: [{ type: "text", text: "482931" }]
      },
      {
        type: "button",
        sub_type: "url",
        index: "0",
        parameters: [{ type: "text", text: "482931" }]
      }
    ]);
  });

  it("throws WhatsAppApiError on non-2xx responses", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse(
        {
          error: {
            message: "Invalid OAuth access token."
          }
        },
        401
      )
    );

    const client = createWhatsAppClient({
      accessToken: "bad-token",
      phoneNumberId: "123456789"
    });

    const error = await client
      .sendText({
        to: "2250700000000",
        text: "Hello"
      })
      .catch((err: unknown) => err);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(error).toBeInstanceOf(WhatsAppApiError);
    expect(error).toMatchObject({
      status: 401
    });
  });

  it("sends location payload", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse({
          messaging_product: "whatsapp",
          messages: [{ id: "wamid.HBgM..." }]
        })
      );

    const client = createWhatsAppClient({
      accessToken: "token",
      phoneNumberId: "123456789"
    });

    await client.sendLocation({
      to: "+225 07 00 00 00 00",
      latitude: 5.35995,
      longitude: -4.00826,
      name: "KinDB HQ",
      address: "Abidjan"
    });

    const [, options] = fetchMock.mock.calls[0];
    const request = options as RequestInit;
    const parsedBody = JSON.parse(String(request.body));

    expect(parsedBody.type).toBe("location");
    expect(parsedBody.location).toEqual({
      latitude: 5.35995,
      longitude: -4.00826,
      name: "KinDB HQ",
      address: "Abidjan"
    });
  });

  it("sends image by media id", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse({
          messaging_product: "whatsapp",
          messages: [{ id: "wamid.HBgM..." }]
        })
      );

    const client = createWhatsAppClient({
      accessToken: "token",
      phoneNumberId: "123456789"
    });

    await client.sendImage({
      to: "2250700000000",
      imageId: "123456789012345"
    });

    const [, options] = fetchMock.mock.calls[0];
    const request = options as RequestInit;
    const parsedBody = JSON.parse(String(request.body));

    expect(parsedBody.type).toBe("image");
    expect(parsedBody.image).toEqual({
      id: "123456789012345"
    });
  });

  it("validates location coordinates before calling api", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const client = createWhatsAppClient({
      accessToken: "token",
      phoneNumberId: "123456789"
    });

    await expect(
      client.sendLocation({
        to: "2250700000000",
        latitude: 120,
        longitude: -4.00826
      })
    ).rejects.toThrow("'latitude' must be between -90 and 90.");

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends contacts payload", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse({
          messaging_product: "whatsapp",
          messages: [{ id: "wamid.HBgM..." }]
        })
      );

    const client = createWhatsAppClient({
      accessToken: "token",
      phoneNumberId: "123456789"
    });

    await client.sendContacts({
      to: "+225 07 00 00 00 00",
      contacts: [
        {
          name: { formatted_name: "Support KinDB" },
          phones: [{ phone: "+2250700000000", type: "WORK" }]
        }
      ]
    });

    const [, options] = fetchMock.mock.calls[0];
    const request = options as RequestInit;
    const parsedBody = JSON.parse(String(request.body));

    expect(parsedBody.type).toBe("contacts");
    expect(parsedBody.contacts).toEqual([
      {
        name: { formatted_name: "Support KinDB" },
        phones: [{ phone: "+2250700000000", type: "WORK" }]
      }
    ]);
  });

  it("sends interactive button payload", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse({
          messaging_product: "whatsapp",
          messages: [{ id: "wamid.HBgM..." }]
        })
      );

    const client = createWhatsAppClient({
      accessToken: "token",
      phoneNumberId: "123456789"
    });

    await client.sendInteractive({
      to: "2250700000000",
      interactiveType: "button",
      bodyText: "Que souhaitez-vous faire ?",
      buttons: [
        { id: "help_order", title: "Voir commande" },
        { id: "help_agent", title: "Parler a un agent" }
      ]
    });

    const [, options] = fetchMock.mock.calls[0];
    const request = options as RequestInit;
    const parsedBody = JSON.parse(String(request.body));

    expect(parsedBody.type).toBe("interactive");
    expect(parsedBody.interactive).toEqual({
      type: "button",
      body: { text: "Que souhaitez-vous faire ?" },
      action: {
        buttons: [
          {
            type: "reply",
            reply: { id: "help_order", title: "Voir commande" }
          },
          {
            type: "reply",
            reply: { id: "help_agent", title: "Parler a un agent" }
          }
        ]
      }
    });
  });

  it("validates interactive button count before calling api", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const client = createWhatsAppClient({
      accessToken: "token",
      phoneNumberId: "123456789"
    });

    await expect(
      client.sendInteractive({
        to: "2250700000000",
        interactiveType: "button",
        bodyText: "Actions",
        buttons: [
          { id: "a", title: "A" },
          { id: "b", title: "B" },
          { id: "c", title: "C" },
          { id: "d", title: "D" }
        ]
      })
    ).rejects.toThrow("'buttons' must contain between 1 and 3 items.");

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("validates interactive list row limit before calling api", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const client = createWhatsAppClient({
      accessToken: "token",
      phoneNumberId: "123456789"
    });

    await expect(
      client.sendInteractive({
        to: "2250700000000",
        interactiveType: "list",
        bodyText: "Menu",
        buttonText: "Ouvrir",
        sections: [
          {
            title: "Support",
            rows: [
              { id: "1", title: "1" },
              { id: "2", title: "2" },
              { id: "3", title: "3" },
              { id: "4", title: "4" },
              { id: "5", title: "5" },
              { id: "6", title: "6" },
              { id: "7", title: "7" },
              { id: "8", title: "8" },
              { id: "9", title: "9" },
              { id: "10", title: "10" },
              { id: "11", title: "11" }
            ]
          }
        ]
      })
    ).rejects.toThrow("Interactive list supports up to 10 rows in total.");

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
