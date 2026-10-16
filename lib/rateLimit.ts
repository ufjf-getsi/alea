import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";
import { redis } from "@/lib/redis";

export const RATE_LIMIT_MESSAGE =
  "Muitas tentativas. Tente novamente em alguns minutos.";

export type LimitCheck = [limiter: Ratelimit, key: string];

function create(max: number, window: `${number} ${"m" | "h"}`, prefix: string) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, window),
    prefix,
  });
}

export const limiters = {
  loginIp: create(60, "15 m", "rl:login:ip"),
  loginIpEmail: create(5, "15 m", "rl:login:ip-email"),
  loginEmail: create(50, "1 h", "rl:login:email"),

  signUpIp: create(5, "1 h", "rl:signup:ip"),
  signUpEmail: create(3, "1 h", "rl:signup:email"),

  forgotPasswordIp: create(5, "1 h", "rl:forgot:ip"),
  forgotPasswordEmail: create(3, "1 h", "rl:forgot:email"),

  resetPasswordIp: create(10, "15 m", "rl:reset:ip"),
};

export async function getClientIp() {
  const header = await headers();
  return (
    header.get("x-real-ip") ??
    header.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

//fallback to prevent login failures if Redis is unavailable
export async function isLimited(limiter: Ratelimit, key: string) {
  try {
    const { success } = await limiter.limit(key);
    return !success;
  } catch (err) {
    console.error("Rate limit error:", err);
    return false;
  }
}

export async function anyLimited(checks: LimitCheck[]) {
  for (const [limiter, key] of checks) {
    if (await isLimited(limiter, key)) return true;
  }
  return false;
}

export async function clearLimits(checks: LimitCheck[]) {
  await Promise.all(
    checks.map(async ([limiter, key]) => {
      try {
        await limiter.resetUsedTokens(key);
      } catch (err) {
        console.error("Rate limit reset error:", err);
      }
    }),
  );
}

const authLimiters = new Map<string, Ratelimit>();

function getAuthLimiter(max: number, window: number) {
  const id = `${max}:${window}`;
  let limiter = authLimiters.get(id);

  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, `${window} s`),
      prefix: `ba:rl:${id}`,
    });
    authLimiters.set(id, limiter);
  }

  return limiter;
}

type AuthRateLimitResult =
  | { allowed: true; retryAfter: null }
  | { allowed: false; retryAfter: number };

export async function consumeAuthRateLimit(
  key: string,
  rule: { window: number; max: number },
): Promise<AuthRateLimitResult> {
  try {
    //reset is a timestamp in ms
    const { success, reset } = await getAuthLimiter(
      rule.max,
      rule.window,
    ).limit(key);

    if (success) return { allowed: true, retryAfter: null };

    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    };
  } catch (err) {
    //fallback to prevent requests from being blocked if Redis is unavailable
    console.error("Rate limit consume error:", err);
    return { allowed: true, retryAfter: null };
  }
}
