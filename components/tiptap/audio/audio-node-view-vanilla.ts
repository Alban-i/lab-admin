import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { NodeView, EditorView } from '@tiptap/pm/view';

export class AudioNodeView implements NodeView {
  dom: HTMLElement;
  contentDOM?: HTMLElement;
  private audioElement: HTMLAudioElement;
  private container: HTMLElement;
  private controlsContainer: HTMLElement;
  private progressBar: HTMLElement;
  private progressFill: HTMLElement;
  private playButton: HTMLButtonElement;
  private skipBackButton: HTMLButtonElement;
  private skipForwardButton: HTMLButtonElement;
  private timeDisplay: HTMLElement;
  private titleElement: HTMLElement;
  private editButtonsContainer: HTMLElement | null = null;

  private playing: boolean = false;
  private duration: number = 0;
  private currentTime: number = 0;
  private isDragging: boolean = false;

  constructor(
    public node: ProseMirrorNode,
    public view: EditorView,
    public getPos: () => number | undefined
  ) {
    // Create main wrapper
    this.dom = document.createElement('div');
    this.dom.className = 'audio-node-wrapper relative';
    this.dom.setAttribute('draggable', 'true');

    // Create audio element
    this.audioElement = document.createElement('audio');
    this.audioElement.src = node.attrs.src || '';
    this.audioElement.title = node.attrs.title || '';
    this.audioElement.preload = 'metadata';
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.className = 'w-full';
    this.dom.appendChild(this.audioElement);

    // Create container
    this.container = document.createElement('div');
    this.container.className = 'p-4 bg-gray-50 rounded-md border border-primary';
    this.container.contentEditable = 'false';

    // Create title
    this.titleElement = document.createElement('div');
    this.titleElement.className = 'font-medium text-gray-900 mb-2';
    this.titleElement.textContent = node.attrs.title || 'Audio';
    this.container.appendChild(this.titleElement);

    // Create progress bar
    this.progressBar = document.createElement('div');
    this.progressBar.className = 'h-1.5 bg-gray-200 rounded-full cursor-pointer mb-2';
    this.progressFill = document.createElement('div');
    this.progressFill.className = 'h-full bg-blue-500 rounded-full transition-all';
    this.progressFill.style.width = '0%';
    this.progressBar.appendChild(this.progressFill);
    this.container.appendChild(this.progressBar);

    // Create controls container
    this.controlsContainer = document.createElement('div');
    this.controlsContainer.className = 'flex items-center gap-2';

    // Skip back button
    this.skipBackButton = this.createButton('« 10s', () => this.skip(-10));
    this.skipBackButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';

    // Play/pause button
    this.playButton = this.createButton('Play', () => this.togglePlay());
    this.updatePlayButtonIcon();

    // Skip forward button
    this.skipForwardButton = this.createButton('10s »', () => this.skip(10));
    this.skipForwardButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';

    // Time display
    this.timeDisplay = document.createElement('div');
    this.timeDisplay.className = 'ml-2 text-sm text-gray-600 font-mono';
    this.timeDisplay.textContent = '0:00 / 0:00';

    this.controlsContainer.appendChild(this.skipBackButton);
    this.controlsContainer.appendChild(this.playButton);
    this.controlsContainer.appendChild(this.skipForwardButton);
    this.controlsContainer.appendChild(this.timeDisplay);

    this.container.appendChild(this.controlsContainer);
    this.dom.appendChild(this.container);

    // Attach event listeners
    this.attachAudioEventListeners();
    this.attachUIEventListeners();
  }

  private createButton(title: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.title = title;
    button.className = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3';
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    });
    return button;
  }

  private attachAudioEventListeners() {
    this.audioElement.addEventListener('loadedmetadata', () => {
      if (isFinite(this.audioElement.duration) && this.audioElement.duration > 0) {
        this.duration = this.audioElement.duration;
        this.updateTimeDisplay();
      }
    });

    this.audioElement.addEventListener('durationchange', () => {
      if (isFinite(this.audioElement.duration) && this.audioElement.duration > 0) {
        this.duration = this.audioElement.duration;
        this.updateTimeDisplay();
      }
    });

    this.audioElement.addEventListener('timeupdate', () => {
      this.currentTime = this.audioElement.currentTime;
      this.updateProgressBar();
      this.updateTimeDisplay();
    });

    this.audioElement.addEventListener('play', () => {
      this.playing = true;
      this.updatePlayButtonIcon();
    });

    this.audioElement.addEventListener('pause', () => {
      this.playing = false;
      this.updatePlayButtonIcon();
    });

    this.audioElement.addEventListener('ended', () => {
      this.playing = false;
      this.updatePlayButtonIcon();
    });

    this.audioElement.addEventListener('error', () => {
      console.error('Audio loading error');
    });
  }

  private attachUIEventListeners() {
    // Progress bar click
    this.progressBar.addEventListener('click', (e) => {
      if (!isFinite(this.duration) || this.duration <= 0) return;
      const rect = this.progressBar.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const newTime = pos * this.duration;
      this.audioElement.currentTime = newTime;
    });

    // Drag functionality
    this.dom.addEventListener('dragstart', (e) => {
      this.isDragging = true;
      const pos = this.getPos();
      if (pos === undefined) return;

      const nodeData = {
        pos,
        node: this.node.toJSON(),
      };
      e.dataTransfer?.setData('application/json', JSON.stringify(nodeData));
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
      }
    });

    this.dom.addEventListener('dragend', () => {
      this.isDragging = false;
    });
  }

  private togglePlay() {
    if (this.playing) {
      this.audioElement.pause();
    } else {
      this.audioElement.play().catch((error) => {
        console.error('Failed to play audio:', error);
      });
    }
  }

  private skip(delta: number) {
    if (!isFinite(this.duration) || this.duration <= 0) return;
    const newTime = Math.max(0, Math.min(this.duration, this.audioElement.currentTime + delta));
    this.audioElement.currentTime = newTime;
  }

  private updatePlayButtonIcon() {
    if (this.playing) {
      // Pause icon
      this.playButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
      this.playButton.title = 'Pause';
    } else {
      // Play icon
      this.playButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
      this.playButton.title = 'Play';
    }
  }

  private updateProgressBar() {
    if (this.duration > 0 && isFinite(this.duration)) {
      const percent = (this.currentTime / this.duration) * 100;
      this.progressFill.style.width = `${percent}%`;
    }
  }

  private updateTimeDisplay() {
    this.timeDisplay.textContent = `${this.formatTime(this.currentTime)} / ${this.formatTime(this.duration)}`;
  }

  private formatTime(time: number): string {
    if (!isFinite(time) || time < 0) {
      return '0:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  selectNode() {
    this.dom.classList.add('ProseMirror-selectednode');
    this.showEditButtons();
  }

  deselectNode() {
    this.dom.classList.remove('ProseMirror-selectednode');
    this.hideEditButtons();
  }

  private showEditButtons() {
    if (this.editButtonsContainer) return;

    this.editButtonsContainer = document.createElement('div');
    this.editButtonsContainer.className = 'absolute top-2 right-2 flex gap-2 bg-black/50 p-2 rounded';
    this.editButtonsContainer.contentEditable = 'false';

    // Edit title button
    const titleButton = document.createElement('button');
    titleButton.type = 'button';
    titleButton.className = 'p-1 text-white text-xs font-semibold hover:bg-black/20 rounded cursor-pointer';
    titleButton.textContent = 'Title';
    titleButton.title = 'Edit title';
    titleButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.editTitle();
    });

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'p-1 hover:bg-black/20 rounded cursor-pointer';
    deleteButton.title = 'Delete audio';
    deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
    deleteButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.deleteNode();
    });

    this.editButtonsContainer.appendChild(titleButton);
    this.editButtonsContainer.appendChild(deleteButton);
    this.dom.appendChild(this.editButtonsContainer);
  }

  private hideEditButtons() {
    if (this.editButtonsContainer) {
      this.editButtonsContainer.remove();
      this.editButtonsContainer = null;
    }
  }

  private editTitle() {
    const newTitle = prompt('Enter new title:', this.node.attrs.title || '');
    if (newTitle !== null) {
      const pos = this.getPos();
      if (pos !== undefined) {
        this.view.dispatch(
          this.view.state.tr.setNodeMarkup(pos, undefined, {
            ...this.node.attrs,
            title: newTitle,
          })
        );
      }
    }
  }

  private deleteNode() {
    const pos = this.getPos();
    if (pos !== undefined) {
      const tr = this.view.state.tr.delete(pos, pos + this.node.nodeSize);
      this.view.dispatch(tr);
    }
  }

  update(node: ProseMirrorNode) {
    if (node.type !== this.node.type) {
      return false;
    }

    this.node = node;

    // Update audio source if changed
    if (this.audioElement.src !== node.attrs.src) {
      this.audioElement.src = node.attrs.src || '';
    }

    // Update title if changed
    if (this.titleElement.textContent !== node.attrs.title) {
      this.titleElement.textContent = node.attrs.title || 'Audio';
    }

    return true;
  }

  destroy() {
    // Pause audio before destroying
    this.audioElement.pause();

    // Clean up event listeners (they'll be removed automatically when DOM is removed)
    // but it's good practice to explicitly clean up
    this.audioElement.src = '';
  }

  stopEvent(event: Event): boolean {
    // Let click events through to buttons
    const target = event.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return true;
    }

    // Stop other events from bubbling to the editor
    return event.type !== 'dragstart' && event.type !== 'dragend';
  }

  ignoreMutation(): boolean {
    // Ignore all mutations - we handle updates via the update() method
    return true;
  }
}
