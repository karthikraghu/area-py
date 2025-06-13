import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
import { KatexPipe } from '../../pipes/katex.pipe';
import { IntegralService, IntegralRequest } from '../../services/integral.service';

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
  imports: [CommonModule, ReactiveFormsModule, KatexPipe],
  templateUrl: './integral-calculator.component.html',
  styleUrls: ['./integral-calculator.component.scss']
})
export class IntegralCalculatorComponent implements OnInit {
  @ViewChild('integralChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  integralForm: FormGroup;
  result: any = null;
  error: string | null = null;
  chart: Chart | null = null;
  backendStatus: string = 'Checking...';
  constructor(
    private fb: FormBuilder,
    private integralService: IntegralService
  ) {    this.integralForm = this.fb.group({
      function: ['2x+1', [Validators.required, functionValidator]],
      startX: [-1, [Validators.required]],
      endX: [1, [Validators.required]]
    }, {
      validators: this.limitRangeValidator
    });
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
    });

    this.integralForm.valueChanges
      .pipe(
        debounceTime(300), // Reduced debounce time for more responsive updates
        distinctUntilChanged((prev, curr) => {
          return prev.function === curr.function && 
                 prev.startX === curr.startX && 
                 prev.endX === curr.endX;
        })
      )
      .subscribe(() => {
        if (this.integralForm.valid) {
          this.calculateIntegral();
        }
      });
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
    
    const { function: func, startX, endX } = this.integralForm.value;
    
    // Clear any previous errors
    this.error = null;
    
    const request: IntegralRequest = {
      function_string: func,
      start_x: startX,
      end_x: endX
    };

    this.integralService.calculateIntegral(request).subscribe({
      next: (response) => {
        this.result = response;
        this.error = response.error || null;
        this.updateChart();
      },
      error: (error) => {
        this.error = error.error?.detail || 'An error occurred while calculating the integral';
        this.result = null;
      }
    });
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
  }
}