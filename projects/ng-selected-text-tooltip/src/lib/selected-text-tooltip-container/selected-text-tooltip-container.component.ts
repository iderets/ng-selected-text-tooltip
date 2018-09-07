import { Component, TemplateRef } from '@angular/core';

@Component({
  selector: 'stt-selected-text-tooltip-container',
  templateUrl: './selected-text-tooltip-container.component.html',
  styleUrls: ['./selected-text-tooltip-container.component.less']
})
export class SelectedTextTooltipContainerComponent {

  // Publics
  public selectionTooltipPosition = {
    top: 0,
    left: 0
  };
  public content: TemplateRef<any>;

  /**
   * Constructor
   */

  constructor() { }

}
