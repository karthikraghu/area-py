import { Injectable } from '@angular/core';

declare global {
  interface Window {
    MathJax: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class MathJaxService {
  
  constructor() { }

  /**
   * Render MathJax in a specific element
   * @param element - The DOM element containing LaTeX markup
   */
  renderMath(element: HTMLElement): void {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([element]).catch((err: any) => {
        console.error('MathJax rendering error:', err);
      });
    }
  }
  /**
   * Convert function expression to proper LaTeX notation
   * @param expression - The mathematical expression
   * @returns LaTeX formatted string
   */
  formatExpression(expression: string): string {
    if (!expression) return '';
    
    let latex = expression;
    
    // Convert common patterns to LaTeX
    latex = latex.replace(/\^(\w)/g, '^{$1}');  // x^2 -> x^{2}
    latex = latex.replace(/\^(-?\d+)/g, '^{$1}');  // x^-1 -> x^{-1}
    latex = latex.replace(/\^(-?[^}]+)/g, '^{$1}');  // Handle complex exponents like x^2
    latex = latex.replace(/\*\*/g, '^');  // ** -> ^
    latex = latex.replace(/\*/g, '\\cdot ');  // * -> \cdot for better formatting
    latex = latex.replace(/sqrt\(/g, '\\sqrt{');  // sqrt( -> \sqrt{
    latex = latex.replace(/sin\(/g, '\\sin(');  // sin( -> \sin(
    latex = latex.replace(/cos\(/g, '\\cos(');  // cos( -> \cos(
    latex = latex.replace(/tan\(/g, '\\tan(');  // tan( -> \tan(
    latex = latex.replace(/log\(/g, '\\log(');  // log( -> \log(
    latex = latex.replace(/ln\(/g, '\\ln(');  // ln( -> \ln(
    
    // Handle exp() function more carefully
    latex = latex.replace(/exp\(([^)]+)\)/g, 'e^{$1}');  // exp(x) -> e^{x}
    
    return latex;
  }

  /**
   * Create a definite integral expression
   * @param functionExpr - The function expression
   * @param lowerLimit - Lower integration limit
   * @param upperLimit - Upper integration limit
   * @returns LaTeX formatted definite integral
   */
  createDefiniteIntegral(functionExpr: string, lowerLimit: number, upperLimit: number): string {
    const formattedFunction = this.formatExpression(functionExpr);
    return `\\int_{${lowerLimit}}^{${upperLimit}} ${formattedFunction} \\, dx`;
  }

  /**
   * Check if MathJax is ready
   * @returns boolean indicating if MathJax is loaded
   */
  isMathJaxReady(): boolean {
    return !!(window.MathJax && window.MathJax.typesetPromise);
  }
}
