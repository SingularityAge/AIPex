/**
 * Agent Configuration for OpenRouter API
 *
 * This module manages AI agent configurations with appropriate parameters
 * for different agent types (planner, navigator, visual, etc.)
 */

import { Storage } from "~/lib/storage";

export type AgentType = "planner" | "navigator" | "visual" | "analyst" | "executor";

export interface AgentConfig {
  name: string;
  type: AgentType;
  model: string;
  temperature: number;
  description: string;
  isVisual: boolean; // Indicates if this agent needs vision capabilities
}

export interface AgentConfigs {
  planner: AgentConfig;
  navigator: AgentConfig;
  visual: AgentConfig;
  analyst: AgentConfig;
  executor: AgentConfig;
}

// Default agent configurations with OpenRouter-compatible settings
export const DEFAULT_AGENT_CONFIGS: AgentConfigs = {
  planner: {
    name: "Planner",
    type: "planner",
    model: "anthropic/claude-3.5-sonnet",
    temperature: 0.7, // Higher temperature for creative planning
    description: "Plans and strategizes multi-step tasks",
    isVisual: false,
  },
  navigator: {
    name: "Navigator",
    type: "navigator",
    model: "anthropic/claude-3.5-sonnet",
    temperature: 0.1, // Low temperature for deterministic navigation
    description: "Navigates browser tabs, windows, and UI elements",
    isVisual: false,
  },
  visual: {
    name: "Visual Analyst",
    type: "visual",
    model: "anthropic/claude-3.5-sonnet", // Vision-capable model
    temperature: 0.3, // Moderate temperature for visual analysis
    description: "Analyzes images, screenshots, and visual content",
    isVisual: true,
  },
  analyst: {
    name: "Content Analyst",
    type: "analyst",
    model: "anthropic/claude-3.5-sonnet",
    temperature: 0.4, // Moderate temperature for analysis
    description: "Analyzes web content, extracts information, and summarizes",
    isVisual: false,
  },
  executor: {
    name: "Executor",
    type: "executor",
    model: "anthropic/claude-3.5-sonnet",
    temperature: 0.2, // Low temperature for precise execution
    description: "Executes browser actions, form filling, and interactions",
    isVisual: false,
  },
};

const storage = new Storage();

export class AgentConfigManager {
  private static STORAGE_KEY = "agent_configs";

  /**
   * Get all agent configurations
   */
  static async getConfigs(): Promise<AgentConfigs> {
    try {
      const stored = await storage.get<AgentConfigs>(this.STORAGE_KEY);
      if (stored) {
        // Merge with defaults to ensure all agents exist
        return {
          ...DEFAULT_AGENT_CONFIGS,
          ...stored,
        };
      }
      return DEFAULT_AGENT_CONFIGS;
    } catch (error) {
      console.error("Failed to load agent configs:", error);
      return DEFAULT_AGENT_CONFIGS;
    }
  }

  /**
   * Get a specific agent configuration
   */
  static async getConfig(agentType: AgentType): Promise<AgentConfig> {
    const configs = await this.getConfigs();
    return configs[agentType];
  }

  /**
   * Update all agent configurations
   */
  static async updateConfigs(configs: Partial<AgentConfigs>): Promise<void> {
    try {
      const current = await this.getConfigs();
      const updated = {
        ...current,
        ...configs,
      };
      await storage.set(this.STORAGE_KEY, updated);
    } catch (error) {
      console.error("Failed to save agent configs:", error);
      throw error;
    }
  }

  /**
   * Update a specific agent configuration
   */
  static async updateConfig(
    agentType: AgentType,
    config: Partial<AgentConfig>
  ): Promise<void> {
    try {
      const configs = await this.getConfigs();
      configs[agentType] = {
        ...configs[agentType],
        ...config,
      };
      await storage.set(this.STORAGE_KEY, configs);
    } catch (error) {
      console.error("Failed to save agent config:", error);
      throw error;
    }
  }

  /**
   * Reset to default configurations
   */
  static async resetToDefaults(): Promise<void> {
    try {
      await storage.set(this.STORAGE_KEY, DEFAULT_AGENT_CONFIGS);
    } catch (error) {
      console.error("Failed to reset agent configs:", error);
      throw error;
    }
  }

  /**
   * Determine which agent to use based on the task
   */
  static determineAgent(
    messageContent: string,
    hasImages: boolean
  ): AgentType {
    // Use visual agent if images are present
    if (hasImages) {
      return "visual";
    }

    const lowerContent = messageContent.toLowerCase();

    // Planning keywords
    if (
      /\b(plan|organize|strategy|multi-step|complex|workflow)\b/.test(lowerContent)
    ) {
      return "planner";
    }

    // Navigation keywords
    if (
      /\b(switch|navigate|go to|open|close|tab|window|visit)\b/.test(lowerContent)
    ) {
      return "navigator";
    }

    // Analysis keywords
    if (
      /\b(analyze|summarize|extract|read|understand|explain|compare)\b/.test(lowerContent)
    ) {
      return "analyst";
    }

    // Execution keywords
    if (
      /\b(fill|submit|click|type|select|interact|execute)\b/.test(lowerContent)
    ) {
      return "executor";
    }

    // Default to planner for ambiguous tasks
    return "planner";
  }
}

/**
 * OpenRouter API configuration
 */
export interface OpenRouterConfig {
  apiKey: string;
  baseUrl: string;
}

export const DEFAULT_OPENROUTER_CONFIG: OpenRouterConfig = {
  apiKey: "",
  baseUrl: "https://openrouter.ai/api/v1/chat/completions",
};

export class OpenRouterConfigManager {
  private static STORAGE_KEY = "openrouter_config";

  static async getConfig(): Promise<OpenRouterConfig> {
    try {
      const stored = await storage.get<OpenRouterConfig>(this.STORAGE_KEY);
      return stored || DEFAULT_OPENROUTER_CONFIG;
    } catch (error) {
      console.error("Failed to load OpenRouter config:", error);
      return DEFAULT_OPENROUTER_CONFIG;
    }
  }

  static async updateConfig(config: Partial<OpenRouterConfig>): Promise<void> {
    try {
      const current = await this.getConfig();
      const updated = {
        ...current,
        ...config,
      };
      await storage.set(this.STORAGE_KEY, updated);
    } catch (error) {
      console.error("Failed to save OpenRouter config:", error);
      throw error;
    }
  }
}
