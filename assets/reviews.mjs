import { REVIEWS } from './reviews-data.mjs?v=20261017-1';
import { FILTERS, recommendCategory, filterReviews, dotIndices, fitImageWidth } from './reviews-logic.mjs?v=20261017-1';

export class Reviews {
  constructor(root, reviews) {
    this.root = root;
    this.reviews = reviews;
    this.filter = 'all';
    this.visible = [...reviews];
    this.index = 0;
    this.manualFilter = false;
    this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    this.preloaded = new Map();
    this.renderVersion = 0;
    this.stage = root.querySelector('.reviews__stage');
    this.image = root.querySelector('.reviews__image');
    this.openLink = root.querySelector('.reviews__open');
    this.fade = root.querySelector('.reviews__preview-fade');
    this.error = root.querySelector('.reviews__image-error');
    this.quote = root.querySelector('.reviews__quote q');
    this.dots = root.querySelector('.reviews__dots');
    this.counter = root.querySelector('.reviews__counter');
    this.status = root.querySelector('.reviews__status');
    this.filters = root.querySelector('.reviews__filters');
    this.filterButtons = [...this.filters.querySelectorAll('button')];
    this.previous = root.querySelector('.reviews__arrow--previous');
    this.next = root.querySelector('.reviews__arrow--next');
    this.gallery = root.querySelector('.reviews__gallery');
    this.dialog = root.querySelector('dialog');
    this.viewerViewport = root.querySelector('.review-viewer__viewport');
    this.viewerCanvas = root.querySelector('.review-viewer__canvas');
    this.viewerImage = root.querySelector('.review-viewer__image');
    this.viewerCounter = root.querySelector('.review-viewer__counter');
    this.zoomOutput = root.querySelector('.review-viewer__zoom output');
    this.zoomIn = root.querySelector('.review-viewer__zoom-in');
    this.zoomOut = root.querySelector('.review-viewer__zoom-out');
    this.viewerPrevious = root.querySelector('.review-viewer__previous');
    this.viewerNext = root.querySelector('.review-viewer__next');

    this.previous.addEventListener('click', () => this.move(-1));
    this.next.addEventListener('click', () => this.move(1));
    root.querySelector('.reviews__carousel').addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        this.move(event.key === 'ArrowLeft' ? -1 : 1);
      }
    });
    this.filterButtons.forEach(button => button.addEventListener('click', () => {
      this.manualFilter = true;
      this.setFilter(button.dataset.filter);
    }));
    this.openLink.addEventListener('click', event => {
      if (typeof this.dialog.showModal !== 'function') return;
      event.preventDefault();
      if (performance.now() - (this.lastSwipe || -1000) < 400) return;
      this.openViewer(this.visible, this.index, event.currentTarget, true);
    });
    this.openLink.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'touch' || !event.isPrimary) return;
      this.swipeStart = { x: event.clientX, y: event.clientY };
    });
    this.openLink.addEventListener('pointercancel', () => { this.swipeStart = null; });
    this.openLink.addEventListener('pointerup', event => {
      if (!this.swipeStart) return;
      const dx = event.clientX - this.swipeStart.x;
      const dy = event.clientY - this.swipeStart.y;
      this.swipeStart = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        this.lastSwipe = performance.now();
        this.move(dx < 0 ? 1 : -1);
      }
    });

    this.gallery.addEventListener('toggle', () => {
      if (this.gallery.open && !this.galleryBuilt) this.buildGallery();
    });
    root.querySelector('.reviews__gallery-close').addEventListener('click', () => {
      this.gallery.open = false;
      this.gallery.querySelector('summary').focus();
    });
    root.querySelector('.review-viewer__close').addEventListener('click', () => this.dialog.close());
    this.dialog.addEventListener('close', () => this.finishViewer());
    this.viewerPrevious.addEventListener('click', () => this.moveViewer(-1));
    this.viewerNext.addEventListener('click', () => this.moveViewer(1));
    this.setupViewerSwipe();
    this.zoomIn.addEventListener('click', () => this.changeZoom(.5));
    this.zoomOut.addEventListener('click', () => this.changeZoom(-.5));
    this.viewerImage.addEventListener('dblclick', event => {
      event.preventDefault();
      this.zoom = this.zoom === 1 ? 2 : 1;
      this.layoutViewer(true);
    });
    this.dialog.addEventListener('keydown', event => {
      if (event.key === 'Tab') {
        const controls = [...this.dialog.querySelectorAll('button:not(:disabled), [tabindex="0"]')];
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        this.moveViewer(event.key === 'ArrowLeft' ? -1 : 1);
      } else if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        this.changeZoom(.5);
      } else if (event.key === '-') {
        event.preventDefault();
        this.changeZoom(-.5);
      } else if (event.key === '0') {
        event.preventDefault();
        this.zoom = 1;
        this.layoutViewer(true);
      }
    });

    // Observe the existing native checkboxes; the earlier component needs no changes.
    const discoveryForm = document.querySelector('.discovery form');
    if (discoveryForm) {
      discoveryForm.addEventListener('change', () => this.followSelection());
      discoveryForm.addEventListener('submit', () => queueMicrotask(() => this.followSelection()));
    }
    addEventListener('pageshow', () => this.followSelection());
    if (typeof ResizeObserver === 'function') {
      this.previewObserver = new ResizeObserver(() => {
        if (Math.abs(this.stage.clientWidth - (this.previewWidth || 0)) > .5) this.layoutPreview();
      });
      this.previewObserver.observe(this.stage);
      this.viewerObserver = new ResizeObserver(() => {
        if (this.dialog.open) this.layoutViewer(true);
      });
      this.viewerObserver.observe(this.viewerViewport);
    } else {
      addEventListener('resize', () => {
        this.layoutPreview();
        if (this.dialog.open) this.layoutViewer(true);
      });
    }
    this.previous.hidden = false;
    this.next.hidden = false;
    this.filters.hidden = false;
    this.gallery.hidden = false;
    root.querySelector('.reviews__position').hidden = false;
    this.setFilter(this.recommendedFilter());
  }

  recommendedFilter() {
    return recommendCategory([...document.querySelectorAll('.discovery input:checked')].map(input => input.value));
  }

  followSelection() {
    if (this.manualFilter) return;
    const category = this.recommendedFilter();
    if (category !== this.filter) this.setFilter(category);
  }

  setFilter(category) {
    const requested = FILTERS.some(filter => filter.id === category) ? category : 'all';
    const results = filterReviews(this.reviews, requested);
    this.filter = results.length ? requested : 'all';
    this.visible = results.length ? results : [...this.reviews];
    this.index = 0;
    this.filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === this.filter)));
    this.render();
    const button = this.filterButtons.find(item => item.dataset.filter === this.filter);
    this.filters.scrollTo({
      left: button.offsetLeft - this.filters.offsetLeft - (this.filters.clientWidth - button.offsetWidth) / 2,
      behavior: this.reducedMotion.matches ? 'auto' : 'smooth'
    });
  }

  move(direction) {
    if (this.visible.length < 2) return;
    this.index = (this.index + direction + this.visible.length) % this.visible.length;
    this.render();
  }

  render() {
    const review = this.visible[this.index];
    const version = ++this.renderVersion;
    const sourceChanged = this.image.getAttribute('src') !== review.src;
    this.stage.classList.toggle('is-loading', sourceChanged || !this.image.complete);
    this.openLink.setAttribute('aria-busy', 'true');
    this.error.hidden = true;
    this.openLink.href = review.src;
    this.openLink.setAttribute('aria-label', `${review.id} numaralı yorumu tam boyutta aç`);
    this.image.alt = `${review.id} numaralı öğrenci yorumu: ${review.quote}`;
    this.image.width = review.width;
    this.image.height = review.height;
    this.quote.textContent = review.quote;
    this.counter.textContent = `${this.index + 1} / ${this.visible.length}`;
    this.previous.disabled = this.next.disabled = this.visible.length < 2;
    const filterLabel = FILTERS.find(filter => filter.id === this.filter).label;
    this.status.textContent = `${filterLabel}. Yorum ${this.index + 1} / ${this.visible.length}.`;
    this.layoutPreview();
    this.renderDots();
    const ready = () => {
      if (version !== this.renderVersion) return;
      this.stage.classList.remove('is-loading');
      this.openLink.setAttribute('aria-busy', 'false');
      this.preloadNext();
    };
    this.image.onload = ready;
    this.image.onerror = () => {
      if (version !== this.renderVersion) return;
      this.stage.classList.remove('is-loading');
      this.openLink.setAttribute('aria-busy', 'false');
      this.error.hidden = false;
    };
    if (sourceChanged) this.image.src = review.src;
    if (this.image.complete && this.image.naturalWidth) ready();
    else if (typeof this.image.decode === 'function') this.image.decode().then(ready).catch(() => {});
    if (!this.reducedMotion.matches && typeof this.quote.animate === 'function') {
      this.quote.animate([{ opacity: .3 }, { opacity: 1 }], { duration: 240, easing: 'ease-out' });
    }
  }

  layoutPreview() {
    const review = this.visible[this.index];
    const width = this.stage.clientWidth;
    if (!width) return;
    this.previewWidth = width;
    const naturalHeight = width * review.height / review.width;
    const limit = Math.min(430, Math.max(260, width * 1.08));
    const long = naturalHeight > limit + 2;
    this.stage.style.height = `${Math.max(width * .48, Math.min(naturalHeight, limit))}px`;
    this.stage.classList.toggle('is-long', long);
    this.fade.hidden = !long;
  }

  renderDots() {
    this.dots.replaceChildren();
    for (const index of dotIndices(this.index, this.visible.length)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'reviews__dot';
      button.setAttribute('aria-label', `${index + 1}. yorumu göster`);
      if (index === this.index) button.setAttribute('aria-current', 'true');
      if (Math.abs(index - this.index) > 1 && this.visible.length > 5) button.classList.add('is-distant');
      button.addEventListener('click', () => {
        this.index = index;
        this.render();
        // Keep keyboard focus on the replacement for the activated dot.
        this.dots.querySelector('[aria-current="true"]').focus({ preventScroll: true });
      });
      this.dots.append(button);
    }
  }

  preloadNext() {
    if (this.visible.length < 2) return;
    const review = this.visible[(this.index + 1) % this.visible.length];
    if (this.preloaded.has(review.id)) return;
    const image = new Image();
    image.decoding = 'async';
    image.src = review.src;
    this.preloaded.set(review.id, image);
  }

  buildGallery() {
    const grid = this.gallery.querySelector('.reviews__gallery-grid');
    const all = [...this.reviews].sort((a, b) => a.id - b.id);
    all.forEach((review, index) => {
      const link = document.createElement('a');
      link.className = 'reviews__thumbnail';
      link.href = review.src;
      link.target = '_blank';
      link.rel = 'noopener';
      link.setAttribute('aria-label', `${review.id} numaralı yorumu tam boyutta aç`);
      const image = document.createElement('img');
      image.src = review.src;
      image.width = review.width;
      image.height = review.height;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.alt = `${review.id} numaralı öğrenci yorumu`;
      const number = document.createElement('span');
      number.textContent = String(review.id).padStart(2, '0');
      link.append(image, number);
      link.addEventListener('click', event => {
        if (typeof this.dialog.showModal !== 'function') return;
        event.preventDefault();
        this.openViewer(all, index, event.currentTarget, false);
      });
      grid.append(link);
    });
    this.galleryBuilt = true;
  }

  openViewer(reviews, index, returnFocus, fromCarousel) {
    this.viewerReviews = [...reviews];
    this.viewerIndex = index;
    this.returnFocus = returnFocus;
    this.viewerFromCarousel = fromCarousel;
    this.oldBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.dialog.showModal();
    this.renderViewer();
  }

  setupViewerSwipe() {
    this.viewerPointers = new Set();
    window.visualViewport?.addEventListener('resize', () => {
      if (this.dialog.open) this.updateViewerGestureMode();
    });
    this.viewerViewport.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'touch') return;
      this.viewerPointers.add(event.pointerId);
      if (!this.dialog.open || !event.isPrimary || this.viewerPointers.size !== 1 || this.zoom !== 1 || (window.visualViewport?.scale || 1) > 1.01) {
        this.viewerSwipe = null;
        return;
      }
      this.viewerSwipe = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now() };
    });
    this.viewerViewport.addEventListener('pointercancel', event => {
      this.viewerPointers.delete(event.pointerId);
      this.viewerSwipe = null;
    });
    this.viewerViewport.addEventListener('pointerup', event => {
      if (event.pointerType !== 'touch') return;
      this.viewerPointers.delete(event.pointerId);
      const start = this.viewerSwipe;
      this.viewerSwipe = null;
      if (!start || start.id !== event.pointerId || this.viewerPointers.size || this.zoom !== 1 || (window.visualViewport?.scale || 1) > 1.01) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (performance.now() - start.time <= 900 && Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        this.moveViewer(dx < 0 ? 1 : -1);
      }
    });
  }

  updateViewerGestureMode() {
    this.viewerSwipe = null;
    this.viewerViewport.classList.toggle('is-zoomed', this.zoom > 1 || (window.visualViewport?.scale || 1) > 1.01);
  }

  renderViewer() {
    const review = this.viewerReviews[this.viewerIndex];
    this.zoom = 1;
    this.viewerLayout = null;
    this.viewerImage.src = review.src;
    this.viewerImage.width = review.width;
    this.viewerImage.height = review.height;
    this.viewerImage.alt = `${review.id} numaralı öğrenci yorumu: ${review.quote}`;
    this.viewerCounter.textContent = `${this.viewerIndex + 1} / ${this.viewerReviews.length}`;
    this.viewerPrevious.disabled = this.viewerNext.disabled = this.viewerReviews.length < 2;
    this.layoutViewer(false);
  }

  moveViewer(direction) {
    if (this.viewerReviews.length < 2) return;
    this.viewerIndex = (this.viewerIndex + direction + this.viewerReviews.length) % this.viewerReviews.length;
    this.renderViewer();
  }

  changeZoom(delta) {
    this.zoom = Math.max(1, Math.min(4, this.zoom + delta));
    this.layoutViewer(true);
  }

  layoutViewer(preserveCenter) {
    if (!this.dialog.open) return;
    this.updateViewerGestureMode();
    const review = this.viewerReviews[this.viewerIndex];
    const viewport = this.viewerViewport;
    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;
    const old = this.viewerLayout;
    const fx = preserveCenter && old ? (viewport.scrollLeft + viewportWidth / 2 - old.x) / old.width : .5;
    const fy = preserveCenter && old ? (viewport.scrollTop + viewportHeight / 2 - old.y) / old.height : .5;
    const width = fitImageWidth(review, viewportWidth, viewportHeight) * this.zoom;
    const height = width * review.height / review.width;
    const canvasWidth = Math.max(viewportWidth, width + 32);
    const canvasHeight = Math.max(viewportHeight, height + 32);
    const x = (canvasWidth - width) / 2;
    const y = (canvasHeight - height) / 2;
    this.viewerImage.style.width = `${width}px`;
    this.viewerCanvas.style.width = `${canvasWidth}px`;
    this.viewerCanvas.style.height = `${canvasHeight}px`;
    this.viewerLayout = { width, height, x, y };
    viewport.scrollTo({ left: preserveCenter ? x + fx * width - viewportWidth / 2 : 0, top: preserveCenter ? y + fy * height - viewportHeight / 2 : 0, behavior: 'auto' });
    this.zoomOutput.value = `${Math.round(this.zoom * 100)}%`;
    this.zoomOut.disabled = this.zoom <= 1;
    this.zoomIn.disabled = this.zoom >= 4;
  }

  finishViewer() {
    this.viewerSwipe = null;
    this.viewerPointers.clear();
    document.body.style.overflow = this.oldBodyOverflow;
    if (this.viewerFromCarousel) {
      this.index = this.viewerIndex;
      this.render();
    }
    if (this.returnFocus?.isConnected) this.returnFocus.focus({ preventScroll: true });
  }
}

document.querySelectorAll('[data-reviews]').forEach(root => new Reviews(root, REVIEWS));
