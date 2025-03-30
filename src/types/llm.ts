export interface LLMModel {
  name: string;
  creator: string; // Company/Organization that created the model
  intelligence: number; // Artificial Analysis Intelligence Index
  speed: number; // Output Tokens per Second
  inputPrice: number; // USD/1M Tokens
  outputPrice: number; // USD/1M Tokens
  mmluPro: number; // Reasoning & Knowledge percentage
  contextWindow: number; // In tokens
  logo: string; // Add this property
  summary: string; // Summary of the model
  tags: string[]; // Tags for the model
}
