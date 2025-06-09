# Integral Calculator

A full-stack web application for calculating definite integrals of mathematical functions, featuring real-time updates and interactive visualization.

---

## Features

- Calculate definite integrals for a wide range of mathematical functions
- Real-time result updates as you type
- Visualizes the function and the area under the curve
- Supports polynomials, trigonometric, exponential, logarithmic, and composite functions
- Robust error handling and input validation

---

## Prerequisites

- **Python** 3.8+
- **Node.js** 16+
- **npm** 8+
- **Angular CLI**  
  Install globally if not already present:  
  ```bash
  npm install -g @angular/cli
  ```

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/integral-calculator.git
cd integral-calculator
```

### 2. Run the Setup Script

```bash
# On Windows
.\setup.ps1

# On Unix/Linux/MacOS
./setup.sh
```

---

### 3. Backend Setup

1. **Create a virtual environment** (recommended):
    ```bash
    python -m venv venv
    # On Windows:
    venv\Scripts\activate
    # On Unix/Linux/MacOS:
    source venv/bin/activate
    ```

2. **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3. **Start the backend server:**
    ```bash
    cd backend
    uvicorn main:app --reload
    ```
    The backend will be available at [http://localhost:8000](http://localhost:8000)

---

### 4. Frontend Setup

1. **Navigate to the frontend directory:**
    ```bash
    cd integral-calculator
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Start the development server:**
    ```bash
    ng serve
    ```
    The frontend will be available at [http://localhost:4200](http://localhost:4200)

---

## Usage

1. Enter a mathematical function (e.g., `x^2`, `sin(x)`, `exp(x)`)
2. Set the integration limits (`start_x` and `end_x`)
3. The result and graph update automatically as you type
4. The graph displays the function and highlights the area under the curve

---

## Supported Functions

- **Polynomials:** `x^n`, constants
- **Trigonometric:** `sin`, `cos`, `tan`, `cot`, `sec`, `csc`
- **Exponential/Logarithmic:** `exp`, `e^x`, `log`, `ln`
- **Roots:** `sqrt(x)`
- **Absolute value:** `Abs(x)`
- **Compositions:** e.g., `sin(x^2)`, `e^(-x^2)`

---

## API Documentation

The backend API documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs) when the server is running.

---

## Deployment

The application is deployed on [Render](https://render.com), providing seamless cloud hosting for both frontend and backend services.

---

## License

MIT License

---
