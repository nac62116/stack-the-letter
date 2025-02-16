import { z } from "zod";

const schema = z.object({
  NODE_VERSION: z.string(),
  NPM_VERSION: z.string(),
  ACCESS_TOKEN_RONJA: z.string(),
  ACCESS_TOKEN_PETER: z.string(),
  ACCESS_TOKEN_MINT_VERNETZT_TEAM: z.string(),
  ACCESS_TOKEN_LUKI_LEON: z.string(),
  ACCESS_TOKEN_JAN: z.string(),
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}

export function init() {
  const parsed = schema.safeParse(process.env);

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );

    throw new Error("Invalid environment variables");
  }
}
