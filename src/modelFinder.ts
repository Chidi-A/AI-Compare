// Define interfaces for our data structures
interface LLMModel {
  name: string;
  intelligence: number;
  speed: number;
  mmluPro: number;
  contextWindow: number;
  tags: string[];
  logo: string;
  creator: string;
  summary: string;
  [key: string]: any; // For dynamic property access
}

interface UseCaseCriteria {
  features: string[];
  tags: string[];
  minIntelligence?: number;
  minMmluPro?: number;
  minSpeed?: number;
  minContextWindow?: number;
  hasVision?: boolean;
  preferredModels?: string[];
  scoreMultiplier?: (model: LLMModel) => number;
}

// Map use cases to relevant model features and tags
const useCaseMapping: Record<string, UseCaseCriteria> = {
  content: {
    features: ['intelligence', 'speed'],
    tags: ['Intelligence', 'Reasoning'],
    minIntelligence: 40,
  },
  data: {
    features: ['intelligence', 'mmluPro'],
    tags: ['Intelligence', 'Knowledge'],
    minMmluPro: 70,
  },
  customer: {
    features: ['speed', 'intelligence'],
    tags: ['Affordable'],
    minSpeed: 100,
  },
  research: {
    features: ['intelligence', 'mmluPro', 'contextWindow'],
    tags: ['Intelligence', 'Knowledge'],
    minContextWindow: 128000,
  },
  image: {
    features: ['intelligence'],
    tags: ['Intelligence'],
    hasVision: true,
  },
  code: {
    features: ['intelligence', 'mmluPro'],
    tags: ['Intelligence', 'Knowledge'],
    minIntelligence: 45,
    minMmluPro: 70,
    preferredModels: ['Qwen', 'DeepSeek', 'Claude', 'GPT'], // Models known for code
    scoreMultiplier: function (model: LLMModel): number {
      // Give bonus points to models good at code
      if (
        model.name.toLowerCase().includes('coder') ||
        model.summary.toLowerCase().includes('code')
      ) {
        return 1.5;
      }
      // Give bonus to preferred model families
      if (
        this.preferredModels?.some((name: string) => model.name.includes(name))
      ) {
        return 1.3;
      }
      return 1;
    },
  },
};

export class ModelFinder {
  private models: LLMModel[];

  constructor(models: LLMModel[]) {
    this.models = models;
    this.initializeListeners();
  }

  private initializeListeners(): void {
    // Listen for use case button clicks
    const caseButtons = document.querySelectorAll('.case-button');
    caseButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const useCase = (button as HTMLElement).dataset.case;
        if (useCase) {
          this.handleUseCaseSelection(useCase);
        }
      });
    });

    // Add form submit handling
    const textarea = document.querySelector(
      '#use-case-description'
    ) as HTMLTextAreaElement | null;
    const form = textarea?.closest('.use-case-input') as HTMLElement | null;

    if (textarea && form) {
      // Create and add a submit button
      const submitButton = document.createElement('button');
      submitButton.className = 'submit-button';
      submitButton.textContent = 'Find Models';
      form.appendChild(submitButton);

      // Handle form submission
      submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleTextInput(textarea.value);
      });

      // Also submit on Enter key (while holding Shift for new lines)
      textarea.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleTextInput(textarea.value);
        }
      });
    }
  }

  public findRecommendedModels(useCase: string): LLMModel[] {
    const criteria = useCaseMapping[useCase];
    if (!criteria) return [];

    return this.models
      .filter((model) => {
        // Check minimum requirements
        if (
          criteria.minIntelligence &&
          model.intelligence < criteria.minIntelligence
        )
          return false;
        if (criteria.minMmluPro && model.mmluPro < criteria.minMmluPro)
          return false;
        if (criteria.minSpeed && model.speed < criteria.minSpeed) return false;
        if (
          criteria.minContextWindow &&
          model.contextWindow < criteria.minContextWindow
        )
          return false;
        if (criteria.hasVision && !model.name.toLowerCase().includes('vision'))
          return false;

        // Check if model has any of the required tags
        return criteria.tags.some((tag) =>
          model.tags.some(
            (modelTag) => modelTag.toLowerCase() === tag.toLowerCase()
          )
        );
      })
      .sort((a, b) => {
        // Calculate weighted score based on use case features
        const getScore = (model: LLMModel): number => {
          const baseScore = criteria.features.reduce((score, feature) => {
            return score + (model[feature] || 0);
          }, 0);

          // Apply use case specific multiplier if exists
          const multiplier = criteria.scoreMultiplier
            ? criteria.scoreMultiplier(model)
            : 1;
          return baseScore * multiplier;
        };
        return getScore(b) - getScore(a);
      })
      .slice(0, 3); // Get top 3 recommendations
  }

  public handleUseCaseSelection(useCase: string): void {
    // Remove active state from all buttons
    document.querySelectorAll('.case-button').forEach((btn) => {
      btn.classList.remove('active');
    });

    // Add active state to selected button
    const selectedButton = document.querySelector(`[data-case="${useCase}"]`);
    if (selectedButton) {
      selectedButton.classList.add('active');
    }

    const recommendedModels = this.findRecommendedModels(useCase);
    this.updateRecommendations(recommendedModels);
  }

  public handleTextInput(text: string): void {
    if (text.length < 5) return;

    const textLower = text.toLowerCase();

    // If text includes code-related terms, use code recommendations
    if (
      textLower.includes('code') ||
      textLower.includes('programming') ||
      textLower.includes('develop') ||
      textLower.includes('function') ||
      textLower.includes('algorithm')
    ) {
      this.handleUseCaseSelection('code');
      return;
    }

    // Get top models based on intelligence and overall capabilities
    const recommendedModels = this.models
      .sort((a, b) => {
        // Calculate a general score based on key metrics
        const getScore = (model: LLMModel): number => {
          return (
            model.intelligence * 0.4 + // Weight intelligence heavily
            model.mmluPro * 0.3 + // Consider knowledge/reasoning
            model.speed * 0.2 + // Factor in speed
            (model.contextWindow / 100000) * 0.1 // Bonus for context window
          );
        };
        return getScore(b) - getScore(a);
      })
      .slice(0, 3); // Get top 3 models

    this.updateRecommendations(recommendedModels);
  }

  private updateRecommendations(models: LLMModel[]): void {
    const recommendationsGrid = document.querySelector('.recommendations-grid');
    if (!recommendationsGrid) return;

    if (!models.length) {
      recommendationsGrid.innerHTML = `
        <div class="recommendation-placeholder">
          <p>Select a use case or describe your needs to see recommended models</p>
        </div>
      `;
      return;
    }

    recommendationsGrid.innerHTML = models
      .map(
        (model) => `
      <div class="model-card">
        <div class="model-card-header">
          <div class="model-logo">
            <img src="${model.logo}" alt="${model.name} logo" />
          </div>
          <span class="model-provider">${model.creator}</span>
        </div>
        <h3 class="model-name">${model.name}</h3>
        <p class="model-summary">${model.summary}</p>
        <div class="model-tags">
          ${model.tags
            .map(
              (tag) =>
                `<span class="model-tag tag-${tag.toLowerCase()}">${tag}</span>`
            )
            .join('')}
        </div>
      </div>
    `
      )
      .join('');
  }
}
