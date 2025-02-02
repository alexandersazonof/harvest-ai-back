import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in .env');
    }

    this.openai = new OpenAI({
      apiKey,
    });
  }

  async send(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
  ): Promise<OpenAI.Chat.ChatCompletion> {
    this.logger.debug(`Sending prompt: ${messages}`);
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      messages: messages,
      model: 'gpt-4o-mini',
    };
    return this.openai.chat.completions.create(params);
  }
}
