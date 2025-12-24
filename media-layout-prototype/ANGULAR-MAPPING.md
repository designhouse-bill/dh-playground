# Angular Component Mapping Guide

This document maps prototype files to Angular components for the media-layout migration.

**Production Destination:** `ideal-sale-circular/src/app/content/components/media-layout/`

---

## Directory Structure

```
src/app/content/
├── components/
│   └── media-layout/
│       ├── media-layout.module.ts
│       ├── media-layout.component.ts
│       ├── media-layout.component.html
│       ├── media-layout.component.scss
│       │
│       ├── components/
│       │   ├── preview/
│       │   │   ├── preview.component.ts
│       │   │   ├── preview.component.html
│       │   │   └── preview.component.scss
│       │   │
│       │   ├── template-strip/
│       │   │   ├── template-strip.component.ts
│       │   │   ├── template-strip.component.html
│       │   │   └── template-strip.component.scss
│       │   │
│       │   ├── background-chooser/
│       │   │   ├── background-chooser.component.ts
│       │   │   ├── background-chooser.component.html
│       │   │   └── background-chooser.component.scss
│       │   │
│       │   ├── adjustments/
│       │   │   ├── adjustments.component.ts
│       │   │   ├── adjustments.component.html
│       │   │   └── adjustments.component.scss
│       │   │
│       │   ├── media-list/
│       │   │   ├── media-list.component.ts
│       │   │   ├── media-list.component.html
│       │   │   └── media-list.component.scss
│       │   │
│       │   └── image-selection-dialog/
│       │       ├── image-selection-dialog.component.ts
│       │       ├── image-selection-dialog.component.html
│       │       └── image-selection-dialog.component.scss
│       │
│       ├── directives/
│       │   └── moveable.directive.ts
│       │
│       └── services/
│           └── media-layout.service.ts
│
├── services/
│   └── media-layout.service.ts  # Or here if shared
│
└── dto/
    └── media-layout.dto.ts
```

---

## File-by-File Mapping

### Core Application Logic

| Prototype | Angular | Notes |
|-----------|---------|-------|
| `js/app.js` (AppState object) | `services/media-layout.service.ts` | Convert to injectable service with BehaviorSubjects |
| `js/app.js` (DOM manipulation) | Component templates | Move to Angular templates |
| `js/app.js` (event handlers) | Component methods | Move to component classes |

### Components

| Prototype | Angular Component | Selector |
|-----------|-------------------|----------|
| `js/template-strip.js` | `TemplateStripComponent` | `dh-template-strip` |
| `js/layout-panel.js` | Split into parent + children | `dh-layout-panel` |
| `js/background-chooser.js` | `BackgroundChooserComponent` | `dh-background-chooser` |
| `js/preview-v2.js` | `PreviewComponent` | `dh-preview` |
| `js/media-list.js` | `MediaListComponent` | `dh-media-list` |
| `js/image-selection-modal.js` | `ImageSelectionDialogComponent` | `dh-image-selection-dialog` |
| `js/moveable-controller.js` | `MoveableDirective` | `dhMoveable` |

### Utilities & Data

| Prototype | Angular | Notes |
|-----------|---------|-------|
| `js/constraints.js` | `utils/constraints.util.ts` | Pure functions, no class needed |
| `js/templates.js` (process folder) | `data/templates.data.ts` | Export as constant array |
| `css/primeng-overrides.css` | `_media-layout-tokens.scss` | Convert to SCSS variables |

---

## Detailed Component Specifications

### 1. MediaLayoutService

**File:** `services/media-layout.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class MediaLayoutService {
  // State streams
  private readonly _cardSize$ = new BehaviorSubject<CardSize>('2x2');
  private readonly _slots$ = new BehaviorSubject<Slot[]>([]);
  private readonly _background$ = new BehaviorSubject<Background>(DEFAULT_BACKGROUND);
  private readonly _selectedSlotIndex$ = new BehaviorSubject<number>(-1);
  private readonly _template$ = new BehaviorSubject<Template | null>(null);
  private readonly _allConfigs$ = new BehaviorSubject<Record<CardSize, LayoutConfig>>(DEFAULT_CONFIGS);
  private readonly _dirtyConfigs$ = new BehaviorSubject<Set<CardSize>>(new Set());

  // Public observables
  readonly cardSize$ = this._cardSize$.asObservable();
  readonly slots$ = this._slots$.asObservable();
  readonly background$ = this._background$.asObservable();
  readonly selectedSlotIndex$ = this._selectedSlotIndex$.asObservable();
  readonly template$ = this._template$.asObservable();

  // Computed observable
  readonly selectedSlot$ = combineLatest([this._slots$, this._selectedSlotIndex$]).pipe(
    map(([slots, index]) => index >= 0 ? slots[index] : null)
  );

  // Methods (same API as prototype)
  setCardSize(size: CardSize): void { ... }
  setTemplate(template: Template): void { ... }
  setBackground(background: Partial<Background>): void { ... }
  addSlot(slot: Slot): void { ... }
  updateSlot(index: number, updates: Partial<Slot>): void { ... }
  selectSlot(index: number): void { ... }
  bringForward(index: number): void { ... }
  // ... etc
}
```

### 2. MediaLayoutComponent (Container)

**File:** `media-layout.component.ts`

```typescript
@Component({
  selector: 'dh-media-layout',
  templateUrl: './media-layout.component.html',
  styleUrls: ['./media-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaLayoutComponent implements OnInit, OnDestroy {
  @Input() promotionId: string;
  @Output() layoutSaved = new EventEmitter<MediaLayoutState>();

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly mediaLayoutService: MediaLayoutService,
    private readonly dialogService: DialogService
  ) {}

  ngOnInit(): void {
    // Load initial data
    // Set up keyboard shortcuts
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 3. PreviewComponent

**File:** `components/preview/preview.component.ts`

```typescript
@Component({
  selector: 'dh-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreviewComponent {
  @Input() slots: Slot[] = [];
  @Input() background: Background;
  @Input() cardSize: CardSize = '2x2';
  @Input() selectedIndex: number = -1;
  @Input() maxWidth: number = 472;

  @Output() slotSelected = new EventEmitter<number>();
  @Output() slotUpdated = new EventEmitter<{ index: number; updates: Partial<Slot> }>();

  // Grid calculations
  get gridSystem() {
    const unitSize = this.maxWidth / 3;
    const [cols, rows] = this.cardSize.split('x').map(Number);
    return {
      unitSize,
      cols,
      rows,
      width: cols * unitSize,
      height: rows * unitSize
    };
  }
}
```

### 4. TemplateStripComponent

**File:** `components/template-strip/template-strip.component.ts`

```typescript
@Component({
  selector: 'dh-template-strip',
  templateUrl: './template-strip.component.html',
  styleUrls: ['./template-strip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateStripComponent {
  @Input() templates: Template[] = [];
  @Input() selectedTemplateId: string | null = null;
  @Input() cardSize: CardSize = '2x2';

  @Output() templateSelected = new EventEmitter<Template>();

  get filteredTemplates(): Template[] {
    const sizeKey = this.cardSize.replace('x', '');
    return this.templates.filter(t => t.supportedSizes.includes(sizeKey));
  }

  selectTemplate(template: Template): void {
    this.templateSelected.emit(template);
  }
}
```

### 5. BackgroundChooserComponent

**File:** `components/background-chooser/background-chooser.component.ts`

```typescript
@Component({
  selector: 'dh-background-chooser',
  templateUrl: './background-chooser.component.html',
  styleUrls: ['./background-chooser.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackgroundChooserComponent {
  @Input() background: Background;
  @Output() backgroundChanged = new EventEmitter<Partial<Background>>();

  readonly colorPresets = CATEGORY_COLOR_PRESETS;

  activeTab: 'color' | 'image' = 'color';

  selectColor(color: string): void {
    this.backgroundChanged.emit({ type: 'color', value: color, color });
  }

  onImageUploaded(url: string): void {
    this.backgroundChanged.emit({ type: 'image', value: url });
  }
}
```

### 6. MoveableDirective

**File:** `directives/moveable.directive.ts`

```typescript
@Directive({
  selector: '[dhMoveable]'
})
export class MoveableDirective implements AfterViewInit, OnDestroy {
  @Input() dhMoveable: boolean = true;
  @Input() draggable: boolean = true;
  @Input() scalable: boolean = true;
  @Input() rotatable: boolean = true;
  @Input() bounds: { left: number; top: number; right: number; bottom: number };

  @Output() dragEnd = new EventEmitter<{ x: number; y: number }>();
  @Output() scaleEnd = new EventEmitter<number>();
  @Output() rotateEnd = new EventEmitter<number>();

  private moveable: Moveable | null = null;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    if (this.dhMoveable) {
      this.initMoveable();
    }
  }

  private initMoveable(): void {
    this.moveable = new Moveable(document.body, {
      target: this.el.nativeElement,
      draggable: this.draggable,
      scalable: this.scalable,
      rotatable: this.rotatable,
      // ... configuration
    });

    this.moveable.on('dragEnd', ({ target, lastEvent }) => {
      // Calculate percentage position
      this.dragEnd.emit({ x: percentX, y: percentY });
    });
    // ... other events
  }

  ngOnDestroy(): void {
    this.moveable?.destroy();
  }
}
```

---

## PrimeNG Component Usage

### Template Strip
```html
<!-- Use p-button for template thumbnails -->
<div class="template-strip">
  <p-button
    *ngFor="let template of filteredTemplates"
    [outlined]="template.id !== selectedTemplateId"
    [severity]="template.id === selectedTemplateId ? 'primary' : 'secondary'"
    (onClick)="selectTemplate(template)"
  >
    <ng-template pTemplate="content">
      <div class="template-preview">
        <!-- CSS grid preview -->
      </div>
      <span>{{ template.name }}</span>
    </ng-template>
  </p-button>
</div>
```

### Background Chooser
```html
<p-tabView [(activeIndex)]="activeTabIndex">
  <p-tabPanel header="Color">
    <div class="color-swatches">
      <button
        *ngFor="let color of colorPresets"
        class="color-swatch"
        [style.backgroundColor]="color"
        [class.selected]="background.value === color"
        (click)="selectColor(color)"
      ></button>
    </div>
    <p-colorPicker [(ngModel)]="customColor" (onChange)="onCustomColor($event)"></p-colorPicker>
  </p-tabPanel>

  <p-tabPanel header="Image">
    <p-fileUpload
      mode="basic"
      accept="image/*"
      (onUpload)="onImageUploaded($event)"
    ></p-fileUpload>
  </p-tabPanel>
</p-tabView>
```

### Adjustments Panel
```html
<p-card header="Adjustments">
  <div class="adjustment-row">
    <label>Position X</label>
    <p-slider
      [(ngModel)]="selectedSlot.position.x"
      [min]="0"
      [max]="100"
      (onChange)="updatePosition('x', $event.value)"
    ></p-slider>
    <p-inputNumber
      [(ngModel)]="selectedSlot.position.x"
      [min]="0"
      [max]="100"
      suffix="%"
    ></p-inputNumber>
  </div>
  <!-- Similar for Y, Scale, Rotation -->
</p-card>
```

### Image Selection Dialog
```html
<p-dialog
  header="Select Images"
  [(visible)]="visible"
  [modal]="true"
  [style]="{ width: '600px' }"
>
  <p>Select {{ maxImages }} images to keep:</p>

  <div class="image-grid">
    <div
      *ngFor="let slot of slots; let i = index"
      class="image-item"
      [class.selected]="selectedIndices.includes(i)"
      (click)="toggleSelection(i)"
    >
      <img [src]="slot.image.url" [alt]="slot.image.name">
      <p-checkbox
        [binary]="true"
        [(ngModel)]="selections[i]"
      ></p-checkbox>
    </div>
  </div>

  <ng-template pTemplate="footer">
    <p-button label="Cancel" severity="secondary" (onClick)="cancel()"></p-button>
    <p-button
      label="Confirm"
      [disabled]="selectedCount !== maxImages"
      (onClick)="confirm()"
    ></p-button>
  </ng-template>
</p-dialog>
```

---

## Module Configuration

```typescript
// media-layout.module.ts
@NgModule({
  declarations: [
    MediaLayoutComponent,
    PreviewComponent,
    TemplateStripComponent,
    BackgroundChooserComponent,
    AdjustmentsComponent,
    MediaListComponent,
    ImageSelectionDialogComponent,
    MoveableDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // PrimeNG
    ButtonModule,
    CardModule,
    TabViewModule,
    SliderModule,
    InputNumberModule,
    ColorPickerModule,
    FileUploadModule,
    DialogModule,
    CheckboxModule,
    TooltipModule
  ],
  exports: [
    MediaLayoutComponent
  ]
})
export class MediaLayoutModule {}
```

---

## Testing Approach

### Unit Tests

```typescript
// media-layout.service.spec.ts
describe('MediaLayoutService', () => {
  let service: MediaLayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MediaLayoutService);
  });

  it('should save config when changing card size', () => {
    service.setCardSize('2x2');
    service.addSlot(mockSlot);
    service.setCardSize('3x3');

    // Verify config was saved
    expect(service.isConfigCustomized('2x2')).toBeTrue();
  });

  it('should load saved config when returning to size', () => {
    service.setCardSize('2x2');
    service.addSlot(mockSlot);
    service.setCardSize('3x3');
    service.setCardSize('2x2');

    service.slots$.subscribe(slots => {
      expect(slots.length).toBe(1);
    });
  });
});
```

---

## Related Documents

- `MIGRATION-SPEC.md` - Complete feature specification
- `PRIMENG-TOKENS.md` - Design token reference
- `PRIMENG-COMPONENTS.md` - PrimeNG component patterns
