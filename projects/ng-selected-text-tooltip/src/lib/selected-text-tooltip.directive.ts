import {
  Directive,
  ElementRef,
  EventEmitter,
  OnInit,
  OnDestroy,
  NgZone,
  Input,
  Output,
  ComponentFactoryResolver,
  ApplicationRef,
  Injector,
  EmbeddedViewRef,
  ComponentRef,
  TemplateRef
} from '@angular/core';

import { SelectedTextTooltipContainerComponent } from './selected-text-tooltip-container/selected-text-tooltip-container.component';
import { SelectionRectangle } from './selection-rectangle';

@Directive({
  selector: '[sttSelectedTextTooltip]'
})
export class SelectedTextTooltipDirective implements OnInit, OnDestroy {

  // Inputs
  @Input() sttSelectedTextTooltip: TemplateRef<any>;

  // Outputs
  @Output() sttSelectedText: EventEmitter<string> = new EventEmitter();

  // Prvates
  private hasSelection = false;
  private tooltipComponentRef: ComponentRef<SelectedTextTooltipContainerComponent>;

  /**
   * Constructor
   */

  constructor(
    private elementRef: ElementRef,
    private zone: NgZone,
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector) { }

  /**
   * Component lifecycle
   */

  ngOnInit() {
    // Since not all interactions will lead to an event that is meaningful to the
    // calling context, we want to setup the DOM bindings outside of the Angular
    // Zone. This way, we don't trigger any change-detection digests until we know
    // that we have a computed event to emit.
    this.zone.runOutsideAngular(
      () => {
        // While there are several ways to create a selection on the page, this
        // directive is only going to be concerned with selections that were
        // initiated by MOUSE-based selections within the current element.
        this.elementRef.nativeElement.addEventListener( 'mousedown', this.handleMousedown, false );

        // While the mouse-even takes care of starting new selections within the
        // current element, we need to listen for the selectionchange event in
        // order to pick-up on selections being removed from the current element.
        document.addEventListener( 'selectionchange', this.handleSelectionchange, false );
      }
    );
  }

  ngOnDestroy() {
    // Unbind all handlers, even ones that may not be bounds at this moment.
    this.elementRef.nativeElement.removeEventListener( 'mousedown', this.handleMousedown, false );
    document.removeEventListener( 'mouseup', this.handleMouseup, false );
    document.removeEventListener( 'selectionchange', this.handleSelectionchange, false );
    // Despose tooltip if any
    this.removeTooltip();
  }

  /**
   * Methods
   */

  // Method returns the deepest Element node in the DOM tree that contains the entire range.
  private getRangeContainer(range: Range): Node {
    let container = range.commonAncestorContainer;

    // If the selected node is a Text node, climb up to an element node - in Internet
    // Explorer, the .contains() method only works with Element nodes.
    while ( container.nodeType !== Node.ELEMENT_NODE ) {
      container = container.parentNode;
    }

    return container;
  }

  // Handle mousedown events inside the current element.
  private handleMousedown = () => {
    document.addEventListener( 'mouseup', this.handleMouseup, false );
  }


  // Handle mouseup events anywhere in the document.
  private handleMouseup = () => {
    document.removeEventListener( 'mouseup', this.handleMouseup, false );
    this.processSelection();
  }


  // Handle selectionchange events anywhere in the document.
  private handleSelectionchange = () => {
    // We are using the mousedown / mouseup events to manage selections that are
    // initiated from within the host element. But, we also have to account for
    // cases in which a selection outside the host will cause a local, existing
    // selection (if any) to be removed. As such, we'll only respond to the generic
    // 'selectionchange' event when there is a current selection that is in danger
    // of being removed.
    if ( this.hasSelection ) {
      this.processSelection();
    }
  }


  // Determine if the given range is fully contained within the host element.
  private isRangeFullyContained(range: Range): boolean {
    let selectionContainer = range.commonAncestorContainer;

    // If the selected node is a Text node, climb up to an element node - in Internet
    // Explorer, the .contains() method only works with Element nodes.
    while ( selectionContainer.nodeType !== Node.ELEMENT_NODE ) {
      selectionContainer = selectionContainer.parentNode;
    }

    return this.elementRef.nativeElement.contains(selectionContainer);
  }


  // Inspect the document's current selection and check to see if it should be
  // emitted as a sttSelectedText within the current element.
  private processSelection() {
    const selection = document.getSelection();

    // @TODO: Chagnge that approach to avoid extra event on chaning selection
    // If there is a new selection and an existing selection, let's clear out the
    // existing selection first.
    if (this.hasSelection) {
      // Since emitting event may cause the calling context to change state, we
      // want to run the .emit() inside of the Angular Zone. This way, it can
      // trigger change detection and update the views.
      this.zone.runGuarded(
        () => {
          this.hasSelection = false;
          this.removeTooltip();
          this.sttSelectedText.next('');
        }
      );
    }

    // If the new selection is empty (for example, the user just clicked somewhere
    // in the document), then there's no new selection event to emit.
    if (!selection.rangeCount || !selection.toString()) {
      return;
    }

    const range = selection.getRangeAt(0);
    const rangeContainer = this.getRangeContainer(range);

    // We only want to emit events for selections that are fully contained within the
    // host element. If the selection bleeds out-of or in-to the host, then we'll
    // just ignore it since we don't control the outer portions.
    if (this.elementRef.nativeElement.contains(rangeContainer)) {
      const viewportRectangle = range.getBoundingClientRect();

      // Since emitting event may cause the calling context to change state, we
      // want to run the .emit() inside of the Angular Zone. This way, it can
      // trigger change detection and update the views.
      this.zone.runGuarded(
        () => {
          this.hasSelection = true;
          this.showTooltip(viewportRectangle as SelectionRectangle);
          this.sttSelectedText.emit(selection.toString());
        }
      );
    }
  }

  // Create instance of tooltip component and attach it to body and to angular component tree
  private showTooltip(viewportRectangle: SelectionRectangle) {
    // Clear old tooltip if any
    this.removeTooltip();

    // Create a component reference from the component
    this.tooltipComponentRef = this.componentFactoryResolver
      .resolveComponentFactory(SelectedTextTooltipContainerComponent)
      .create(this.injector);

    // Set position and content for tooltip
    this.tooltipComponentRef.instance.selectionTooltipPosition = {
      top: viewportRectangle ? viewportRectangle.top : 0,
      left: viewportRectangle ? viewportRectangle.left + viewportRectangle.width * 0.5 : 0
    };
    this.tooltipComponentRef.instance.content = this.sttSelectedTextTooltip;

    // Attach component to the appRef so that it's inside the ng component tree
    this.appRef.attachView(this.tooltipComponentRef.hostView);

    // Get DOM element from component
    const domElem = (this.tooltipComponentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;

    // Append DOM element to the body
    document.body.appendChild(domElem);
  }

  // Despose the tooltip once selection is cleared
  private removeTooltip() {
    if (this.tooltipComponentRef) {
      // Detach from angular component tree
      this.appRef.detachView(this.tooltipComponentRef.hostView);

      // Destroy component
      this.tooltipComponentRef.destroy();

      // Reset privat var to avoid duplicated destuction
      this.tooltipComponentRef = null;
    }
  }
}
