interface LLMModel {
  name: string;
  [key: string]: any; // For other properties
}

export class ComparisonTray {
  private selectedModels: Set<LLMModel>;
  private trayElement!: HTMLElement;
  private selectedModelsContainer!: HTMLElement;
  private compareButton!: HTMLElement;

  constructor() {
    this.selectedModels = new Set<LLMModel>();
    this.initializeTray();
  }

  private initializeTray(): void {
    // Create and append the tray HTML
    const trayHTML = `
      <div class="comparison-tray">
        <div class="selected-models"></div>
        <a href="#compare" class="cta-button" disabled>Compare (0)</a>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', trayHTML);

    this.trayElement = document.querySelector(
      '.comparison-tray'
    ) as HTMLElement;
    this.selectedModelsContainer = this.trayElement.querySelector(
      '.selected-models'
    ) as HTMLElement;
    this.compareButton = this.trayElement.querySelector(
      '.cta-button'
    ) as HTMLElement;

    // Initialize the compare button as disabled
    this.updateCompareButton();
  }

  public addModel(model: LLMModel): boolean {
    if (this.selectedModels.size >= 4) {
      return false;
    }

    // Debug log
    console.log('Adding model:', model);

    this.selectedModels.add(model);
    this.updateTray();
    return true;
  }

  public removeModel(model: LLMModel): void {
    // Debug log
    console.log('Removing model:', model);

    this.selectedModels.delete(model);
    const modelCard = document.querySelector(
      `.model-card[data-model-id="${model.name}"]`
    );
    if (modelCard) {
      modelCard.classList.remove('selected');
    }
    this.updateTray();
  }

  private updateTray(): void {
    // Clear existing pills
    this.selectedModelsContainer.innerHTML = '';

    // Add pills for each selected model
    this.selectedModels.forEach((model) => {
      const pillHTML = `
        <div class="selected-model-pill" data-model-id="${model.name}">
          ${model.name}
          <span class="remove-model">✕</span>
        </div>
      `;
      this.selectedModelsContainer.insertAdjacentHTML('beforeend', pillHTML);
    });

    // Add click handlers for remove buttons
    this.selectedModelsContainer
      .querySelectorAll('.remove-model')
      .forEach((button) => {
        button.addEventListener('click', (e: Event) => {
          const target = e.target as HTMLElement;
          const pillElement = target.closest(
            '.selected-model-pill'
          ) as HTMLElement;
          const modelName = pillElement.dataset.modelId;
          const model = Array.from(this.selectedModels).find(
            (m) => m.name === modelName
          );
          if (model) {
            this.removeModel(model);
          }
        });
      });

    // Show/hide tray based on selection
    if (this.selectedModels.size > 0) {
      this.trayElement.classList.add('active');
    } else {
      this.trayElement.classList.remove('active');
    }

    this.updateCompareButton();

    // Debug log
    console.log('Updated selected models:', Array.from(this.selectedModels));

    // Update visibility of comparison sections
    const emptyStates = document.querySelectorAll('.empty-state');
    const comparisonTable = document.querySelector('.comparison-table');
    const highlightsGrid = document.querySelector('.highlights-grid');

    if (this.selectedModels.size > 0) {
      // Hide empty states and show content
      emptyStates.forEach((state) => {
        (state as HTMLElement).style.display = 'none';
      });
      if (comparisonTable)
        (comparisonTable as HTMLElement).style.display = 'table';
      if (highlightsGrid)
        (highlightsGrid as HTMLElement).style.display = 'grid';
    } else {
      // Show empty states and hide content
      emptyStates.forEach((state) => {
        (state as HTMLElement).style.display = 'block';
      });
      if (comparisonTable)
        (comparisonTable as HTMLElement).style.display = 'none';
      if (highlightsGrid)
        (highlightsGrid as HTMLElement).style.display = 'none';
    }
  }

  private updateCompareButton(): void {
    const count = this.selectedModels.size;
    this.compareButton.textContent = `Compare (${count})`;

    if (count < 2) {
      this.compareButton.setAttribute('disabled', '');
      this.compareButton.style.pointerEvents = 'none';
    } else {
      this.compareButton.removeAttribute('disabled');
      this.compareButton.style.pointerEvents = 'auto';
    }
  }

  public getSelectedModels(): LLMModel[] {
    // Convert Set to Array and return
    const models = Array.from(this.selectedModels);
    console.log('Getting selected models:', models);
    return models;
  }
}
