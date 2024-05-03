import { z } from "zod";

const configurationSchema = z
  .union([
    z.object({
      STORAGE_PROVIDER: z.literal("s3"),
      S3_BUCKET: z.string(),
      S3_ACCESS_KEY_ID: z.string(),
      S3_SECRET_ACCESS_KEY: z.string(),
      S3_SESSION_TOKEN: z.string().optional(),
      S3_REGION: z.string().optional(),
      S3_FORCE_PATH_STYLE: z.coerce.boolean().default(false),
    }),
    z.object({
      STORAGE_PROVIDER: z.literal("local"),
      LOCAL_STORAGE_PATH: z.string(),
    }),
  ])
  .transform((data) =>
    data.STORAGE_PROVIDER === "local"
      ? {
          storage: {
            provider: data.STORAGE_PROVIDER,
            basePath: data.LOCAL_STORAGE_PATH,
          },
        }
      : {
          storage: {
            provider: data.STORAGE_PROVIDER,
            bucket: data.S3_BUCKET,
            credentials: {
              accessKeyId: data.S3_ACCESS_KEY_ID,
              secretAccessKey: data.S3_SECRET_ACCESS_KEY,
              sessionToken: data.S3_SESSION_TOKEN,
            },
            region: data.S3_REGION,
            forcePathStyle: data.S3_FORCE_PATH_STYLE,
          },
        },
  );

export type ConfigurationSchema = z.infer<typeof configurationSchema>;

export function validate(config: Record<string, unknown>) {
  return configurationSchema.parse(config);
}
