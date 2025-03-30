import './style.css';
import './demo.js';
import './marquee';
import { initBrowserDemoAnimation } from './demogrow';
import { initializeModelCards } from './modelCards.js';
import { initializeComparison } from './modelComparison.js';
import { ComparisonTray } from './comparisonTray.ts';
import { llmModels } from './data/llmModels';
import { ModelFinder } from './modelFinder.ts';
import { ComparisonCustomizer } from './comparisonCustomizer.ts';
import { Navigation } from './components/Navigation';
import './menuToggle';
initBrowserDemoAnimation();

document.addEventListener('DOMContentLoaded', () => {
  // Create a single instance of ComparisonTray
  const comparisonTray = new ComparisonTray();

  // Initialize both components with the same comparisonTray instance
  initializeModelCards(comparisonTray);
  initializeComparison(comparisonTray);

  // Initialize ModelFinder
  const modelFinder = new ModelFinder(llmModels);

  // Initialize the comparison customizer
  const customizer = new ComparisonCustomizer(llmModels);

  // Log for debugging
  console.log(
    'ComparisonCustomizer initialized with models:',
    llmModels.length
  );

  // Initialize navigation
  new Navigation();
});
