// Create a new file for loading model cards from data
import { llmModels } from './data/llmModels';
import { ComparisonTray } from './comparisonTray.ts';
import { sortModels, initializeFilters } from './modelSort.ts';
import { ModelSearch } from './modelSearch';

// Define types for model objects
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

// Add these variables at the top of the file
let currentPage = 1;
const modelsPerPage = 10;
let currentModels: LLMModel[] = []; // Store the current filtered/sorted models
let globalComparisonTray: ComparisonTray; // Add this to store the comparisonTray instance
let modelSearch: ModelSearch;

export function initializeModelCards(comparisonTray: ComparisonTray): void {
  globalComparisonTray = comparisonTray;
  const modelsGrid = document.querySelector('.models-grid');
  const filterRadios = document.querySelectorAll<HTMLInputElement>(
    '.filter-radio input[type="radio"]'
  );

  // Initialize search with a modified callback that doesn't affect the customizer
  modelSearch = new ModelSearch((searchTerm: string) => {
    currentPage = 1;
    // Only update the models grid, not the customizer
    const filteredModels = searchTerm
      ? currentModels.filter((model) => {
          const searchableText =
            `${model.name} ${model.creator} ${model.summary}`.toLowerCase();
          return searchableText.includes(searchTerm.toLowerCase());
        })
      : currentModels;

    renderModelCards(filteredModels);
  });

  // Clear existing cards
  if (modelsGrid) {
    modelsGrid.innerHTML = '';
  }

  // Initialize with sorted models
  currentModels = sortModels(llmModels, 'intelligence');
  renderModelCards(currentModels);

  // Set up filter functionality
  filterRadios.forEach((radio) => {
    radio.addEventListener('change', function (this: HTMLInputElement) {
      const category = this.value;
      currentPage = 1;

      document.querySelectorAll('.filter-radio').forEach((r) => {
        r.classList.remove('selected');
      });
      this.closest('.filter-radio')?.classList.add('selected');

      currentModels = sortModels(llmModels, category);
      renderModelCards(currentModels);
    });
  });
}

function updateDisplayedModels(): void {
  const searchTerm = modelSearch.getCurrentSearchTerm();
  let filteredModels = currentModels;

  // Apply search filter if there's a search term
  if (searchTerm) {
    filteredModels = currentModels.filter((model) => {
      const searchableText =
        `${model.name} ${model.creator} ${model.summary}`.toLowerCase();
      return searchableText.includes(searchTerm);
    });
  }

  // Show no results message if needed
  const modelsGrid = document.querySelector('.models-grid');
  if (filteredModels.length === 0 && modelsGrid) {
    modelsGrid.innerHTML = `
      <div class="no-results">
        <p>No models found matching "${searchTerm}"</p>
      </div>
    `;
    updateLoadMoreButton(false);
    return;
  }

  // Render the current page of filtered models
  renderModelCards(filteredModels);
}

function renderModelCards(models: LLMModel[]): void {
  const modelsGrid = document.querySelector('.models-grid');
  if (!modelsGrid) return;

  if (currentPage === 1) {
    if (!document.querySelector('.models-container')) {
      const container = document.createElement('div');
      container.className = 'models-container';
      if (modelsGrid.parentNode) {
        modelsGrid.parentNode.insertBefore(container, modelsGrid);
        container.appendChild(modelsGrid);
      }
    }
    modelsGrid.innerHTML = '';
  }

  const startIndex = (currentPage - 1) * modelsPerPage;
  const endIndex = startIndex + modelsPerPage;
  const modelsToShow = models.slice(startIndex, endIndex);

  modelsToShow.forEach((model) => {
    const isSelected = globalComparisonTray
      .getSelectedModels()
      .some((m) => m.name === model.name);

    const cardHTML = `
      <div class="model-card ${isSelected ? 'selected' : ''}" data-model-id="${
      model.name
    }">
        <div class="model-card-header">
          <div class="model-logo">
            <img src="${model.logo}" alt="${
      model.creator
    } logo" onerror="this.src='/logos/generic-ai-icon.svg'">
          </div>
          <div class="check-indicator">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="var(--grey-900)"/>
              <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <h3 class="model-name">${model.name}</h3>
        <p class="model-summary">${model.summary}</p>
        <div class="model-tags">
          ${createModelTags(model)}
        </div>
      </div>
    `;

    modelsGrid.insertAdjacentHTML('beforeend', cardHTML);
  });

  // Add click handlers to cards
  modelsGrid.querySelectorAll('.model-card').forEach((card) => {
    const cardElement = card as HTMLElement;
    if (!(cardElement as any).hasListener) {
      // Prevent duplicate listeners
      const modelName = cardElement.dataset.modelId;
      const model = models.find((m) => m.name === modelName);

      cardElement.addEventListener('click', () => {
        if (!model) return;

        if (cardElement.classList.contains('selected')) {
          // Deselect
          cardElement.classList.remove('selected');
          globalComparisonTray.removeModel(model);
        } else {
          // Select
          if (globalComparisonTray.getSelectedModels().length >= 4) {
            alert('Maximum 4 models can be compared at once');
            return;
          }

          const added = globalComparisonTray.addModel(model);
          if (added) {
            cardElement.classList.add('selected');
            // Update all instances of this model card
            document
              .querySelectorAll(`.model-card[data-model-id="${modelName}"]`)
              .forEach((c) => c.classList.add('selected'));
          }
        }

        // Debug log
        console.log(
          'Current selected models:',
          globalComparisonTray.getSelectedModels()
        );
      });

      (cardElement as any).hasListener = true; // Mark as having a listener
    }
  });

  updateLoadMoreButton(models.length > endIndex);
}

// Helper function to create model tags
function createModelTags(model: LLMModel): string {
  const tags = [
    `<span class="model-tag tag-${model.creator
      .toLowerCase()
      .replace(/\s+/g, '')}">${model.creator}</span>`,
  ];

  model.tags.slice(1).forEach((tag: string) => {
    const tagClass = tag.toLowerCase().replace(/\s+/g, '');
    tags.push(`<span class="model-tag tag-${tagClass}">${tag}</span>`);
  });

  return tags.join('');
}

function updateLoadMoreButton(showButton: boolean): void {
  let loadMoreButton = document.querySelector('.load-more-button');

  // Remove existing button if it exists
  if (loadMoreButton) {
    loadMoreButton.remove();
  }

  // Add button if there are more models to show
  if (showButton) {
    const modelsContainer = document.querySelector('.models-container');
    if (!modelsContainer) return;

    loadMoreButton = document.createElement('div');
    loadMoreButton.className = 'load-more-button';
    loadMoreButton.innerHTML = `
      <button class="btn btn-secondary">
        Load More Models
      </button>
    `;

    // Insert at the end of the models container
    modelsContainer.appendChild(loadMoreButton);

    // Add click event listener
    const button = loadMoreButton.querySelector('button');
    if (button) {
      button.addEventListener('click', () => {
        currentPage++;
        console.log('Loading more models, page:', currentPage);
        updateDisplayedModels();
      });
    }
  }
}

function getLogoPath(provider: string): string {
  // Map provider names to logo paths
  const logoPathByCreator: Record<string, string> = {
    OpenAI: '/logos/openailogo.svg',
    Anthropic: '/logos/claudelogo.svg',
    Google: '/logos/google-gemini-icon.svg',
    Meta: '/logos/meta-icon.svg',
    'Mistral AI': '/logos/mistral-ai-icon.svg',
    xAI: '/logos/grok-logo-icon.svg',
    Amazon: '/logos/nova.svg',
    Perplexity: '/logos/perplexity-ai-icon.svg',
    // Add other providers as needed
  };

  return logoPathByCreator[provider] || '/logos/generic-ai-icon.svg';
}

function getModelSummary(model: LLMModel): string {
  // Generate a summary based on model attributes
  // This is a simple example - you might want to use actual descriptions from your data
  let summary = '';

  if (model.intelligence > 90) {
    summary = 'High intelligence model with ';
  } else if (model.intelligence > 80) {
    summary = 'Solid performance model with ';
  } else {
    summary = 'Cost-effective model with ';
  }

  if (model.reasoning && model.reasoning > 85) {
    summary += 'strong reasoning capabilities';
  } else if (model.knowledge && model.knowledge > 85) {
    summary += 'excellent knowledge base';
  } else if (model.contextWindow > 100000) {
    summary += 'large context window';
  } else {
    summary += 'balanced capabilities';
  }

  if (
    model.pricing &&
    model.pricing.input !== undefined &&
    model.pricing.input < 0.3 &&
    model.pricing.output !== undefined &&
    model.pricing.output < 2
  ) {
    summary += ' at an affordable price point.';
  } else {
    summary += '.';
  }

  return model.description || summary;
}

function updateSelectedModelsCount(): void {
  const selectedCount = globalComparisonTray.getSelectedModels().length;

  // Update the counter in the UI
  const counter = document.querySelector('.selected-count');
  if (counter) {
    counter.textContent =
      selectedCount === 1
        ? '1 model selected'
        : `${selectedCount} models selected`;
  }

  // Enable/disable compare button based on selection count
  const compareBtn = document.querySelector(
    '.compare-btn'
  ) as HTMLButtonElement | null;
  if (compareBtn) {
    compareBtn.disabled = selectedCount < 2;
  }

  console.log(`${selectedCount} models selected`);
}

// Also add some styles for the counter
const styles = document.createElement('style');
styles.textContent = `
  .selected-models-counter {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid var(--grey-200);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .selected-count {
    font-family: var(--body-font);
    font-weight: 500;
    color: var(--grey-700);
  }
  
  .compare-btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
  
  .compare-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
document.head.appendChild(styles);

// Initialize with intelligence sort by default
document.addEventListener('DOMContentLoaded', () => {
  const sortedModels = sortModels(llmModels, 'intelligence');
  updateDisplayedModels();
  initializeFilters(renderModelCards);
});
