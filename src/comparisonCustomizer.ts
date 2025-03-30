export class ComparisonCustomizer {
  private models: LLMModel[] = [];
  private rankings: string[] = [];

  constructor(models: LLMModel[]) {
    if (!models || !Array.isArray(models)) {
      console.error('Invalid models data provided to ComparisonCustomizer');
      return;
    }

    this.models = models;
    this.rankings = [
      'Context Window Size',
      'Reasoning Capabilities',
      'Speed & Performance',
      'Cost Efficiency',
    ];
    this.initializeDragAndDrop();
    this.initializeSliders();

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  initializeDragAndDrop(): void {
    const rankingList = document.querySelector('.ranking-list');
    if (!rankingList) return;

    const items = rankingList.querySelectorAll('.ranking-item');

    items.forEach((item) => {
      item.addEventListener('dragstart', () => {
        item.classList.add('dragging');
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        this.updateRecommendations();
      });
    });

    rankingList.addEventListener('dragover', (e: Event) => {
      e.preventDefault();
      const dragEvent = e as DragEvent;
      const draggingItem = document.querySelector('.dragging');
      const siblings = [
        ...rankingList.querySelectorAll('.ranking-item:not(.dragging)'),
      ];

      const nextSibling = siblings.find((sibling) => {
        const box = sibling.getBoundingClientRect();
        return dragEvent.clientY <= box.top + box.height / 2;
      });

      if (draggingItem) {
        rankingList.insertBefore(draggingItem, nextSibling || null);
      }
    });
  }

  initializeSliders(): void {
    const sliders = {
      context: document.getElementById('context-slider'),
      reasoning: document.getElementById('reasoning-slider'),
      speed: document.getElementById('speed-slider'),
      cost: document.getElementById('cost-slider'),
    };

    // Update slider value displays and trigger recommendations update
    Object.entries(sliders).forEach(([key, slider]) => {
      if (!slider || !slider.parentElement) return;
      const valueDisplay = slider.parentElement.querySelector('.slider-value');
      if (!valueDisplay) return;

      slider.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const value = parseInt(target.value);
        let displayText = '';

        switch (key) {
          case 'context':
            displayText = this.getContextWindowText(value);
            break;
          case 'reasoning':
            displayText = this.getCapabilityText(value);
            break;
          case 'speed':
            displayText = this.getSpeedText(value);
            break;
          case 'cost':
            displayText = this.getCostText(value);
            break;
        }

        valueDisplay.textContent = displayText;
        this.updateRecommendations();
      });
    });
  }

  getContextWindowText(value: number): string {
    if (value < 25) return '8K tokens';
    if (value < 50) return '32K tokens';
    if (value < 75) return '100K tokens';
    return '128K+ tokens';
  }

  getCapabilityText(value: number): string {
    if (value < 25) return 'Basic';
    if (value < 50) return 'Moderate';
    if (value < 75) return 'High';
    return 'Advanced';
  }

  getSpeedText(value: number): string {
    if (value < 25) return 'Standard';
    if (value < 50) return 'Fast';
    if (value < 75) return 'Very Fast';
    return 'Ultra Fast';
  }

  getCostText(value: number): string {
    if (value < 25) return 'Economy';
    if (value < 50) return 'Balanced';
    if (value < 75) return 'Premium';
    return 'Enterprise';
  }

  getCurrentRankings(): string[] {
    return [...document.querySelectorAll('.ranking-item')].map(
      (item) => item.querySelector('span')?.textContent || ''
    );
  }

  getSliderValues(): {
    context: number;
    reasoning: number;
    speed: number;
    cost: number;
  } {
    return {
      context: parseInt(
        (document.getElementById('context-slider') as HTMLInputElement)
          ?.value || '0'
      ),
      reasoning: parseInt(
        (document.getElementById('reasoning-slider') as HTMLInputElement)
          ?.value || '0'
      ),
      speed: parseInt(
        (document.getElementById('speed-slider') as HTMLInputElement)?.value ||
          '0'
      ),
      cost: parseInt(
        (document.getElementById('cost-slider') as HTMLInputElement)?.value ||
          '0'
      ),
    };
  }

  updateRecommendations(): void {
    if (!this.models || !Array.isArray(this.models)) {
      console.error('No valid models data available');
      return;
    }

    const rankings = this.getCurrentRankings();
    const sliderValues = this.getSliderValues();

    console.log('Updating recommendations with:', {
      rankings,
      sliderValues,
      totalModels: this.models.length,
    });

    // Filter models based on minimum requirements
    let filteredModels = this.models.filter((model: LLMModel) => {
      // Handle null/undefined values
      const contextWindow = model.contextWindow || 0;
      const intelligence = model.intelligence || 0;
      const speed = model.speed || 0;
      const cost = model.costPer1000 || model.outputPrice || 999;

      // More lenient filtering criteria
      const meetsContext =
        contextWindow >=
        this.getMinContextRequirement(sliderValues.context) * 0.5;
      const meetsReasoning = intelligence >= sliderValues.reasoning * 0.6;
      const meetsSpeed = speed >= sliderValues.speed * 0.5;
      const meetsCost =
        cost <= this.getMaxCostRequirement(sliderValues.cost) * 2;

      // Model passes if it meets at least 2 criteria
      const criteria = [meetsContext, meetsReasoning, meetsSpeed, meetsCost];
      return criteria.filter(Boolean).length >= 2;
    });

    console.log('Filtered models:', filteredModels.length);

    // If too few models, use all models
    if (filteredModels.length < 3) {
      console.log('Using all models due to strict filtering');
      filteredModels = this.models;
    }

    // Score the models
    const scoredModels = filteredModels.map((model: LLMModel) => {
      let score = 0;

      // Calculate base scores
      const scores = {
        context: this.calculateContextScore(
          model.contextWindow,
          sliderValues.context
        ),
        reasoning: this.calculateReasoningScore(
          model.intelligence,
          sliderValues.reasoning
        ),
        speed: this.calculateSpeedScore(model.speed, sliderValues.speed),
        cost: this.calculateCostScore(
          model.costPer1000 || model.outputPrice || 0,
          sliderValues.cost
        ),
      };

      // Apply ranking weights
      rankings.forEach((feature, index) => {
        const weight = Math.pow(0.75, index); // Exponential decay for rankings
        switch (feature) {
          case 'Context Window Size':
            score += scores.context * weight * 100;
            break;
          case 'Reasoning Capabilities':
            score += scores.reasoning * weight * 100;
            break;
          case 'Speed & Performance':
            score += scores.speed * weight * 100;
            break;
          case 'Cost Efficiency':
            score += scores.cost * weight * 100;
            break;
        }
      });

      // Apply bonuses for advanced models
      const advancedModels = [
        'deepseek',
        'claude',
        'gpt-4',
        'palm',
        'gemini',
        'qwen',
        'yi',
        'mixtral',
        'llama',
        'vicuna',
        'mistral',
      ];

      const modelNameLower = model.name.toLowerCase();

      // Tiered bonuses
      if (
        ['gpt-4', 'claude-2', 'deepseek-coder'].some((name) =>
          modelNameLower.includes(name)
        )
      ) {
        score *= 1.2; // 20% bonus
      } else if (advancedModels.some((name) => modelNameLower.includes(name))) {
        score *= 1.1; // 10% bonus
      }

      // Bonus for high capabilities
      if (model.intelligence >= 85) score *= 1.1;
      if (model.mmluPro > 70) score *= 1.1;

      return { model, score };
    });

    // Get top 3 recommendations with diversity
    const recommendations: LLMModel[] = [];
    const usedProviders = new Set<string>();

    // Sort by score
    const sortedModels = scoredModels.sort((a, b) => b.score - a.score);

    // First, add the highest scored model
    if (sortedModels.length > 0) {
      recommendations.push(sortedModels[0].model);
      usedProviders.add(sortedModels[0].model.creator);
    }

    // Then add diverse models
    for (const scored of sortedModels) {
      if (recommendations.length >= 3) break;

      if (!usedProviders.has(scored.model.creator)) {
        recommendations.push(scored.model);
        usedProviders.add(scored.model.creator);
      }
    }

    // If we still need more, add highest scoring remaining models
    while (
      recommendations.length < 3 &&
      sortedModels.length > recommendations.length
    ) {
      const nextModel = sortedModels[recommendations.length].model;
      if (!recommendations.includes(nextModel)) {
        recommendations.push(nextModel);
      }
    }

    console.log(
      'Final recommendations:',
      recommendations.map((m) => ({
        name: m.name,
        creator: m.creator,
        score: scoredModels.find((sm) => sm.model === m)?.score,
      }))
    );

    // Display the recommendations
    this.displayRecommendations(recommendations);
  }

  displayRecommendations(recommendations: LLMModel[]): void {
    const grid = document.querySelector(
      '.personalized-recommendations .personalized-grid'
    );

    if (!grid) {
      console.error('Recommendations grid not found');
      return;
    }

    grid.innerHTML = '';

    if (!recommendations || recommendations.length === 0) {
      grid.innerHTML = `
        <div class="recommendation-placeholder">
          <p>Adjust the settings above to see personalized model recommendations</p>
        </div>
      `;
      return;
    }

    recommendations.forEach((model) => {
      const card = document.createElement('div');
      card.className = 'model-card';

      // Create card HTML without duplicate tags
      card.innerHTML = `
        <div class="model-card-header">
          <div class="model-logo">
            <img 
              src="${model.logo || ''}" 
              alt="${model.name} logo" 
              onerror="this.src='/logos/generic-ai-icon.svg'"
            />
          </div>
          <span class="model-provider">${model.creator || ''}</span>
        </div>
        <h3 class="model-name">${model.name || ''}</h3>
        <p class="model-summary">${model.summary || ''}</p>
        <div class="model-tags">
          ${this.createModelTags(model)}
        </div>
      `;

      grid.appendChild(card);
    });
  }

  // Helper method to create model tags
  createModelTags(model: LLMModel): string {
    const tags = [
      `<span class="model-tag tag-${model.creator
        ?.toLowerCase()
        .replace(/\s+/g, '')}">${model.creator}</span>`,
    ];

    if (model.tags && Array.isArray(model.tags)) {
      model.tags.slice(1).forEach((tag: string) => {
        const tagClass = tag.toLowerCase().replace(/\s+/g, '');
        tags.push(`<span class="model-tag tag-${tagClass}">${tag}</span>`);
      });
    }

    return tags.join('');
  }

  // Helper method to format context window size
  formatContextWindow(size: number): string {
    if (size >= 1000000) {
      return `${(size / 1000000).toFixed(1)}M ctx`;
    } else if (size >= 1000) {
      return `${(size / 1000).toFixed(0)}K ctx`;
    }
    return `${size} ctx`;
  }

  // Helper methods
  normalizeScore(value: number, min: number, max: number): number {
    return Math.min(1, Math.max(0, (value - min) / (max - min)));
  }

  getMinContextRequirement(sliderValue: number): number {
    if (sliderValue < 25) return 4000; // More lenient minimum
    if (sliderValue < 50) return 16000; // Reduced from 32K
    if (sliderValue < 75) return 32000; // Reduced from 100K
    return 64000; // Reduced from 128K
  }

  getMaxCostRequirement(sliderValue: number): number {
    if (sliderValue < 25) return 200; // More lenient maximum
    if (sliderValue < 50) return 100; // More lenient balanced
    if (sliderValue < 75) return 50; // More lenient premium
    return 25; // More lenient enterprise
  }

  // Helper methods with improved calculations
  calculateContextScore(contextWindow: number, sliderValue: number): number {
    const requirement = this.getMinContextRequirement(sliderValue);
    return Math.min(1, (contextWindow || 0) / requirement);
  }

  calculateReasoningScore(intelligence: number, sliderValue: number): number {
    return Math.min(1, (intelligence || 0) / sliderValue);
  }

  calculateSpeedScore(speed: number, sliderValue: number): number {
    return Math.min(1, (speed || 0) / sliderValue);
  }

  calculateCostScore(cost: number, sliderValue: number): number {
    const maxCost = this.getMaxCostRequirement(sliderValue);
    return maxCost ? Math.max(0, 1 - (cost || 999) / maxCost) : 0.5;
  }

  initialize(): void {
    console.log(
      'Initializing ComparisonCustomizer with models:',
      this.models.length
    );

    // Ensure we have the recommendations grid
    const grid = document.querySelector(
      '.personalized-recommendations .personalized-grid'
    );
    if (!grid) {
      console.error('Could not find recommendations grid');
      return;
    }

    // Show initial recommendations
    this.updateRecommendations();
  }
}

// Define the LLMModel interface based on usage in the code
interface LLMModel {
  name: string;
  intelligence: number;
  speed: number;
  mmluPro: number;
  contextWindow: number;
  tags: string[];
  logo?: string;
  creator: string;
  summary?: string;
  costPer1000?: number;
  outputPrice?: number;
  [key: string]: any; // For dynamic property access
}
