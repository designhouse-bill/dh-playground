// DOM renderer. No layout math here — pure translation of paginate output.
// Card templates mirror DS components; see styles/cards.css header for source files.

/**
 * @typedef {'auto' | 'web' | 'print-deal' | 'print-coupon'} Variant
 */

/**
 * Render pages into a container.
 * @param {Array<{pageNumber:number, items:Array}>} pages
 * @param {HTMLElement} container
 * @param {{N:number, R:number, gridMode:'strict'|'mosaic', promos:Array, categories:Array, variant:Variant}} opts
 */
export function renderPages(pages, container, opts) {
  const { N, gridMode, promos, categories, variant } = opts;
  container.innerHTML = '';

  const cursorByCat = new Map();
  const promosByCat = new Map();
  for (const p of promos) {
    if (!promosByCat.has(p.categoryId)) promosByCat.set(p.categoryId, []);
    promosByCat.get(p.categoryId).push(p);
  }

  const catById = new Map();
  for (const c of categories) catById.set(c.id, c);

  for (const page of pages) {
    const pageEl = document.createElement('section');
    pageEl.className = 'print-page';
    pageEl.style.setProperty('--cols', String(N));
    pageEl.dataset.page = String(page.pageNumber);
    if (gridMode === 'mosaic') pageEl.classList.add('mosaic');

    for (const item of page.items) {
      if (item.type === 'title') {
        const titleEl = document.createElement('div');
        titleEl.className = 'category-title';
        titleEl.dataset.categoryIndex = String(item.categoryIndex);
        titleEl.textContent = item.name;
        pageEl.appendChild(titleEl);
      } else if (item.type === 'row') {
        const rowEl = document.createElement('div');
        rowEl.className = 'promo-row';
        rowEl.style.setProperty('--cols', String(N));
        rowEl.dataset.categoryIndex = String(item.categoryIndex);

        const catId = window.__categoryIdByIndex?.[item.categoryIndex];
        const cat = catById.get(catId);
        const catPromos = promosByCat.get(catId) ?? [];

        for (const span of item.spans) {
          const cursor = cursorByCat.get(catId) ?? 0;
          const promo = catPromos[cursor];
          cursorByCat.set(catId, cursor + 1);
          rowEl.appendChild(renderCard(promo, span, variant, cat));
        }

        pageEl.appendChild(rowEl);
      }
    }

    const footer = document.createElement('div');
    footer.className = 'page-footer';
    footer.textContent = `Page ${page.pageNumber}`;
    pageEl.appendChild(footer);

    container.appendChild(pageEl);
  }
}

/**
 * @param {object} promo
 * @param {1|2|3} span
 * @param {Variant} variant
 * @param {{isCouponCategory?: boolean}} [cat]
 */
export function renderCard(promo, span, variant, cat) {
  const wrapper = document.createElement('article');
  wrapper.className = 'promo-card';
  wrapper.dataset.span = String(span);
  wrapper.style.gridColumn = `span ${span}`;

  const resolved = resolveVariant(variant, cat);
  if (resolved === 'web') {
    wrapper.appendChild(renderWebDealCard(promo, span));
  } else if (resolved === 'print-coupon') {
    wrapper.appendChild(renderPrintCouponCard(promo, span));
  } else {
    wrapper.appendChild(renderPrintDealCard(promo, span));
  }
  return wrapper;
}

function resolveVariant(variant, cat) {
  if (variant === 'auto') {
    return cat?.isCouponCategory ? 'print-coupon' : 'print-deal';
  }
  return variant;
}

/* ─────────────────────────────────────────────────────────── */
/* dh-print-deal-card replica                                  */
/* ─────────────────────────────────────────────────────────── */

function renderPrintDealCard(promo, span) {
  const host = document.createElement('div');
  host.className = 'dh-print-deal-card';

  const img = document.createElement('div');
  img.className = 'print-deal-card-image';
  host.appendChild(img);

  const text = document.createElement('div');
  text.className = 'print-deal-card-text';

  const title = document.createElement('h3');
  title.className = 'print-deal-card-title';
  title.textContent = promo?.title ?? 'Promo Title';
  text.appendChild(title);

  if (promo?.headline) {
    const headline = document.createElement('aside');
    headline.className = 'print-deal-card-headline';
    headline.textContent = promo.headline;
    text.appendChild(headline);
  }

  const priceRow = document.createElement('div');
  priceRow.className = 'print-deal-card-price-and-icons';

  const priceBox = document.createElement('div');
  priceBox.className = 'print-deal-card-price-container';
  const price = document.createElement('span');
  price.className = 'print-deal-card-price';
  price.textContent = promo?.price ?? '$—';
  priceBox.appendChild(price);
  priceRow.appendChild(priceBox);

  text.appendChild(priceRow);

  if (promo?.description) {
    const desc = document.createElement('article');
    desc.className = 'description';
    const section = document.createElement('section');
    section.className = 'main-description';
    section.textContent = promo.description;
    desc.appendChild(section);
    text.appendChild(desc);
  }

  host.appendChild(text);

  const meta = document.createElement('div');
  meta.className = 'metadata';
  if (promo?.dateText) {
    const dateWrap = document.createElement('div');
    dateWrap.className = 'date-range';
    const t = document.createElement('time');
    t.className = 'start date';
    t.textContent = promo.dateText;
    dateWrap.appendChild(t);
    meta.appendChild(dateWrap);
  }
  if (promo?.mustBuy) {
    const em = document.createElement('em');
    em.textContent = `Must Buy: ${promo.mustBuy}`;
    meta.appendChild(em);
  }
  if (meta.childElementCount > 0) host.appendChild(meta);

  return host;
}

/* ─────────────────────────────────────────────────────────── */
/* dh-print-coupon-card replica                                */
/* ─────────────────────────────────────────────────────────── */

function renderPrintCouponCard(promo, span) {
  const host = document.createElement('div');
  host.className = 'dh-print-coupon-card dh-print-deal-card'; // shares deal-card base

  const img = document.createElement('div');
  img.className = 'print-deal-card-image';
  host.appendChild(img);

  const text = document.createElement('div');
  text.className = 'print-deal-card-text';

  const title = document.createElement('h3');
  title.className = 'print-deal-card-title';
  title.textContent = promo?.title ?? 'Coupon Title';
  text.appendChild(title);

  const priceRow = document.createElement('div');
  priceRow.className = 'print-deal-card-price-and-icons';

  const priceBox = document.createElement('div');
  priceBox.className = 'print-deal-card-price-container';

  const orig = document.createElement('span');
  orig.className = 'original print-deal-card-price';
  orig.textContent = promo?.originalPrice ?? '$4.99';
  priceBox.appendChild(orig);

  const couponPrice = document.createElement('span');
  couponPrice.className = 'print-deal-card-price';
  couponPrice.textContent = promo?.couponPrice ?? promo?.price ?? '$2.99';
  priceBox.appendChild(couponPrice);

  priceRow.appendChild(priceBox);
  text.appendChild(priceRow);

  if (promo?.description) {
    const desc = document.createElement('article');
    desc.className = 'description';
    const section = document.createElement('section');
    section.className = 'main-description';
    section.textContent = promo.description;
    desc.appendChild(section);
    text.appendChild(desc);
  }

  host.appendChild(text);

  // Coupon-bar: title pill + discount label. No QR (per UX-864 latest dir).
  const couponText = document.createElement('div');
  couponText.className = 'coupon-text';

  const bar = document.createElement('div');
  bar.className = 'coupon-bar';

  const header = document.createElement('div');
  header.className = 'coupon-bar-header';

  const titleChip = document.createElement('span');
  titleChip.className = 'coupon-bar-title';
  titleChip.textContent = 'Digital Coupon';
  header.appendChild(titleChip);

  if (promo?.discountText) {
    const disc = document.createElement('span');
    disc.className = 'coupon-bar-discount';
    disc.textContent = promo.discountText;
    header.appendChild(disc);
  } else {
    const disc = document.createElement('span');
    disc.className = 'coupon-bar-discount';
    disc.textContent = 'Save $2';
    header.appendChild(disc);
  }

  bar.appendChild(header);
  couponText.appendChild(bar);
  host.appendChild(couponText);

  return host;
}

/* ─────────────────────────────────────────────────────────── */
/* dh-deal-card (web) replica                                  */
/* ─────────────────────────────────────────────────────────── */

function renderWebDealCard(promo, span) {
  const host = document.createElement('div');
  host.className = 'dh-deal-card';

  const hero = document.createElement('div');
  hero.className = 'hero';
  host.appendChild(hero);

  if (promo?.headline) {
    const pill = document.createElement('div');
    pill.className = 'headline-pill';
    pill.textContent = promo.headline;
    host.appendChild(pill);
  }

  const title = document.createElement('div');
  title.className = 'title-overlay';
  title.textContent = promo?.title ?? 'Promo Title';
  host.appendChild(title);

  const price = document.createElement('div');
  price.className = 'price-tag';
  price.textContent = promo?.price ?? '$—';
  host.appendChild(price);

  return host;
}
