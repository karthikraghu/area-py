import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
import { IntegralService, IntegralRequest } from '../../services/integral.service';
import { MathJaxService } from '../../services/mathjax.service';

// Register Chart.js components
Chart.register(...registerables);

// Custom validator to check basic function syntax
function functionValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  
  if (!value) {
    return { required: true };
  }
  
  // Check for balanced parentheses
  const openParens = (value.match(/\(/g) || []).length;
  const closeParens = (value.match(/\)/g) || []).length;
  
  if (openParens !== closeParens) {
    return { unbalancedParentheses: true };
  }
  
  // Check for common syntax errors
  if (value.includes('++') || value.includes('--') || value.includes('**') || value.includes('//')) {
    return { invalidOperator: true };
  }
  
  // Verify that the function is using the variable 'x'
  if (!value.includes('x') && !value.includes('X')) {
    return { missingVariable: true };
  }
  
  return null;
}

@Component({
  selector: 'app-integral-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './integral-calculator.component.html',
  styleUrls: ['./integral-calculator.component.scss']
})
export class IntegralCalculatorComponent implements OnInit, AfterViewInit {  @ViewChild('integralChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('mathExpression') mathExpressionRef!: ElementRef<HTMLDivElement>;
  
  integralForm: FormGroup;
  result: any = null;
  error: string | null = null;
  chart: Chart | null = null;
  backendStatus: string = 'Checking...';
    // Function selection mode
  useCustomFunction: boolean = true; // Start in custom function mode
  selectedPredefinedFunction: any = null;
    // Predefined functions with descriptive names
  predefinedFunctions = [
    { id: 'linear', name: 'Linear Function', description: 'Simple linear relationship', expression: '2x+1' },
    { id: 'quadratic', name: 'Quadratic Function', description: 'Basic parabola', expression: 'x^2' },
    { id: 'cubic', name: 'Cubic Function', description: 'Third-degree polynomial', expression: 'x^3' },
    { id: 'complex-poly', name: 'Complex Polynomial', description: 'Fourth-degree polynomial', expression: 'x^4-3x^3+x-5' },
    { id: 'sine', name: 'Sine Wave', description: 'Basic trigonometric function', expression: 'sin(x)' },
    { id: 'cosine', name: 'Cosine Wave', description: 'Cosine trigonometric function', expression: 'cos(x)' },
    { id: 'sine-squared', name: 'Sine of x Squared', description: 'Trigonometric composition', expression: 'sin(x^2)' },
    { id: 'sinc', name: 'Sinc-like Function', description: 'Oscillating rational function', expression: 'sin(10x)/x' },
    { id: 'exponential', name: 'Exponential Growth', description: 'Natural exponential function', expression: 'exp(x)' },
    { id: 'exponential-decay', name: 'Exponential Decay', description: 'Negative exponential function', expression: 'exp(-x)' },
    { id: 'gaussian', name: 'Gaussian-like', description: 'Bell-shaped curve component', expression: 'x*exp(-x^2)' },
    { id: 'bell-curve', name: 'Bell Curve', description: 'Classic Gaussian distribution', expression: 'exp(-x^2)' },
    { id: 'logarithmic', name: 'Logarithmic Growth', description: 'Natural logarithm function', expression: 'x*log(x)' },
    { id: 'sqrt-function', name: 'Square Root', description: 'Square root function', expression: 'sqrt(x)' },
    { id: 'inverse', name: 'Inverse Function', description: 'Rational function', expression: '1/x' },
    { id: 'mixed-trig', name: 'Mixed Trigonometric', description: 'Combination of trig functions', expression: '2x*cos(x)+sin(x)' },
    { id: 'damped-oscillation', name: 'Damped Oscillation', description: 'Exponentially damped sine wave', expression: 'exp(-x)*sin(5x)' },
    { id: 'wave-packet', name: 'Wave Packet', description: 'Localized wave function', expression: 'cos(10x)*exp(-x^2)' }
  ];constructor(
    private fb: FormBuilder,
    private integralService: IntegralService,
    private mathJaxService: MathJaxService
  ) {
    this.integralForm = this.fb.group({
      function: ['2x+1', [Validators.required, functionValidator]],
      predefinedFunction: [''], // Empty since we start in custom mode
      startX: [-1, [Validators.required]],
      endX: [1, [Validators.required]]
    }, {
      validators: this.limitRangeValidator
    });
    
    // Don't set initial predefined function since we start in custom mode
  }
  
  // Form-level validator to ensure that endX > startX
  limitRangeValidator(form: AbstractControl): ValidationErrors | null {
    const startX = form.get('startX')?.value;
    const endX = form.get('endX')?.value;
    
    if (startX !== null && endX !== null && startX >= endX) {
      return { invalidLimitRange: true };
    }
    
    return null;
  }

  // Increment the limit value by step amount
  incrementLimit(controlName: 'startX' | 'endX') {
    const control = this.integralForm.get(controlName);
    if (control) {
      const currentValue = control.value || 0;
      control.setValue(parseFloat((currentValue + 0.1).toFixed(1)));
    }
  }
  // Decrement the limit value by step amount
  decrementLimit(controlName: 'startX' | 'endX') {
    const control = this.integralForm.get(controlName);
    if (control) {
      const currentValue = control.value || 0;
      control.setValue(parseFloat((currentValue - 0.1).toFixed(1)));
    }
  }
  // Switch between predefined and custom function input
  toggleFunctionInputMode(useCustom?: boolean) {
    if (useCustom !== undefined) {
      this.useCustomFunction = useCustom;
    } else {
      this.useCustomFunction = !this.useCustomFunction;
    }
    
    if (!this.useCustomFunction) {
      // Switching to predefined mode - set default function if none selected
      if (!this.selectedPredefinedFunction) {
        this.selectedPredefinedFunction = this.predefinedFunctions[0]; // Linear function
        this.integralForm.get('predefinedFunction')?.setValue(this.selectedPredefinedFunction.id);
      }
      // Update the hidden function field with predefined function
      this.integralForm.get('function')?.setValue(this.selectedPredefinedFunction.expression);
    }
  }  // Select a predefined function
  selectPredefinedFunction(functionId: string) {
    const selectedFunc = this.predefinedFunctions.find(f => f.id === functionId);
    if (selectedFunc) {
      this.selectedPredefinedFunction = selectedFunc;
      this.integralForm.get('predefinedFunction')?.setValue(functionId);
      this.integralForm.get('function')?.setValue(selectedFunc.expression);
      
      // Set appropriate default limits for different function types
      switch (selectedFunc.id) {
        case 'linear':
          this.integralForm.get('startX')?.setValue(0);
          this.integralForm.get('endX')?.setValue(3);
          break;
        case 'quadratic':
        case 'cubic':
        case 'gaussian':
        case 'bell-curve':
          this.integralForm.get('startX')?.setValue(-2);
          this.integralForm.get('endX')?.setValue(2);
          break;
        case 'complex-poly':
          this.integralForm.get('startX')?.setValue(-1);
          this.integralForm.get('endX')?.setValue(2);
          break;
        case 'sine':
        case 'cosine':
        case 'sine-squared':
        case 'mixed-trig':
        case 'damped-oscillation':
          this.integralForm.get('startX')?.setValue(0);
          this.integralForm.get('endX')?.setValue(Math.PI);
          break;
        case 'wave-packet':
          this.integralForm.get('startX')?.setValue(-3);
          this.integralForm.get('endX')?.setValue(3);
          break;
        case 'sinc':
          this.integralForm.get('startX')?.setValue(1);
          this.integralForm.get('endX')?.setValue(3);
          break;
        case 'exponential':
          this.integralForm.get('startX')?.setValue(0);
          this.integralForm.get('endX')?.setValue(2);
          break;
        case 'exponential-decay':
          this.integralForm.get('startX')?.setValue(0);
          this.integralForm.get('endX')?.setValue(3);
          break;
        case 'logarithmic':
        case 'sqrt-function':
          this.integralForm.get('startX')?.setValue(1);
          this.integralForm.get('endX')?.setValue(5);
          break;
        case 'inverse':
          this.integralForm.get('startX')?.setValue(1);
          this.integralForm.get('endX')?.setValue(3);
          break;
        default:
          // Keep current limits for unknown functions
          break;
      }
    }
  }
    // Handle predefined function dropdown change
  onPredefinedFunctionChange(event: any) {
    const functionId = event.target.value;
    if (functionId) {
      this.selectPredefinedFunction(functionId);
    }
  }
  
  // Format display for pi, e, etc. in limit displays
  formatLimitDisplay(value: number): string {
    if (Math.abs(value - Math.PI) < 0.01) {
      return 'π';
    } else if (Math.abs(value - Math.E) < 0.01) {
      return 'e';
    } else if (value === 0) {
      return '0';
    } else if (Number.isInteger(value)) {
      return value.toString();
    } else {
      return value.toFixed(2);
    }
  }

  // Get the current function expression for calculation
  getCurrentFunctionExpression(): string {
    if (this.useCustomFunction) {
      return this.integralForm.get('function')?.value || '';
    } else {
      return this.selectedPredefinedFunction?.expression || '';
    }
  }
  
  ngOnInit() {
    // Test backend connection
    this.integralService.testConnection().subscribe({
      next: (response) => {
        this.backendStatus = 'Connected';
        // Initial calculation
        if (this.integralForm.valid) {
          this.calculateIntegral();
        }
      },
      error: (error) => {
        this.backendStatus = 'Not connected';
        this.error = 'Backend server is not available. Please make sure it is running on http://localhost:8000';
      }
    });    this.integralForm.valueChanges
      .pipe(
        debounceTime(300), // Reduced debounce time for more responsive updates
        distinctUntilChanged((prev, curr) => {
          return prev.function === curr.function && 
                 prev.predefinedFunction === curr.predefinedFunction &&
                 prev.startX === curr.startX && 
                 prev.endX === curr.endX;
        })
      )
      .subscribe(() => {
        if (this.integralForm.valid) {
          this.calculateIntegral();
        }      });
  }
  
  ngAfterViewInit() {
    // Initial render of mathematical expression if result exists
    setTimeout(() => {
      if (this.result) {
        this.renderMathExpression();
      }
    }, 100);
  }  calculateIntegral() {
    // Only proceed if the form is valid
    if (!this.integralForm.valid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.integralForm.controls).forEach(key => {
        const control = this.integralForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    const { startX, endX } = this.integralForm.value;
    const functionExpression = this.getCurrentFunctionExpression();
    
    // Clear any previous errors
    this.error = null;
    
    const request: IntegralRequest = {
      function_string: functionExpression,
      start_x: startX,
      end_x: endX
    };    this.integralService.calculateIntegral(request).subscribe({
      next: (response) => {
        this.result = response;
        this.error = response.error || null;
        this.updateChart();
        // Render mathematical expression after result is available
        setTimeout(() => this.renderMathExpression(), 100);
      },
      error: (error) => {
        this.error = error.error?.detail || 'An error occurred while calculating the integral';
        this.result = null;
      }
    });
  }  // Render mathematical expression using MathJax
  renderMathExpression() {
    if (this.result && this.mathJaxService.isMathJaxReady()) {
      const { startX, endX } = this.integralForm.value;
      
      // Format limits for display (handle special values like π)
      const formatLimit = (value: number): string => {
        if (Math.abs(value - Math.PI) < 0.000001) {
          return '\\pi';
        } else if (Math.abs(value - Math.E) < 0.000001) {
          return 'e';
        } else if (Math.abs(value - (2 * Math.PI)) < 0.000001) {
          return '2\\pi';
        } else if (Math.abs(value - (Math.PI / 2)) < 0.000001) {
          return '\\frac{\\pi}{2}';
        } else if (Number.isInteger(value)) {
          return value.toString();
        } else {
          return value.toFixed(2);
        }
      };
      
      const formattedStartX = formatLimit(startX);
      const formattedEndX = formatLimit(endX);
      
      // Render the definite integral
      if (this.mathExpressionRef) {
        const integralExpression = `\\int_{${formattedStartX}}^{${formattedEndX}} ${this.result.latex_expression} \\, dx`;
        this.mathExpressionRef.nativeElement.innerHTML = `$$${integralExpression}$$`;
        this.mathJaxService.renderMath(this.mathExpressionRef.nativeElement);
      }
    }
  }updateChart() {
    if (!this.result || !this.chartCanvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const { startX, endX } = this.integralForm.value;
    
    // Use function points from backend
    const functionPoints = this.result.function_points;
    
    // Create area dataset - only for the points between startX and endX
    const areaData = functionPoints
      .filter((point: {x: number, y: number}) => point.x >= startX && point.x <= endX)
      .map((point: {x: number, y: number}) => ({
        x: point.x,
        y: point.y
      }));
        // Add points at x-axis to create proper area filling
    const areaDataset = {      label: 'Area',
      data: [
        { x: startX, y: 0 },
        ...areaData,
        { x: endX, y: 0 }
      ],
      borderColor: 'rgba(0, 153, 153, 0.6)',
      backgroundColor: 'rgba(0, 153, 153, 0.15)',
      pointRadius: 0,
      fill: true,
      tension: 0.4,
      borderWidth: 1
    };// Create function line dataset using all function points
    const functionDataset = {      label: 'Function',
      data: functionPoints.map((point: {x: number, y: number}) => ({
        x: point.x,
        y: point.y
      })),
      borderColor: 'rgb(0, 153, 153)',
      backgroundColor: 'transparent',
      fill: false,
      pointRadius: 0,
      borderWidth: 2.5,
      tension: 0.3
    };

    // Create x-axis line dataset
    const xAxisDataset = {
      label: 'x-axis',
      data: [
        { x: startX, y: 0 },
        { x: endX, y: 0 }
      ],
      borderColor: 'rgba(0, 0, 0, 0.3)',
      backgroundColor: 'transparent',
      fill: false,
      pointRadius: 0,
      borderWidth: 1
    };    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        datasets: [areaDataset, functionDataset, xAxisDataset]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'x',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            min: startX,
            max: endX,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                size: 12
              }
            }
          },
          y: {
            title: {
              display: true,
              text: 'f(x)',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                size: 12
              }
            }
          }
        },        plugins: {
          tooltip: {
            backgroundColor: 'rgba(0, 153, 153, 0.8)',
            titleFont: {
              size: 13
            },
            bodyFont: {
              size: 13
            },
            padding: 10,
            cornerRadius: 6,
            callbacks: {
              label: function(context) {
                return `f(${context.parsed.x.toFixed(2)}) = ${context.parsed.y.toFixed(4)}`;
              }
            }
          },
          legend: {
            display: false
          },
          title: {
            display: true,
            text: `Area = ${this.result.area.toFixed(6)}`,
            font: {
              size: 16,
              weight: 'bold'
            },
            color: 'rgba(79, 70, 229, 0.9)',
            padding: {
              bottom: 10
            }
          }
        }
      }
    });
  }  // Set function from quick selector
  setFunction(functionExpression: string) {
    this.integralForm.get('function')?.setValue(functionExpression);
    this.useCustomFunction = true; // Switch to custom mode when using quick selector
    // Clear predefined function selection
    this.selectedPredefinedFunction = null;
    this.integralForm.get('predefinedFunction')?.setValue('');
    
    // Set appropriate default limits for different function types
    switch (functionExpression) {
      case 'x^2':
        this.integralForm.get('startX')?.setValue(-2);
        this.integralForm.get('endX')?.setValue(2);
        break;
      case 'sin(x)':
        this.integralForm.get('startX')?.setValue(0);
        this.integralForm.get('endX')?.setValue(Math.PI);
        break;
      case 'exp(x)':
        this.integralForm.get('startX')?.setValue(0);
        this.integralForm.get('endX')?.setValue(2);
        break;
      case '2x+1':
        this.integralForm.get('startX')?.setValue(0);
        this.integralForm.get('endX')?.setValue(3);
        break;
      case 'x^3-3x^2+2x':
        this.integralForm.get('startX')?.setValue(0);
        this.integralForm.get('endX')?.setValue(3);
        break;
      default:
        // Keep current limits for unknown functions
        break;
    }
  }
}