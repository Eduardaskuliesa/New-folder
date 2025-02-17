import prisma from "../../services/prisma";
import logger from "../../utils/logger";

export interface tagData {
  tagName: string;
  scheduledFor: bigint;
}

export async function create(tagData: tagData) {
  try {
    const result = await prisma.tag.create({
      data: {
        tagName: tagData.tagName,
        scheduledFor: tagData.scheduledFor,
      },
    });
    logger.success(`Tag: ${result.tagName} ${result.id} created`);
  } catch (error) {
    return {
      success: false,
      error: `Failed to create tag ${error}`,
    };
  }
}
