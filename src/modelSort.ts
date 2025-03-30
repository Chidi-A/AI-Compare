import { llmModels } from './data/llmModels';

// Define the LLMModel interface
interface LLMModel {
  name: string;
  creator: string;
  summary: string;
  logo?: string;
  tags: string[];
  intelligence: number;
  reasoning?: number;
  knowledge?: number;
  contextWindow: number;
  pricing?: {
    input: number;
    output: number;
  };
  description?: string;
  speed?: number;
  outputPrice?: number;
  mmluPro?: number;
}

export function sortModels(
  models: LLMModel[],
  filterValue: string
): LLMModel[] {
  const sortedModels = [...models];

  switch (filterValue) {
    case 'intelligence':
      return sortedModels.sort((a, b) => b.intelligence - a.intelligence);

    case 'high-performance':
      return sortedModels.sort((a, b) => (b.speed || 0) - (a.speed || 0));

    case 'affordable':
      // Sort by outputPrice, handling free (0) prices as most affordable
      return sortedModels.sort((a, b) => {
        const priceA = a.outputPrice || 0;
        const priceB = b.outputPrice || 0;
        if (priceA === 0 && priceB === 0) return 0;
        if (priceA === 0) return -1;
        if (priceB === 0) return 1;
        return priceA - priceB;
      });

    case 'reasoning':
      return sortedModels.sort((a, b) => (b.mmluPro || 0) - (a.mmluPro || 0));

    case 'context':
      return sortedModels.sort((a, b) => b.contextWindow - a.contextWindow);

    default:
      return sortedModels;
  }
}

export function initializeFilters(
  renderModelCards: (models: LLMModel[]) => void
): void {
  const radioButtons = document.querySelectorAll<HTMLInputElement>(
    '.filter-radio input[type="radio"]'
  );

  radioButtons.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      // Remove selected class from all radio labels
      document.querySelectorAll('.filter-radio').forEach((label) => {
        label.classList.remove('selected');
      });

      // Add selected class to the clicked radio's label
      const target = e.target as HTMLInputElement;
      target.closest('.filter-radio')?.classList.add('selected');

      // Sort and render models
      const sortedModels = sortModels(llmModels, target.value);
      renderModelCards(sortedModels);
    });
  });
}

// Initialize sorting
export function initializeModelSort(
  renderModelCards: (models: LLMModel[]) => void
): void {
  document.addEventListener('DOMContentLoaded', () => {
    const sortedModels = sortModels(llmModels, 'intelligence');
    renderModelCards(sortedModels);
    initializeFilters(renderModelCards);
  });
}
