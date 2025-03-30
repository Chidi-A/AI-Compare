// Define interfaces for our data structures
interface LLMModel {
  name: string;
  creator: string;
  logo: string;
  intelligence: number;
  speed: number;
  outputPrice: number;
  [key: string]: any; // For dynamic property access
}

interface ScoreInfo {
  scoreLabel: string;
  scoreValue: string;
}

function updateModelHighlights(selectedModels: LLMModel[]): void {
  if (!selectedModels || selectedModels.length === 0) return;

  // Find models with best scores
  const bestIntelligence = selectedModels.reduce(
    (best: LLMModel, current: LLMModel) => {
      return current.intelligence > best.intelligence ? current : best;
    },
    selectedModels[0]
  );

  const bestSpeed = selectedModels.reduce(
    (best: LLMModel, current: LLMModel) => {
      return current.speed > best.speed ? current : best;
    },
    selectedModels[0]
  );

  const bestPrice = selectedModels.reduce(
    (best: LLMModel, current: LLMModel) => {
      return current.outputPrice < best.outputPrice ? current : best;
    },
    selectedModels[0]
  );

  // Update Intelligence Card
  updateHighlightCard('intelligence', bestIntelligence, {
    scoreLabel: 'Intelligence Score',
    scoreValue: bestIntelligence.intelligence.toFixed(1),
  });

  // Update Speed Card
  updateHighlightCard('speed', bestSpeed, {
    scoreLabel: 'Speed',
    scoreValue: `${bestSpeed.speed.toLocaleString()} tokens/sec`,
  });

  // Update Price Card
  updateHighlightCard('price', bestPrice, {
    scoreLabel: 'Output Price',
    scoreValue: `$${bestPrice.outputPrice}/1M tokens`,
  });
}

function updateHighlightCard(
  cardType: string,
  model: LLMModel,
  scoreInfo: ScoreInfo
): void {
  const card = document.querySelector(`.highlight-card.${cardType}`);
  if (!card) return;

  // Update model logo
  const logoImg = card.querySelector('.model-logo') as HTMLImageElement | null;
  if (logoImg) {
    logoImg.src = model.logo;
    logoImg.alt = `${model.name} logo`;
  }

  // Update model name and creator
  const modelName = card.querySelector('.model-name');
  if (modelName) {
    modelName.textContent = model.name;
  }

  const modelCreator = card.querySelector('.model-creator');
  if (modelCreator) {
    modelCreator.textContent = model.creator;
  }

  // Update score
  const scoreLabel = card.querySelector('.score-label');
  if (scoreLabel) {
    scoreLabel.textContent = scoreInfo.scoreLabel;
  }

  const scoreValue = card.querySelector('.score-value');
  if (scoreValue) {
    scoreValue.textContent = scoreInfo.scoreValue;
  }
}

// Export the function to be used in modelComparison.ts
export { updateModelHighlights };
