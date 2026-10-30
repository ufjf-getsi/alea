import { getTilePayload } from "@/lib/maps/queries";
import { tileSchema } from "@/lib/validations/mapTile";

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
