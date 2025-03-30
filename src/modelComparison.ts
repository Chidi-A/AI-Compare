import { updateModelHighlights } from './modelHighlights.ts';
import { ComparisonTray } from './comparisonTray.ts';

// Define interfaces for our data structures
interface LLMModel {
  id?: string;
  name: string;
  creator: string;
  logo?: string;
  intelligence: number;
  speed: number;
  inputPrice: number;
  outputPrice: number;
  contextWindow: number;
  mmluPro: number;
  [key: string]: any; // For dynamic property access
}

interface Feature {
  name: string;
  unit?: string;
  property: string;
  type: 'score' | 'value' | 'context' | 'text';
  isLowerBetter?: boolean;
}

interface CostCalculation {
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

// Create a new file for comparison functionality
export function initializeComparison(comparisonTray: ComparisonTray): void {
  const compareButton = document.querySelector(
    '.comparison-tray .cta-button'
  ) as HTMLButtonElement | null;
  const resultsSection = document.querySelector(
    '.comparison-results'
  ) as HTMLElement | null;
  const calculator = document.querySelector(
    '.cost-calculator'
  ) as HTMLElement | null;
  const costGrid = document.querySelector(
    '.models-cost-grid'
  ) as HTMLElement | null;

  // Initialize sliders
  const inputSlider = document.getElementById(
    'input-tokens'
  ) as HTMLInputElement | null;
  const outputSlider = document.getElementById(
    'output-tokens'
  ) as HTMLInputElement | null;
  const inputValue = document.getElementById(
    'input-tokens-value'
  ) as HTMLElement | null;
  const outputValue = document.getElementById(
    'output-tokens-value'
  ) as HTMLElement | null;

  // Add slider event listeners with separate update functions
  inputSlider?.addEventListener('input', () => {
    // Format number with commas for better readability
    if (inputValue && inputSlider) {
      inputValue.textContent = new Intl.NumberFormat().format(
        parseInt(inputSlider.value)
      );
      updateCalculatorCosts(comparisonTray.getSelectedModels() as LLMModel[]);
    }
  });

  outputSlider?.addEventListener('input', () => {
    // Format number with commas for better readability
    if (outputValue && outputSlider) {
      outputValue.textContent = new Intl.NumberFormat().format(
        parseInt(outputSlider.value)
      );
      updateCalculatorCosts(comparisonTray.getSelectedModels() as LLMModel[]);
    }
  });

  compareButton?.addEventListener('click', (e) => {
    e.preventDefault();

    const selectedModels = comparisonTray.getSelectedModels() as LLMModel[];
    console.log('Selected models:', selectedModels);

    if (selectedModels.length < 2) {
      console.log('Not enough models selected');
      return;
    }

    if (resultsSection) {
      resultsSection.style.display = 'block';
      // Hide empty states when showing results
      const emptyStates = resultsSection.querySelectorAll('.empty-state');
      emptyStates.forEach((state) => {
        if (state instanceof HTMLElement) {
          state.style.display = 'none';
        }
      });
    }

    // Show the actual content
    const comparisonTable = document.querySelector(
      '.comparison-table'
    ) as HTMLElement | null;
    const highlightsGrid = document.querySelector(
      '.highlights-grid'
    ) as HTMLElement | null;
    if (comparisonTable) comparisonTable.style.display = 'table';
    if (highlightsGrid) highlightsGrid.style.display = 'grid';

    if (calculator) {
      calculator.style.display = 'block';
    }

    updateComparisonTable(selectedModels);
    updateCalculatorCosts(selectedModels);

    resultsSection?.scrollIntoView({ behavior: 'smooth' });
  });

  function calculateCosts(model: LLMModel): CostCalculation {
    // Get current values from both sliders
    const inputTokens = inputSlider ? parseInt(inputSlider.value) : 0;
    const outputTokens = outputSlider ? parseInt(outputSlider.value) : 0;

    // Calculate costs
    const inputCost = (inputTokens / 1000000) * model.inputPrice;
    const outputCost = (outputTokens / 1000000) * model.outputPrice;
    const totalCost = inputCost + outputCost;

    return {
      inputCost,
      outputCost,
      totalCost,
    };
  }

  function createCostCard(model: LLMModel): HTMLElement {
    const card = document.createElement('div');
    card.className = 'model-cost-card';
    if (model.id) {
      card.setAttribute('data-model-id', model.id);
    }

    const costs = calculateCosts(model);

    card.innerHTML = `
      <img src="${model.logo}" alt="${model.name} logo" class="model-logo">
      <div class="model-name">${model.name}</div>
      <div class="total-cost">$${costs.totalCost.toFixed(2)}</div>
      <div class="cost-breakdown">
        $${model.inputPrice.toFixed(
          2
        )} for input + $${model.outputPrice.toFixed(2)} for output
      </div>
    `;

    return card;
  }

  function updateCalculatorCosts(selectedModels: LLMModel[]): void {
    if (!costGrid) return;

    // Clear existing cards
    costGrid.innerHTML = '';

    // Create new cards for each selected model
    selectedModels.forEach((model) => {
      const card = createCostCard(model);
      costGrid.appendChild(card);
    });

    // Log values for debugging
    console.log('Input tokens:', inputSlider?.value);
    console.log('Output tokens:', outputSlider?.value);
  }
}

function updateComparisonTable(selectedModels: LLMModel[]): void {
  const table = document.querySelector('.comparison-table');
  if (!table) {
    console.error('Comparison table not found');
    return;
  }

  const thead = table.querySelector('thead tr');
  const tbody = table.querySelector('tbody');

  if (!thead || !tbody) {
    console.error('Table structure is incomplete');
    return;
  }

  // Clear existing model columns (keep the first/feature column)
  thead.querySelectorAll('th:not(:first-child)').forEach((th) => th.remove());

  // Add selected model headers
  selectedModels.forEach((model) => {
    const th = document.createElement('th');
    th.textContent = model.name;
    thead.appendChild(th);
  });

  // Create rows for each feature
  const features: Feature[] = [
    {
      name: 'Artificial Analysis Intelligence Index',
      unit: '/100',
      property: 'intelligence',
      type: 'score',
    },
    {
      name: 'Output Speed',
      unit: 'Tokens/s',
      property: 'speed',
      type: 'value',
    },
    {
      name: 'Input Price',
      unit: 'USD/1M Tokens',
      property: 'inputPrice',
      type: 'value',
      isLowerBetter: true,
    },
    {
      name: 'Output Price',
      unit: 'USD/1M Tokens',
      property: 'outputPrice',
      type: 'value',
      isLowerBetter: true,
    },
    {
      name: 'Context Window',
      unit: 'Tokens',
      property: 'contextWindow',
      type: 'context',
    },
    {
      name: 'MMLU-PRO',
      unit: 'Reasoning & Knowledge',
      property: 'mmluPro',
      type: 'score',
    },
    {
      name: 'Creator',
      property: 'creator',
      type: 'text',
    },
  ];

  // Clear and rebuild tbody
  tbody.innerHTML = features
    .map(
      (feature) => `
    <tr>
      <td class="feature-name">
        ${feature.name}
        ${
          feature.unit
            ? `<span class="feature-unit">${feature.unit}</span>`
            : ''
        }
      </td>
      ${selectedModels
        .map((model) => {
          const value = model[feature.property];

          switch (feature.type) {
            case 'score':
              return `
              <td>
                <div class="score-indicator">
                  <span class="score-value">${value.toFixed(1)}</span>
                  <div class="score-bar">
                    <div class="score-fill" style="width: ${value}%"></div>
                  </div>
                </div>
              </td>
            `;

            case 'value':
              return `<td><span class="value">${value.toFixed(2)}</span></td>`;

            case 'context':
              return `<td><span class="value">${formatContextWindow(
                value
              )}</span></td>`;

            case 'text':
              return `<td><span class="value">${value}</span></td>`;

            default:
              return `<td><span class="value">${value}</span></td>`;
          }
        })
        .join('')}
    </tr>
  `
    )
    .join('');

  // Update the highlighting logic
  features.forEach((feature, rowIndex) => {
    if (feature.type !== 'text') {
      const row = tbody.rows[rowIndex];
      if (!row) return;

      const cells = Array.from(row.querySelectorAll('td:not(.feature-name)'));
      const values = cells.map((cell) => {
        const valueElement = cell.querySelector('.value, .score-value');
        return valueElement ? parseFloat(valueElement.textContent || '0') : 0;
      });

      const bestValue = feature.isLowerBetter
        ? Math.min(...values)
        : Math.max(...values);

      cells.forEach((cell, i) => {
        const value = values[i];
        if (value === bestValue) {
          // Add highlight class to the cell instead of inline styles
          cell.classList.add('highlight');

          // For score indicators, add highlight class to the score-fill
          const scoreFill = cell.querySelector('.score-fill');
          if (scoreFill) {
            scoreFill.classList.add('highlight');
          }
        }
      });
    }
  });

  // Cast the selectedModels to match the expected type in updateModelHighlights
  const modelsForHighlights = selectedModels.map((model) => ({
    name: model.name,
    creator: model.creator,
    logo: model.logo || '',
    intelligence: model.intelligence,
    speed: model.speed,
    outputPrice: model.outputPrice,
  }));

  updateModelHighlights(modelsForHighlights);
}

function formatContextWindow(tokens: number): string {
  return `${(tokens / 1000).toFixed(0)}K`;
}
