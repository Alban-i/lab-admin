import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Decoration, EditorView, NodeView } from '@tiptap/pm/view';

type ViewMutationRecord = MutationRecord | { type: 'selection'; target: Node };

export class AudioNodeView implements NodeView {
  dom: HTMLElement;
  contentDOM?: HTMLElement | null;
  node: ProseMirrorNode;
  view: EditorView;
  getPos: () => number | undefined;

  private audio!: HTMLAudioElement;
  private container!: HTMLElement;
  private playButton!: HTMLButtonElement;
  private progressBar!: HTMLElement;
  private progressFill!: HTMLElement;
  private currentTimeEl!: HTMLElement;
  private durationEl!: HTMLElement;
  private titleEl!: HTMLElement;
  private controlsContainer!: HTMLElement;
  private editControls?: HTMLElement;

  private playing = false;
  private duration = 0;
  private currentTime = 0;
  private loading = true;
  private error: string | null = null;
  private durationSet = false;

  constructor(node: ProseMirrorNode, view: EditorView, getPos: () => number | undefined) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;

    // Create wrapper
    this.dom = document.createElement('div');
    this.dom.classList.add('audio-node-view-wrapper');
    this.dom.style.position = 'relative';

    // Create draggable container
    this.container = document.createElement('div');
    this.container.draggable = true;
    this.container.style.position = 'relative';
    this.container.style.cursor = 'move';

    // Create audio element
    this.audio = document.createElement('audio');
    this.audio.src = node.attrs.src || '';
    this.audio.title = node.attrs.title || '';
    this.audio.preload = 'none';
    this.audio.crossOrigin = 'anonymous';
    this.audio.classList.add('w-full');
    this.audio.style.display = 'none'; // Hide native controls

    // Create custom controls container
    this.controlsContainer = document.createElement('div');
    this.controlsContainer.className = 'p-4 bg-gray-50 rounded-md';
    this.controlsContainer.contentEditable = 'false';

    // Build UI
    this.buildUI();

    // Add audio element
    this.container.appendChild(this.audio);
    this.container.appendChild(this.controlsContainer);
    this.dom.appendChild(this.container);

    // Setup event listeners
    this.setupAudioListeners();
    this.setupDragListeners();

    console.log('[AudioNodeView-Vanilla] Component mounted with src:', node.attrs.src);
  }

  private buildUI() {
    const innerContainer = document.createElement('div');
    innerContainer.className = 'space-y-2';

    // Loading state
    if (this.loading && !this.error) {
      const loadingEl = document.createElement('div');
      loadingEl.className = 'text-sm text-gray-500';
      loadingEl.textContent = 'Loading audio...';
      innerContainer.appendChild(loadingEl);
    }

    // Error state
    if (this.error) {
      const errorEl = document.createElement('div');
      errorEl.className = 'p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600';
      errorEl.textContent = this.error;
      innerContainer.appendChild(errorEl);
    }

    // Title
    const titleContainer = document.createElement('div');
    titleContainer.className = 'flex items-center justify-between';

    this.titleEl = document.createElement('div');
    this.titleEl.className = 'font-medium text-gray-900';
    this.titleEl.textContent = this.node.attrs.title || 'Audio';
    titleContainer.appendChild(this.titleEl);

    innerContainer.appendChild(titleContainer);

    // Progress bar
    this.progressBar = document.createElement('div');
    this.progressBar.className = 'h-1.5 bg-gray-200 rounded-full cursor-pointer';
    this.progressBar.addEventListener('click', (e) => this.handleProgressClick(e));

    this.progressFill = document.createElement('div');
    this.progressFill.className = 'h-full bg-blue-500 rounded-full transition-all';
    this.progressFill.style.width = '0%';

    this.progressBar.appendChild(this.progressFill);
    innerContainer.appendChild(this.progressBar);

    // Controls
    const controlsRow = document.createElement('div');
    controlsRow.className = 'flex items-center gap-2';

    // Skip back button
    const skipBackBtn = this.createButton('←', () => this.skip(-10));
    skipBackBtn.title = '« 10s';
    controlsRow.appendChild(skipBackBtn);

    // Play/Pause button
    this.playButton = this.createButton(this.playing ? '❚❚' : '▶', () => this.togglePlay());
    this.playButton.title = this.playing ? 'Pause' : 'Play';
    controlsRow.appendChild(this.playButton);

    // Skip forward button
    const skipForwardBtn = this.createButton('→', () => this.skip(10));
    skipForwardBtn.title = '10s »';
    controlsRow.appendChild(skipForwardBtn);

    // Time display
    const timeDisplay = document.createElement('div');
    timeDisplay.className = 'ml-2 text-sm text-gray-600 font-mono';

    this.currentTimeEl = document.createElement('span');
    this.currentTimeEl.textContent = '0:00';

    const separator = document.createElement('span');
    separator.textContent = ' / ';

    this.durationEl = document.createElement('span');
    this.durationEl.textContent = '0:00';

    timeDisplay.appendChild(this.currentTimeEl);
    timeDisplay.appendChild(separator);
    timeDisplay.appendChild(this.durationEl);

    controlsRow.appendChild(timeDisplay);
    innerContainer.appendChild(controlsRow);

    this.controlsContainer.appendChild(innerContainer);
  }

  private createButton(text: string, onclick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed';
    btn.textContent = text;
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      onclick();
    };
    btn.disabled = !!this.error;
    return btn;
  }

  private setupAudioListeners() {
    this.audio.addEventListener('loadedmetadata', () => {
      console.log('[AudioNodeView-Vanilla] loadedmetadata', this.audio.duration);
      if (isFinite(this.audio.duration) && this.audio.duration > 0 && !this.durationSet) {
        this.duration = this.audio.duration;
        this.durationSet = true;
        this.loading = false;
        this.updateUI();
      }
    });

    this.audio.addEventListener('durationchange', () => {
      console.log('[AudioNodeView-Vanilla] durationchange', this.audio.duration);
      if (isFinite(this.audio.duration) && this.audio.duration > 0 && !this.durationSet) {
        this.duration = this.audio.duration;
        this.durationSet = true;
        this.loading = false;
        this.updateUI();
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.audio.currentTime;
      this.updateProgress();
    });

    this.audio.addEventListener('play', () => {
      this.playing = true;
      this.updatePlayButton();
    });

    this.audio.addEventListener('pause', () => {
      this.playing = false;
      this.updatePlayButton();
    });

    this.audio.addEventListener('ended', () => {
      this.playing = false;
      this.updatePlayButton();
    });

    this.audio.addEventListener('error', () => {
      console.error('[AudioNodeView-Vanilla] Audio error', this.audio.error);
      let errorMessage = 'Failed to load audio';
      if (this.audio.error) {
        switch (this.audio.error.code) {
          case 1:
            errorMessage = 'Audio loading aborted';
            break;
          case 2:
            errorMessage = 'Network error while loading audio';
            break;
          case 3:
            errorMessage = 'Audio decoding failed';
            break;
          case 4:
            errorMessage = 'Audio format not supported';
            break;
        }
      }
      this.error = errorMessage;
      this.loading = false;
      this.updateUI();
    });

    this.audio.addEventListener('loadstart', () => {
      this.loading = true;
      this.updateUI();
    });

    this.audio.addEventListener('canplay', () => {
      this.loading = false;
      this.updateUI();
    });
  }

  private setupDragListeners() {
    this.container.addEventListener('dragstart', (e) => {
      e.stopPropagation();
      const pos = this.getPos();
      if (pos !== undefined) {
        const nodeData = {
          pos,
          node: this.node.toJSON(),
        };
        e.dataTransfer?.setData('application/json', JSON.stringify(nodeData));
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
        }
        this.container.style.opacity = '0.5';
      }
    });

    this.container.addEventListener('dragend', () => {
      this.container.style.opacity = '1';
    });
  }

  private togglePlay() {
    if (this.playing) {
      this.audio.pause();
    } else {
      this.audio.play().catch((err) => {
        console.error('[AudioNodeView-Vanilla] Play error', err);
        this.error = 'Failed to play audio: ' + err.message;
        this.updateUI();
      });
    }
  }

  private skip(delta: number) {
    if (!isFinite(this.duration) || this.duration <= 0) return;
    const newTime = Math.max(0, Math.min(this.duration, this.audio.currentTime + delta));
    this.audio.currentTime = newTime;
  }

  private handleProgressClick(e: MouseEvent) {
    if (!isFinite(this.duration) || this.duration <= 0) return;
    const rect = this.progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * this.duration;
    this.audio.currentTime = newTime;
  }

  private updateProgress() {
    const percent = this.duration > 0 && isFinite(this.duration)
      ? (this.currentTime / this.duration) * 100
      : 0;
    this.progressFill.style.width = `${percent}%`;
    this.currentTimeEl.textContent = this.formatTime(this.currentTime);
    this.durationEl.textContent = this.formatTime(this.duration);
  }

  private updatePlayButton() {
    this.playButton.textContent = this.playing ? '❚❚' : '▶';
    this.playButton.title = this.playing ? 'Pause' : 'Play';
  }

  private updateUI() {
    // Rebuild controls with current state
    this.controlsContainer.innerHTML = '';
    this.buildUI();
  }

  private formatTime(time: number): string {
    if (!isFinite(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  selectNode() {
    console.log('[AudioNodeView-Vanilla] Node selected');
    this.dom.classList.add('ProseMirror-selectednode');
    this.showEditControls();
  }

  deselectNode() {
    console.log('[AudioNodeView-Vanilla] Node deselected');
    this.dom.classList.remove('ProseMirror-selectednode');
    this.hideEditControls();
  }

  private showEditControls() {
    if (this.editControls) return;

    this.editControls = document.createElement('div');
    this.editControls.className = 'absolute top-2 right-2 flex gap-2 bg-black/50 p-2 rounded';
    this.editControls.contentEditable = 'false';

    const titleBtn = document.createElement('button');
    titleBtn.type = 'button';
    titleBtn.className = 'p-1 text-white text-xs font-semibold hover:bg-black/20 rounded cursor-pointer';
    titleBtn.textContent = 'Title';
    titleBtn.title = 'Edit title';
    titleBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const newTitle = window.prompt('Enter title:', this.node.attrs.title);
      if (newTitle !== null) {
        const pos = this.getPos();
        if (pos !== undefined) {
          const tr = this.view.state.tr;
          tr.setNodeMarkup(pos, undefined, {
            ...this.node.attrs,
            title: newTitle,
          });
          this.view.dispatch(tr);
        }
      }
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'p-1 hover:bg-black/20 rounded cursor-pointer';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Delete audio';
    deleteBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const pos = this.getPos();
      if (pos !== undefined) {
        const tr = this.view.state.tr;
        tr.delete(pos, pos + this.node.nodeSize);
        this.view.dispatch(tr);
      }
    };

    this.editControls.appendChild(titleBtn);
    this.editControls.appendChild(deleteBtn);
    this.dom.appendChild(this.editControls);
  }

  private hideEditControls() {
    if (this.editControls) {
      this.editControls.remove();
      this.editControls = undefined;
    }
  }

  update(node: ProseMirrorNode, decorations: readonly Decoration[]) {
    if (node.type !== this.node.type) return false;

    this.node = node;

    // Update audio src if changed
    if (node.attrs.src !== this.audio.src) {
      this.audio.src = node.attrs.src;
      this.durationSet = false;
      this.loading = true;
      this.updateUI();
    }

    // Update title if changed
    if (node.attrs.title !== this.titleEl.textContent) {
      this.titleEl.textContent = node.attrs.title || 'Audio';
    }

    return true;
  }

  destroy() {
    console.log('[AudioNodeView-Vanilla] Component destroyed');
    this.audio.pause();
    this.audio.src = '';
  }

  stopEvent(event: Event): boolean {
    // Let drag events bubble up for drag-and-drop to work
    if (event.type === 'dragstart' || event.type === 'drop') {
      return false;
    }
    // Stop all other events (clicks, etc.) from propagating to editor
    return true;
  }

  ignoreMutation(mutation: ViewMutationRecord): boolean {
    // Ignore all mutations within this node view
    return true;
  }
}
