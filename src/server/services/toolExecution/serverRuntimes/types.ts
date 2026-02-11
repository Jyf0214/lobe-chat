import { type ToolExecutionContext } from '../types';

/**
 * Factory function type for creating server runtimes
 * Can be synchronous or asynchronous
 */
export type ServerRuntimeFactory = (context: ToolExecutionContext) => any | Promise<any>;

/**
 * Server runtime registration object
 */
export interface ServerRuntimeRegistration {
  factory: ServerRuntimeFactory;
  identifier: string;
}
