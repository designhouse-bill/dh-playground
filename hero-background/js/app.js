/**
 * Hero Background Prototype - Main Application
 *
 * TypeScript-ready architecture with clear separation of concerns
 * Designed for easy migration to Angular components
 */

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initCurrentStateTab();
  initNextLevelTab();
  initAllSizesTab();
});

// =============================================================================
// Tab Navigation
// =============================================================================

function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = `tab-${tab.dataset.tab}`;

      // Update tab states
      tabs.forEach(t => t.classList.remove('tab--active'));
      tab.classList.add('tab--active');

      // Update content visibility
      contents.forEach(content => {
        content.classList.toggle('tab-content--active', content.id === targetId);
      });
    });
  });
}

// =============================================================================
// Tab 1: Current State (Angular-like Controls)
// =============================================================================

function initCurrentStateTab() {
  const preview = new HeroPreview();
  const container = document.getElementById('current-preview-container');
  const configOutput = document.getElementById('current-config-output');
  const cssOutput = document.getElementById('current-css-output');

  // Render mode state
  let renderMode = 'hero-card'; // 'hero-card' or 'circular-card'

  // Elements
  const colorTypeSelect = document.getElementById('current-color-type');
  const colorPicker = document.getElementById('current-color-picker');
  const hexInput = document.getElementById('current-color-hex');
  const rInput = document.getElementById('current-color-r');
  const gInput = document.getElementById('current-color-g');
  const bInput = document.getElementById('current-color-b');
  const aInput = document.getElementById('current-color-a');
  const transparentBtn = document.getElementById('current-btn-transparent');
  const resetBtn = document.getElementById('current-btn-reset');
  const cardSizeSelect = document.getElementById('current-card-size');
  const positionSelect = document.getElementById('current-position');
  const sizeSelect = document.getElementById('current-size');
  const repeatSelect = document.getElementById('current-repeat');
  const bgImageOptions = document.querySelectorAll('#current-bg-selector .bg-image-option');
  const bgImageOptionsQA = document.querySelectorAll('#current-bg-selector-qa .bg-image-option');
  const mediaPreview = document.getElementById('current-media-preview');
  const addMediaBtn = document.getElementById('current-btn-add-media');
  const deleteMediaBtn = document.getElementById('current-btn-delete-media');
  const renderModeToggle = document.getElementById('current-render-mode');

  function updatePreview() {
    if (renderMode === 'circular-card') {
      preview.renderCircularCard(container);
    } else {
      preview.render(container);
    }
    updateOutputs();
    updateMediaPreview();
  }

  function updateOutputs() {
    configOutput.textContent = preview.getConfigJson();
    cssOutput.textContent = preview.getCssOutput();
  }

  function syncColorInputs() {
    const bg = preview.config.backgroundColor;
    colorPicker.value = bg.hexCode;
    hexInput.value = bg.hexCode.toUpperCase();
    rInput.value = bg.red;
    gInput.value = bg.green;
    bInput.value = bg.blue;
    aInput.value = bg.alpha;
    colorTypeSelect.value = bg.type;
  }

  function updateMediaPreview() {
    const bgImg = preview.config.backgroundImage;
    if (bgImg.imageHref) {
      mediaPreview.style.backgroundImage = `url('${bgImg.imageHref}')`;
      mediaPreview.classList.add('has-image');
    } else {
      mediaPreview.style.backgroundImage = '';
      mediaPreview.classList.remove('has-image');
    }
  }

  // Color type dropdown
  colorTypeSelect.addEventListener('change', (e) => {
    preview.setBackgroundColorType(e.target.value);
    syncColorInputs();
    updatePreview();
  });

  // Color picker
  colorPicker.addEventListener('input', (e) => {
    preview.setBackgroundColorHex(e.target.value);
    syncColorInputs();
    updatePreview();
  });

  // Hex input
  hexInput.addEventListener('change', (e) => {
    let hex = e.target.value.trim();
    if (!hex.startsWith('#')) hex = '#' + hex;
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      preview.setBackgroundColorHex(hex);
      syncColorInputs();
      updatePreview();
    }
  });

  // RGB inputs
  [rInput, gInput, bInput].forEach(input => {
    input.addEventListener('input', () => {
      preview.setBackgroundColorRgb(
        parseInt(rInput.value) || 0,
        parseInt(gInput.value) || 0,
        parseInt(bInput.value) || 0,
        parseInt(aInput.value) || 100
      );
      colorPicker.value = preview.config.backgroundColor.hexCode;
      hexInput.value = preview.config.backgroundColor.hexCode.toUpperCase();
      colorTypeSelect.value = preview.config.backgroundColor.type;
      updatePreview();
    });
  });

  // Alpha input
  aInput.addEventListener('input', () => {
    preview.setBackgroundColorAlpha(parseInt(aInput.value) || 0);
    colorTypeSelect.value = preview.config.backgroundColor.type;
    updatePreview();
  });

  // Transparent button
  transparentBtn.addEventListener('click', () => {
    preview.setBackgroundColorType('transparent');
    syncColorInputs();
    updatePreview();
  });

  // Reset button
  resetBtn.addEventListener('click', () => {
    preview.setBackgroundColorRgb(255, 255, 255, 100);
    syncColorInputs();
    updatePreview();
  });

  // Card size (if exists)
  if (cardSizeSelect) {
    cardSizeSelect.addEventListener('change', (e) => {
      preview.setCardSize(e.target.value);
      updatePreview();
    });
  }

  // Background image selection (clickable thumbnails)
  function clearAllBgSelections() {
    bgImageOptions.forEach(o => o.classList.remove('bg-image-option--selected'));
    bgImageOptionsQA.forEach(o => o.classList.remove('bg-image-option--selected'));
  }

  bgImageOptions.forEach(option => {
    option.addEventListener('click', () => {
      clearAllBgSelections();
      option.classList.add('bg-image-option--selected');

      const src = option.dataset.src || null;
      const name = option.dataset.id || null;
      preview.setBackgroundImage(src, name);
      updatePreview();
    });
  });

  // QA Test Images selection
  bgImageOptionsQA.forEach(option => {
    option.addEventListener('click', () => {
      clearAllBgSelections();
      option.classList.add('bg-image-option--selected');

      const src = option.dataset.src || null;
      const name = option.dataset.id || null;
      preview.setBackgroundImage(src, name);
      updatePreview();
    });
  });

  // Media picker buttons (placeholder functionality)
  addMediaBtn.addEventListener('click', () => {
    // Scroll to sample images or show a message
    const bgSelector = document.getElementById('current-bg-selector');
    if (bgSelector) {
      bgSelector.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  deleteMediaBtn.addEventListener('click', () => {
    // Clear background image
    bgImageOptions.forEach(o => o.classList.remove('bg-image-option--selected'));
    const noneOption = document.querySelector('#current-bg-selector .bg-image-option--none');
    if (noneOption) {
      noneOption.classList.add('bg-image-option--selected');
    }
    preview.setBackgroundImage(null, null);
    updatePreview();
  });

  // Position dropdown
  positionSelect.addEventListener('change', (e) => {
    preview.setBackgroundPosition(e.target.value);
    updatePreview();
  });

  // Size dropdown
  sizeSelect.addEventListener('change', (e) => {
    preview.setBackgroundSize(e.target.value);
    updatePreview();
  });

  // Repeat dropdown
  repeatSelect.addEventListener('change', (e) => {
    preview.setBackgroundRepeat(e.target.value);
    updatePreview();
  });

  // Render mode toggle
  renderModeToggle.querySelectorAll('.mode-toggle__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      renderModeToggle.querySelectorAll('.mode-toggle__btn').forEach(b => b.classList.remove('mode-toggle__btn--active'));
      btn.classList.add('mode-toggle__btn--active');
      renderMode = btn.dataset.mode;
      updatePreview();
    });
  });

  // Initial render
  syncColorInputs();
  updateMediaPreview();
  if (bgImageOptions.length > 1) {
    bgImageOptions[1].click();
  }
}

// =============================================================================
// Tab 2: Next Level (Enhanced Visual Controls)
// =============================================================================

function initNextLevelTab() {
  const preview = new HeroPreview();
  const container = document.getElementById('nextlevel-preview-container');
  const configOutput = document.getElementById('nextlevel-config-output');
  const cssOutput = document.getElementById('nextlevel-css-output');
  const htmlOutput = document.getElementById('nextlevel-html-output');

  // Subscribe to config changes for updates
  preview.onChange((config) => {
    updateOutputs();
    updateLayerIndicator();
    updateRecentColors();
  });

  // ==========================================================================
  // Color Swatches
  // ==========================================================================

  function initColorSwatches() {
    const swatchesContainer = document.getElementById('nextlevel-swatches-preset');

    // Build preset swatches
    let swatchesHtml = '';

    // Add transparent swatch first
    swatchesHtml += `
      <button class="color-swatch color-swatch--transparent" data-color="transparent" title="Transparent">
        <span class="color-swatch__inner"></span>
      </button>
    `;

    // Add color swatches
    COLOR_SWATCHES.forEach(swatch => {
      swatchesHtml += `
        <button class="color-swatch" data-color="${swatch.hex}" title="${swatch.label}">
          <span class="color-swatch__inner" style="background: ${swatch.hex};"></span>
        </button>
      `;
    });

    swatchesContainer.innerHTML = swatchesHtml;

    // Add click handlers
    swatchesContainer.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        const color = swatch.dataset.color;
        if (color === 'transparent') {
          preview.setBackgroundColorType('transparent');
        } else {
          preview.setBackgroundColorHex(color);
        }
        syncColorInputs();
        updatePreview();
      });
    });
  }

  function updateRecentColors() {
    const recentContainer = document.getElementById('nextlevel-swatches-recent');
    const recentColors = preview.getRecentColors();

    let html = '';
    for (let i = 0; i < 5; i++) {
      if (recentColors[i]) {
        html += `
          <button class="color-swatch" data-color="${recentColors[i]}" title="${recentColors[i]}">
            <span class="color-swatch__inner" style="background: ${recentColors[i]};"></span>
          </button>
        `;
      } else {
        html += `<button class="color-swatch color-swatch--empty" disabled title="No recent colors"></button>`;
      }
    }

    recentContainer.innerHTML = html;

    // Add click handlers
    recentContainer.querySelectorAll('.color-swatch:not(.color-swatch--empty)').forEach(swatch => {
      swatch.addEventListener('click', () => {
        preview.setBackgroundColorHex(swatch.dataset.color);
        syncColorInputs();
        updatePreview();
      });
    });
  }

  // ==========================================================================
  // Position Grid
  // ==========================================================================

  function initPositionGrid() {
    const grid = document.getElementById('nextlevel-position-grid');
    const posX = document.getElementById('nextlevel-position-x');
    const posY = document.getElementById('nextlevel-position-y');

    grid.querySelectorAll('.position-grid__point').forEach(point => {
      point.addEventListener('click', () => {
        // Update active state
        grid.querySelectorAll('.position-grid__point').forEach(p => {
          p.classList.remove('position-grid__point--active');
        });
        point.classList.add('position-grid__point--active');

        // Update preview
        const position = point.dataset.position;
        preview.setBackgroundPosition(position);

        // Update custom inputs to match
        const [x, y] = positionToPercent(position);
        posX.value = x;
        posY.value = y;

        updatePreview();
      });
    });

    // Custom position inputs
    const updateCustomPosition = () => {
      const x = parseInt(posX.value) || 50;
      const y = parseInt(posY.value) || 50;
      preview.setBackgroundPosition(`${x}% ${y}%`);

      // Clear grid selection if custom
      const matchingPreset = findMatchingPreset(x, y);
      grid.querySelectorAll('.position-grid__point').forEach(p => {
        p.classList.toggle('position-grid__point--active', p.dataset.position === matchingPreset);
      });

      updatePreview();
    };

    posX.addEventListener('input', updateCustomPosition);
    posY.addEventListener('input', updateCustomPosition);
  }

  function positionToPercent(position) {
    const map = {
      'top left': [0, 0],
      'top center': [50, 0],
      'top right': [100, 0],
      'center left': [0, 50],
      'center center': [50, 50],
      'center right': [100, 50],
      'bottom left': [0, 100],
      'bottom center': [50, 100],
      'bottom right': [100, 100]
    };
    return map[position] || [50, 50];
  }

  function findMatchingPreset(x, y) {
    const presets = {
      '0,0': 'top left',
      '50,0': 'top center',
      '100,0': 'top right',
      '0,50': 'center left',
      '50,50': 'center center',
      '100,50': 'center right',
      '0,100': 'bottom left',
      '50,100': 'bottom center',
      '100,100': 'bottom right'
    };
    return presets[`${x},${y}`] || null;
  }

  // ==========================================================================
  // Size Selector
  // ==========================================================================

  function initSizeSelector() {
    const buttonsContainer = document.getElementById('nextlevel-size-buttons');
    const customContainer = document.getElementById('nextlevel-size-custom');
    const widthInput = document.getElementById('nextlevel-size-width');
    const heightInput = document.getElementById('nextlevel-size-height');
    const widthUnit = document.getElementById('nextlevel-size-width-unit');
    const heightUnit = document.getElementById('nextlevel-size-height-unit');

    buttonsContainer.querySelectorAll('.size-selector__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
        buttonsContainer.querySelectorAll('.size-selector__btn').forEach(b => {
          b.classList.remove('size-selector__btn--active');
        });
        btn.classList.add('size-selector__btn--active');

        const size = btn.dataset.size;

        // Show/hide custom inputs
        customContainer.classList.toggle('size-custom--visible', size === 'custom');

        if (size !== 'custom') {
          preview.setBackgroundSize(size);
          updatePreview();
        } else {
          updateCustomSize();
        }
      });
    });

    const updateCustomSize = () => {
      const w = widthInput.value || 'auto';
      const h = heightInput.value || 'auto';
      const wUnit = widthUnit.value;
      const hUnit = heightUnit.value;

      const sizeValue = `${w}${w !== 'auto' ? wUnit : ''} ${h}${h !== 'auto' ? hUnit : ''}`;
      preview.setBackgroundSize(sizeValue);
      updatePreview();
    };

    widthInput.addEventListener('input', updateCustomSize);
    heightInput.addEventListener('input', updateCustomSize);
    widthUnit.addEventListener('change', updateCustomSize);
    heightUnit.addEventListener('change', updateCustomSize);
  }

  // ==========================================================================
  // Copy Buttons
  // ==========================================================================

  function initCopyButtons() {
    document.getElementById('copy-json-btn').addEventListener('click', async (e) => {
      await handleCopy(e.currentTarget, configOutput.textContent);
    });

    document.getElementById('copy-css-btn').addEventListener('click', async (e) => {
      await handleCopy(e.currentTarget, cssOutput.textContent);
    });

    document.getElementById('copy-html-btn').addEventListener('click', async (e) => {
      await handleCopy(e.currentTarget, htmlOutput.textContent);
    });
  }

  async function handleCopy(button, text) {
    const success = await copyToClipboard(text);

    if (success) {
      const originalHtml = button.innerHTML;
      button.classList.add('copy-btn--success');
      button.querySelector('span').textContent = 'Copied!';

      showToast('Copied to clipboard!', 'success');

      setTimeout(() => {
        button.classList.remove('copy-btn--success');
        button.innerHTML = originalHtml;
      }, 2000);
    } else {
      showToast('Failed to copy', 'error');
    }
  }

  // ==========================================================================
  // Layer Indicator
  // ==========================================================================

  function updateLayerIndicator() {
    const colorSwatch = document.getElementById('nextlevel-layer-color-swatch');
    const colorValue = document.getElementById('nextlevel-layer-color-value');
    const imageSwatch = document.getElementById('nextlevel-layer-image-swatch');
    const imageValue = document.getElementById('nextlevel-layer-image-value');

    const config = preview.config;

    // Update color
    const colorStr = preview.colorToString(config.backgroundColor);
    colorSwatch.style.background = colorStr;
    if (config.backgroundColor.alpha === 0) {
      colorSwatch.classList.add('layer-indicator__swatch--transparent');
      colorValue.textContent = 'Transparent';
    } else {
      colorSwatch.classList.remove('layer-indicator__swatch--transparent');
      colorValue.textContent = config.backgroundColor.hexCode.toUpperCase();
    }

    // Update image
    if (config.backgroundImage.imageHref) {
      const filename = config.backgroundImage.imageHref.split('/').pop().replace(/_BG\.(jpg|png)$/i, '');
      imageSwatch.style.background = `url('${config.backgroundImage.imageHref}') center/cover`;
      imageValue.textContent = filename;
    } else {
      imageSwatch.style.background = '#f0f0f0';
      imageValue.textContent = 'None';
    }
  }

  // ==========================================================================
  // Update Functions
  // ==========================================================================

  function updatePreview() {
    preview.render(container);
    updateOutputs();
    updateLayerIndicator();
  }

  function updateOutputs() {
    configOutput.textContent = preview.getConfigJson();
    cssOutput.textContent = preview.getCssOutput();
    htmlOutput.textContent = preview.getHtmlOutput();
  }

  function syncColorInputs() {
    const bg = preview.config.backgroundColor;
    document.getElementById('nextlevel-color-picker').value = bg.hexCode;
    document.getElementById('nextlevel-color-hex').value = bg.hexCode.toUpperCase();
    document.getElementById('nextlevel-color-r').value = bg.red;
    document.getElementById('nextlevel-color-g').value = bg.green;
    document.getElementById('nextlevel-color-b').value = bg.blue;
    document.getElementById('nextlevel-color-a').value = bg.alpha;
  }

  // ==========================================================================
  // Standard Controls
  // ==========================================================================

  // Elements
  const colorPicker = document.getElementById('nextlevel-color-picker');
  const hexInput = document.getElementById('nextlevel-color-hex');
  const rInput = document.getElementById('nextlevel-color-r');
  const gInput = document.getElementById('nextlevel-color-g');
  const bInput = document.getElementById('nextlevel-color-b');
  const aInput = document.getElementById('nextlevel-color-a');
  const transparentBtn = document.getElementById('nextlevel-btn-transparent');
  const resetBtn = document.getElementById('nextlevel-btn-reset');
  const cardSizeSelect = document.getElementById('nextlevel-card-size');
  const repeatSelect = document.getElementById('nextlevel-repeat');
  const bgImageOptions = document.querySelectorAll('#nextlevel-bg-selector .bg-image-option');
  const bgImageOptionsQA = document.querySelectorAll('#nextlevel-bg-selector-qa .bg-image-option');

  // Advanced elements
  const blendModeSelect = document.getElementById('nextlevel-blend-mode');
  const opacitySlider = document.getElementById('nextlevel-opacity');
  const opacityValue = document.getElementById('nextlevel-opacity-value');
  const attachmentSelect = document.getElementById('nextlevel-attachment');
  const originSelect = document.getElementById('nextlevel-origin');
  const clipSelect = document.getElementById('nextlevel-clip');

  // Color picker
  colorPicker.addEventListener('input', (e) => {
    preview.setBackgroundColorHex(e.target.value);
    syncColorInputs();
    updatePreview();
  });

  // Hex input
  hexInput.addEventListener('change', (e) => {
    let hex = e.target.value.trim();
    if (!hex.startsWith('#')) hex = '#' + hex;
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      preview.setBackgroundColorHex(hex);
      syncColorInputs();
      updatePreview();
    }
  });

  // RGB inputs
  [rInput, gInput, bInput].forEach(input => {
    input.addEventListener('input', () => {
      preview.setBackgroundColorRgb(
        parseInt(rInput.value) || 0,
        parseInt(gInput.value) || 0,
        parseInt(bInput.value) || 0,
        parseInt(aInput.value) || 100
      );
      colorPicker.value = preview.config.backgroundColor.hexCode;
      hexInput.value = preview.config.backgroundColor.hexCode.toUpperCase();
      updatePreview();
    });
  });

  // Alpha input
  aInput.addEventListener('input', () => {
    preview.setBackgroundColorAlpha(parseInt(aInput.value) || 0);
    updatePreview();
  });

  // Transparent button
  transparentBtn.addEventListener('click', () => {
    preview.setBackgroundColorType('transparent');
    syncColorInputs();
    updatePreview();
  });

  // Reset button
  resetBtn.addEventListener('click', () => {
    preview.setBackgroundColorRgb(255, 255, 255, 100);
    syncColorInputs();
    updatePreview();
  });

  // Card size
  cardSizeSelect.addEventListener('change', (e) => {
    preview.setCardSize(e.target.value);
    updatePreview();
  });

  // Background image selection
  function clearAllBgSelectionsNextLevel() {
    bgImageOptions.forEach(o => o.classList.remove('bg-image-option--selected'));
    bgImageOptionsQA.forEach(o => o.classList.remove('bg-image-option--selected'));
  }

  bgImageOptions.forEach(option => {
    option.addEventListener('click', () => {
      clearAllBgSelectionsNextLevel();
      option.classList.add('bg-image-option--selected');

      const src = option.dataset.src || null;
      const name = option.dataset.id || null;
      preview.setBackgroundImage(src, name);
      updatePreview();
    });
  });

  // QA Test Images selection
  bgImageOptionsQA.forEach(option => {
    option.addEventListener('click', () => {
      clearAllBgSelectionsNextLevel();
      option.classList.add('bg-image-option--selected');

      const src = option.dataset.src || null;
      const name = option.dataset.id || null;
      preview.setBackgroundImage(src, name);
      updatePreview();
    });
  });

  // Repeat
  repeatSelect.addEventListener('change', (e) => {
    preview.setBackgroundRepeat(e.target.value);
    updatePreview();
  });

  // Note: Advanced controls (blend mode, opacity, attachment, origin, clip) are no longer
  // supported in the new simplified data model. They remain here for UI compatibility
  // but won't affect the output.

  // Mode toggle
  const modeToggle = document.getElementById('nextlevel-mode-toggle');
  const advancedControls = document.getElementById('nextlevel-advanced-controls');

  modeToggle.querySelectorAll('.mode-toggle__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modeToggle.querySelectorAll('.mode-toggle__btn').forEach(b => b.classList.remove('mode-toggle__btn--active'));
      btn.classList.add('mode-toggle__btn--active');
      advancedControls.style.display = btn.dataset.mode === 'advanced' ? 'block' : 'none';
    });
  });

  // ==========================================================================
  // Initialize
  // ==========================================================================

  initColorSwatches();
  initPositionGrid();
  initSizeSelector();
  initCopyButtons();

  // Select first background image
  if (bgImageOptions.length > 1) {
    bgImageOptions[1].click();
  }
}

// =============================================================================
// Tab 3: All Sizes Grid
// =============================================================================

function initAllSizesTab() {
  const preview = new HeroPreview();
  const container = document.getElementById('all-sizes-container');

  // Elements
  const colorPicker = document.getElementById('sizes-color-picker');
  const bgImageOptions = document.querySelectorAll('#sizes-bg-selector .bg-image-option');

  function updatePreview() {
    preview.renderAllSizes(container);
  }

  // Color picker
  colorPicker.addEventListener('input', (e) => {
    preview.setBackgroundColorHex(e.target.value);
    updatePreview();
  });

  // Background image selection
  bgImageOptions.forEach(option => {
    option.addEventListener('click', () => {
      bgImageOptions.forEach(o => o.classList.remove('bg-image-option--selected'));
      option.classList.add('bg-image-option--selected');

      const src = option.dataset.src || null;
      preview.setBackgroundImage(src);
      updatePreview();
    });
  });

  // Initial render - select first background image
  if (bgImageOptions.length > 1) {
    bgImageOptions[1].click();
  }
}

// =============================================================================
// Toast Notifications
// =============================================================================

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast ('success', 'error', 'info')
 */
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast';

  if (type === 'success') {
    toast.classList.add('toast--success');
  }

  // Show
  setTimeout(() => {
    toast.classList.add('toast--visible');
  }, 10);

  // Hide after delay
  setTimeout(() => {
    toast.classList.remove('toast--visible');
  }, 2500);
}
