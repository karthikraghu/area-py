import { Pipe, PipeTransform } from '@angular/core';
import * as katex from 'katex';

@Pipe({
  name: 'katex',
  standalone: true
})
export class KatexPipe implements PipeTransform {
  transform(value: string): string {
    try {
      return katex.renderToString(value, {
        throwOnError: false,
        displayMode: true,
        output: 'html',
        strict: false,
        trust: true,
        macros: {
          "\\f": "f(#1)"
        }
      });
    } catch (error) {
      console.error('KaTeX rendering error:', error);
      return value;
    }
  }
}