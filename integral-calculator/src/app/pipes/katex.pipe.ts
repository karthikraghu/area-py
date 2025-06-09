import { Pipe, PipeTransform } from '@angular/core';
import * as katex from 'katex';

@Pipe({
  name: 'katex',
  standalone: true
})
export class KatexPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }
    
    try {
      // Clean the input value and remove dollar signs if present
      let cleanValue = value.trim();
      
      // Remove surrounding dollar signs if they exist (for inline LaTeX)
      if (cleanValue.startsWith('$') && cleanValue.endsWith('$')) {
        cleanValue = cleanValue.slice(1, -1);
      }
      
      return katex.renderToString(cleanValue, {
        throwOnError: false,
        displayMode: true,
        output: 'html',
        strict: false,
        trust: true,
        macros: {
          "\\f": "f(#1)"
        }
      });    } catch (error) {
      console.error('KaTeX rendering error:', error, 'Input value:', value);
      return `<span style="color: red;">LaTeX Error: ${error}</span>`;
    }  }
}