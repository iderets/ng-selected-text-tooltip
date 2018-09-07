import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectedTextTooltipDirective } from './selected-text-tooltip.directive';
import { SelectedTextTooltipContainerComponent } from './selected-text-tooltip-container/selected-text-tooltip-container.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [SelectedTextTooltipDirective, SelectedTextTooltipContainerComponent],
  exports: [SelectedTextTooltipDirective],
  entryComponents: [SelectedTextTooltipContainerComponent]
})
export class NgSelectedTextTooltipModule { }
