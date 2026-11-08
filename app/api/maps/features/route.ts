import { getMapData } from "@/lib/maps/server/queries";
import { bboxSchema } from "@/lib/validations/maps";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(req: Request) {
  const parsed = bboxSchema.safeParse(
    Object.fromEntries(new URL(req.url).searchParams),
  );
  if (!parsed.success)
    return Response.json(
      { error: "Área inválida." },
      { status: 400, headers: NO_STORE },
    );

  try {
    return Response.json(await getMapData(parsed.data), { headers: NO_STORE });
  } catch (err) {
    console.error("Erro ao consultar o mapa:", err);
    return Response.json(
      { error: "Não foi possível carregar o mapa." },
      { status: 500, headers: NO_STORE },
    );
  }
}
