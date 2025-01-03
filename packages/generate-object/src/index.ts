import { type Infer, type Schema, toJSONSchema } from '@typeschema/main'
import { generateText, type GenerateTextOptions, type GenerateTextResult } from '@xsai/generate-text'
import { clean } from '@xsai/shared'

export interface GenerateObjectOptions<T extends Schema> extends GenerateTextOptions {
  schema: T
  schemaDescription?: string
  schemaName?: string
}

export interface GenerateObjectResult<T extends Schema> extends Omit<GenerateTextResult, 'text'> {
  object: Infer<T>
}

/** @experimental WIP */
export const generateObject = async <T extends Schema>(options: GenerateObjectOptions<T>): Promise<GenerateObjectResult<T>> =>
  await generateText({
    ...options,
    response_format: {
      json_schema: {
        description: options.schemaDescription,
        name: options.schemaName ?? 'json_schema',
        schema: await toJSONSchema(options.schema)
          .then(json => clean({
            ...json,
            $schema: undefined,
          })),
        strict: true,
      },
      type: 'json_schema',
    },
    schema: undefined,
    schemaDescription: undefined,
    schemaName: undefined,
  })
    .then(({ finishReason, steps, text, usage }) => ({
      finishReason,
      // TODO: import { validate } from '@typeschema/main'
      object: JSON.parse(text || '{}'),
      steps,
      usage,
    }))

export default generateObject
