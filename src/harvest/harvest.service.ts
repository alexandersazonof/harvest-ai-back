import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getSdk, VaultsQuery } from '../__generated/graphql';
import { GraphQLClient } from 'graphql-request';
import { AiService } from '../ai/ai.service';
import { OpenAI } from 'openai';
import { HarvestMessage } from './models/harvest-message';

@Injectable()
export class HarvestService {
  private readonly logger = new Logger(HarvestService.name);
  private sdkMap: Record<string, ReturnType<typeof getSdk>> = {};

  constructor(
    private readonly configService: ConfigService,
    private readonly aiService: AiService,
  ) {
    const ethUrl = this.configService.get<string>('HARVEST_ETH_URL');
    const polygonUrl = this.configService.get<string>('HARVEST_POLYGON_URL');
    const arbitrumUrl = this.configService.get<string>('HARVEST_ARBITRUM_URL');
    const baseUrl = this.configService.get<string>('HARVEST_BASE_URL');

    if (ethUrl) {
      this.sdkMap['ethereum'] = getSdk(new GraphQLClient(ethUrl));
    }
    if (polygonUrl) {
      this.sdkMap['polygon'] = getSdk(new GraphQLClient(polygonUrl));
    }
    if (arbitrumUrl) {
      this.sdkMap['arbitrum'] = getSdk(new GraphQLClient(arbitrumUrl));
    }
    if (baseUrl) {
      this.sdkMap['base'] = getSdk(new GraphQLClient(baseUrl));
    }
  }

  async getVaultsByChain(): Promise<
    Array<{ chain: string; vaults: VaultsQuery['vaults'] }>
  > {
    this.logger.debug('Fetching vaults from all networks...');

    const results = await Promise.all(
      Object.entries(this.sdkMap).map(async ([chain, sdk]) => {
        try {
          const res = await sdk.Vaults();
          this.logger.debug(
            `Fetched ${res.vaults.length} vaults from ${chain}`,
          );
          return { chain, vaults: res.vaults };
        } catch (err) {
          this.logger.error(
            `Error fetching vaults from ${chain}: ${err.message}`,
          );
          return { chain, vaults: [] };
        }
      }),
    );

    return results;
  }

  async ask(question: string): Promise<HarvestMessage> {
    this.logger.debug(`Question: ${JSON.stringify(question)}`);

    const vaults = await this.getVaultsByChain();
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    messages.push({
      role: 'system',
      content: `You are a professional financial advisor for the Harvest Finance crypto platform. Your role is to answer user questions and provide guidance on Harvest’s DeFi vaults. You have access to the following updated list of vaults for Ethereum, Polygon, Base and Arbitrum chains in JSON format:

  ${JSON.stringify(vaults)}

Respond accurately and helpfully, using the data provided. If any information is missing or unclear, clarify what’s needed or respond with the best estimate based on the known data. Always highlight risks and disclaimers where necessary, and refrain from sharing incorrect or speculative details.
`,
    });
    messages.push({
      role: 'user',
      content: question,
    });
    const response = await this.aiService.send(messages);
    this.logger.debug(`Response: ${JSON.stringify(response)}`);
    return {
      message: response.choices[0].message.content,
    } as HarvestMessage;
  }
}
