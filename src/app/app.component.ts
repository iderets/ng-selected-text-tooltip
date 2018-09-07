import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  // Publics
  public selectedText: string;

  constructor() {}

  share() {
    console.log('This text will be shared: ', this.selectedText);
    document.getSelection().removeAllRanges();
  }

  showAlert() {
    alert('You have selected the text: ' + this.selectedText);
    document.getSelection().removeAllRanges();
  }

  copyToClipboard() {
    document.execCommand('copy');
    document.getSelection().removeAllRanges();
  }

}
