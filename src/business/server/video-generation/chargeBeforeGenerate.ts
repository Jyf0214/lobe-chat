import type { NewGeneration, NewGenerationBatch } from '@/database/schemas';
import type { CreateVideoServicePayload } from '@/server/routers/lambda/video';

interface ChargeParams {
  generationTopicId: string;
  model: string;
  params: CreateVideoServicePayload['params'];
  provider: string;
  userId: string;
}

type ChargeResult =
  | undefined
  | {
      data: {
        batch: NewGenerationBatch;
        generations: NewGeneration[];
      };
      success: true;
    };

export async function chargeBeforeGenerate(
  // eslint-disable-next-line unused-imports/no-unused-vars
  params: ChargeParams,
): Promise<ChargeResult> {
  return undefined;
}
