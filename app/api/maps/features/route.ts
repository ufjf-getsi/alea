import { z } from "zod";
import { getTilePayload } from "@/lib/maps/queries";
import { MAX_TILE_ZOOM } from "@/lib/maps/tiles";

const MAX_SERVED_ZOOM = Math.min(MAX_TILE_ZOOM, 18);

const int = z
  .string()
  .regex(/^\d{1,8}$/)
  .transform(Number);

const tileSchema = z
  .object({
    z: int.pipe(z.number().max(MAX_SERVED_ZOOM)),
    x: int,
    y: int,
  })
  .refine(({ z, x, y }) => x < 2 ** z && y < 2 ** z);

const stripWeak = (v: string) => v.trim().replace(/^W\//, "");

function etagMatches(header: string | null, etag: string) {
  if (!header) return false;
  if (header.trim() === "*") return true;
  return header.split(",").some((v) => stripWeak(v) === stripWeak(etag));
}

export async function GET(req: Request) {
  const parsed = tileSchema.safeParse(
    Object.fromEntries(new URL(req.url).searchParams),
  );
  if (!parsed.success)
    return Response.json(
      { error: "Tile inválido." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );

  const { z, x, y } = parsed.data;

  let payload: Awaited<ReturnType<typeof getTilePayload>>;
  try {
    payload = await getTilePayload(z, x, y);
  } catch (err) {
    console.error("Erro ao consultar o mapa:", err);
    return Response.json(
      { error: "Não foi possível carregar o mapa." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  const headers = {
    "Cache-Control": "public, no-cache",
    ETag: payload.etag,
  };

  if (etagMatches(req.headers.get("if-none-match"), payload.etag))
    return new Response(null, { status: 304, headers });

  return new Response(payload.body, {
    headers: { ...headers, "Content-Type": "application/json" },
  });
}
