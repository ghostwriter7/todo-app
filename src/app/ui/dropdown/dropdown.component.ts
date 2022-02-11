import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent {
  @ViewChild('options') optionsEl!: ElementRef;
  @ViewChild('toggle') toggleEl!: ElementRef;
  @ViewChild('searchInput') searchInputEl!: ElementRef;

  @Input() set options(options: string[]) {
    this._options = options.map((option, idx) => {
      return {value: option, id: idx}
    });

    this.filteredOptions = this._options;
  }

  @Input() label!: string;

  @Input() set preSelectedOption(idx: number) {
    setTimeout(() => {
      this.selectedOption = this._options.find(option => option.id === idx);
    }, 0);
  }

  @Output() optionSelected = new EventEmitter<any>();

  public isOpen = false;
  public _options: any[] = [];
  public filteredOptions: { value: string, id: number }[] = [];
  public selectedOption?: { value: string, id: number };

  @HostListener('document:keydown', ['$event']) onKeyDown(e: KeyboardEvent): void {
    if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key) || !this.isOpen) {
      return;
    }
    const currentIndex = this.filteredOptions.findIndex(option => option.id === this.selectedOption!.id);
    switch (e.key) {
      case 'Enter': {
        this.toggleEl.nativeElement.blur();
        this.onSelected(this.selectedOption!);
        break;
      }
      case 'ArrowDown': {
        if (currentIndex === this.filteredOptions.length - 1) {
          this.selectedOption = this.filteredOptions[0];
          this.optionsEl.nativeElement.scrollTop = 0;
        } else {
          this.selectedOption = this.filteredOptions[currentIndex + 1];
          this.optionsEl.nativeElement.scrollTop += 25;
        }
        break;
      }
      case 'ArrowUp': {
        if (currentIndex === 0) {
          this.selectedOption = this.filteredOptions[this.filteredOptions.length - 1];
          this.optionsEl.nativeElement.scrollTop = 500;
        } else {
          this.selectedOption = this.filteredOptions[currentIndex - 1];
          this.optionsEl.nativeElement.scrollTop -= 25;
        }
        break;
      }
    }
  }

  public onOpen(): void {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.filteredOptions = this._options;

      setTimeout(() => {
        this.searchInputEl.nativeElement.focus();
        const currentIndex = this.filteredOptions.findIndex(option => option.id === this.selectedOption!.id);
        this.optionsEl.nativeElement.scrollTop = currentIndex * 25;
      }, 0);
    }
  }

  public onSelected(option: { value: string, id: number }): void {
    this.isOpen = false;
    this.optionSelected.emit(option.id);
    this.selectedOption = option;
  }

  public onSearch(e: Event): void {
    const searchTerm = (<HTMLInputElement>e.target).value.toLowerCase();

    this.filteredOptions = this._options.filter(option =>
      option.value.toLowerCase().includes(searchTerm)
    );

    this.selectedOption = this.filteredOptions[0];
  }
}
