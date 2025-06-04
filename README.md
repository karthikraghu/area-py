# Integral Calculator

A full-stack web application that calculates definite integrals of mathematical functions with real-time updates and visualization.

## Features

- Calculate definite integrals of any valid mathematical function
- Real-time updates as you type
- Visual representation of the function and area under the curve
- Support for various mathematical functions (polynomials, trigonometric, exponential, etc.)
- Error handling and validation

## Prerequisites

- Python 3.8+
- Node.js 16+
- npm 8+
- Angular CLI (`npm install -g @angular/cli`)

## Setup

### Initial Setup

1. Clone this repository
2. Run the setup script:
```bash
# On Windows
.\setup.ps1

# On Unix/Linux/MacOS
./setup.sh
```

### Backend Setup

1. Create a virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the backend server:
```bash
cd backend
uvicorn main:app --reload
```

The backend will be available at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd integral-calculator
```

2. Install dependencies (if not already installed by setup script):
```bash
npm install
```

3. Start the development server:
```bash
ng serve
```

The frontend will be available at http://localhost:4200

## Usage

1. Enter a mathematical function using standard notation (e.g., x^2, sin(x), exp(x))
2. Set the integration limits (start_x and end_x)
3. The result will update automatically as you type
4. The graph will show the function and highlight the area under the curve

## Supported Functions

- Polynomials: x^n, constants
- Trigonometric: sin, cos, tan, cot, sec, csc
- Exponential/logarithmic: exp, e^x, log, ln
- Roots: sqrt(x)
- Absolute value: Abs(x)
- Composition (e.g., sin(x^2), e^(-x^2))

## API Documentation

The backend API documentation is available at http://localhost:8000/docs when the server is running. 