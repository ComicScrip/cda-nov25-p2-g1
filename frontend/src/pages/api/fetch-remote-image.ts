import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { NextApiRequest, NextApiResponse } from "next";

const MAX_IMAGE_SIZE_BYTES = 50 * 1024 * 1024;

type FetchRemoteImageSuccessResponse = Buffer;

type FetchRemoteImageErrorResponse = {
  error: string;
  details?: string;
};

const isPrivateIpv4 = (value: string): boolean => {
  const segments = value.split(".").map((segment) => Number(segment));
  if (segments.length !== 4 || segments.some((segment) => !Number.isInteger(segment))) {
    return false;
  }

  const [a, b] = segments;
  return (
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
};

const isPrivateIpv6 = (value: string): boolean => {
  const normalized = value.toLowerCase();
  return normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd");
};

const isPrivateIpAddress = (value: string): boolean => {
  const ipVersion = isIP(value);
  if (ipVersion === 4) {
    return isPrivateIpv4(value);
  }

  if (ipVersion === 6) {
    return isPrivateIpv6(value);
  }

  return false;
};

const resolveAndValidateHostname = async (hostname: string): Promise<void> => {
  const normalizedHostname = hostname.trim().toLowerCase();
  if (
    !normalizedHostname ||
    normalizedHostname === "localhost" ||
    normalizedHostname.endsWith(".local")
  ) {
    throw new Error("Hôte non autorisé.");
  }

  if (isPrivateIpAddress(normalizedHostname)) {
    throw new Error("Adresse IP non autorisée.");
  }

  const resolvedAddresses = await lookup(normalizedHostname, { all: true });
  if (resolvedAddresses.some((entry) => isPrivateIpAddress(entry.address))) {
    throw new Error("Adresse IP privée non autorisée.");
  }
};

const extractFileNameFromUrl = (remoteUrl: URL): string => {
  const pathnamePart = remoteUrl.pathname.split("/").filter(Boolean).pop();
  const rawName = pathnamePart ? decodeURIComponent(pathnamePart) : "image-distance.jpg";
  return rawName || "image-distance.jpg";
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FetchRemoteImageSuccessResponse | FetchRemoteImageErrorResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Méthode non autorisée. Utilise POST." });
    return;
  }

  const { url } = req.body as { url?: unknown };
  if (typeof url !== "string" || !url.trim()) {
    res.status(400).json({ error: "Le champ 'url' est requis." });
    return;
  }

  let remoteUrl: URL;
  try {
    remoteUrl = new URL(url.trim());
  } catch {
    res.status(400).json({ error: "URL invalide. Utilisez un lien http:// ou https://." });
    return;
  }

  if (remoteUrl.protocol !== "http:" && remoteUrl.protocol !== "https:") {
    res.status(400).json({ error: "URL invalide. Utilisez un lien http:// ou https://." });
    return;
  }

  try {
    await resolveAndValidateHostname(remoteUrl.hostname);
  } catch (error) {
    res.status(400).json({
      error: "URL non autorisée.",
      details: error instanceof Error ? error.message : "Hôte invalide.",
    });
    return;
  }

  try {
    const response = await fetch(remoteUrl.toString(), {
      redirect: "follow",
      signal: AbortSignal.timeout(12_000),
      headers: {
        Accept: "image/*",
        "User-Agent": "FoodBattleImageFetcher/1.0",
      },
    });

    if (!response.ok) {
      res.status(502).json({
        error: "Impossible de récupérer cette image distante.",
        details: `HTTP ${response.status}`,
      });
      return;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) {
      res.status(415).json({
        error: "La ressource distante n'est pas une image.",
        details: contentType || "Content-Type absent",
      });
      return;
    }

    const contentLength = Number(response.headers.get("content-length") ?? "");
    if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_SIZE_BYTES) {
      res.status(413).json({
        error: "L'image distante est trop volumineuse.",
        details: "Taille max : 50MB.",
      });
      return;
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());
    if (imageBuffer.byteLength > MAX_IMAGE_SIZE_BYTES) {
      res.status(413).json({
        error: "L'image distante est trop volumineuse.",
        details: "Taille max : 50MB.",
      });
      return;
    }

    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", String(imageBuffer.byteLength));
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${extractFileNameFromUrl(remoteUrl).replace(/"/g, "")}"`,
    );
    res.status(200).send(imageBuffer);
  } catch (error) {
    res.status(502).json({
      error: "Impossible de récupérer cette image distante.",
      details:
        error instanceof Error ? error.message : "Erreur réseau pendant le chargement distant.",
    });
  }
}
