import { Component } from '@angular/core';
import { IntegralCalculatorComponent } from './components/integral-calculator/integral-calculator.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IntegralCalculatorComponent],
  template: `
    <div class="min-h-screen bg-gray-100">
      <app-integral-calculator></app-integral-calculator>
    </div>
  `,
  styles: []
})
export class AppComponent {
  title = 'Integral Calculator';
} 