import { debounce } from './utils.ts';

export class ModelSearch {
  private searchInput: HTMLInputElement | null = null;
  private currentSearchTerm: string = '';
  private searchCallback: (term: string) => void;

  constructor(searchCallback: (term: string) => void) {
    this.searchCallback = searchCallback;
    this.initializeSearch();
  }

  private initializeSearch(): void {
    this.searchInput = document.querySelector('.search-input');

    if (this.searchInput) {
      // Debounce the search to prevent too many updates
      const debouncedSearch = debounce((term: string) => {
        this.currentSearchTerm = term.toLowerCase();
        this.searchCallback(this.currentSearchTerm);
      }, 300);

      this.searchInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        debouncedSearch(target.value);
      });
    }
  }

  public getCurrentSearchTerm(): string {
    return this.currentSearchTerm;
  }

  public clearSearch(): void {
    if (this.searchInput) {
      this.searchInput.value = '';
      this.currentSearchTerm = '';
      this.searchCallback('');
    }
  }
}
