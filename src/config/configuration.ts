import { z } from "zod";

const splitComma = (s: string) => s.split(",");

const configurationSchema = z
  .intersection(
    z.object({
      AUTH_TOKENS: z
        .string()
        .transform(splitComma)
        .pipe(z.string().min(1).array()),
    }),
    z.union([
      z.object({
        STORAGE_PROVIDER: z.literal("s3"),
        S3_BUCKET: z.string(),
        S3_ACCESS_KEY_ID: z.string().optional(),
        AWS_ACCESS_KEY_ID: z.string().optional(),
        S3_SECRET_ACCESS_KEY: z.string().optional(),
        AWS_SECRET_ACCESS_KEY: z.string().optional(),
        S3_SESSION_TOKEN: z.string().optional(),
        AWS_SESSION_TOKEN: z.string().optional(),
        S3_REGION: z.string().default("us-east-1"),
        AWS_REGION: z.string().optional(),
        S3_FORCE_PATH_STYLE: z.enum(["true", "false"]).default("false"),
        S3_ENDPOINT: z.string().optional(),
      }),
      z.object({
        STORAGE_PROVIDER: z.literal("local"),
        LOCAL_STORAGE_PATH: z.string(),
      }),
    ]),
  )
  .transform((data) => {
    const storage =
      data.STORAGE_PROVIDER === "local"
        ? {
            provider: data.STORAGE_PROVIDER,
            basePath: data.LOCAL_STORAGE_PATH,
          }
        : {
            provider: data.STORAGE_PROVIDER,
            bucket: data.S3_BUCKET,
            credentials: {
              accessKeyId: data.AWS_ACCESS_KEY_ID ?? data.S3_ACCESS_KEY_ID,
              secretAccessKey:
                data.AWS_SECRET_ACCESS_KEY ?? data.S3_SECRET_ACCESS_KEY,
              sessionToken: data.AWS_SESSION_TOKEN ?? data.S3_SESSION_TOKEN,
            },
            region: data.AWS_REGION ?? data.S3_REGION,
            forcePathStyle: data.S3_FORCE_PATH_STYLE === "true",
            endpoint: data.S3_ENDPOINT,
          };
    return {
      storage,
      auth: { tokens: data.AUTH_TOKENS },
    };
  });

export type ConfigurationSchema = z.infer<typeof configurationSchema>;

export type S3KeyAuthCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
};

export function isS3KeyAuthCredentials(
  credentialConfig: any,
): credentialConfig is S3KeyAuthCredentials {
  return (
    typeof credentialConfig.accessKeyId === "string" &&
    typeof credentialConfig.secretAccessKey === "string"
  );
}

export function validate(config: Record<string, unknown>) {
  return configurationSchema.parse(config);
}
