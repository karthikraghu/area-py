# Integral Calculator ![Uploading image.png…]()
![Uploading image.png…]()
![Uploading image.png…]()
![Uploading image.png…]()


A full-stack web application for calculating definite integrals of mathematical functions, featuring real-time updates and interactive visualization with natural mathematical expression input.

---

## 🚀 Features

- **Smart Expression Parsing**: Supports natural mathematical notation with implicit multiplication (`2x+1`, `sin(2x)`)
- **Real-time Calculation**: Results update automatically as you type
- **Interactive Visualization**: Function graphs with highlighted area under the curve
- **Comprehensive Function Support**: Polynomials, trigonometric, exponential, logarithmic, and composite functions
- **Robust Error Handling**: Input validation with helpful error messages
- **Modern UI**: Clean, responsive interface built with Angular and Tailwind CSS
- **Fast Backend**: High-performance Python backend with FastAPI and SymPy
- **Comprehensive Testing**: Full test suite for both frontend and backend components

## 🛠️ Technology Stack

### Backend

- **Python 3.8+** with FastAPI for high-performance API
- **SymPy** for symbolic mathematics and expression parsing
- **SciPy** for numerical integration


### Frontend

- **Angular 18+** with standalone components
- **TypeScript** for type safety
- **Tailwind CSS** for modern styling


### Testing

- **pytest** for backend testing
- Comprehensive test coverage for all features

---

## 📋 Prerequisites

- **Python** 3.8+
- **Node.js** 16+
- **npm** 8+
- **Angular CLI**  
  Install globally if not already present:
  ```bash
  npm install -g @angular/cli
  ```

---

## 🚀 Quick Start

### Automated Setup (Recommended)

For the fastest setup, use the provided PowerShell script:

```powershell
# Clone the repository
git clone <your-repo-url>
cd area-py

# Run the automated setup script
.\setup_frontend.ps1
```

This script will:

- Install all Python dependencies
- Install all Node.js dependencies
- Start both backend and frontend servers
- Open the application in your browser

### Manual Setup

If you prefer to set up manually or need more control:

### 1. Backend Setup

1. **Create and activate a virtual environment:**

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
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   Backend available at: [http://localhost:8000](http://localhost:8000)  
   API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 2. Frontend Setup

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
   ng serve --open
   ```
   Frontend available at: [http://localhost:4200](http://localhost:4200)

---

## 💡 Usage

1. **Open the application** at [http://localhost:4200](http://localhost:4200)
2. **Enter a mathematical function** using natural notation (e.g., `2x+1`, `x^2`, `sin(x)`)
3. **Set integration limits** with the start and end values
4. **View results instantly** - the integral value and interactive graph update in real-time
5. **Explore the visualization** - see your function plotted with the area under the curve highlighted

### 🔤 Expression Input

The calculator supports **natural mathematical notation** with smart parsing:

#### ✅ Supported Formats:

- **Implicit Multiplication**: `2x+1`, `3x^2`, `sin(2x)`, `2sin(x)`
- **Power Notation**: `x^2`, `x^3`, `2x^2+3x+1`
- **Function Composition**: `sin(2x)`, `cos(x^2)`, `exp(-x^2)`
- **Natural Expressions**: `x^2+2x+1`, `2x*cos(x)`, `3x^2*sin(x)`

#### 💡 Examples:

```
2x+1          → Linear function with implicit multiplication
3x^2          → Quadratic with coefficient
sin(2x)       → Trigonometric with implicit multiplication
x^2+2x+1      → Polynomial expression
2sin(x)       → Coefficient times function
exp(-x^2)     → Gaussian function
```

---

## 📚 Supported Functions

### 🔢 Polynomials

- **Examples**: `x`, `x^2`, `2x+1`, `5x^2+3x+1`, `x^3-2x^2+x-1`
- **Note**: Implicit multiplication supported! Write `2x` instead of `2*x`

### 📐 Trigonometric Functions

- **Functions**: `sin(x)`, `cos(x)`, `tan(x)`, `cot(x)`, `sec(x)`, `csc(x)`
- **Examples**: `sin(2x)`, `2sin(x)`, `cos(x^2)`, `tan(x/2)`

### 📈 Exponential Functions

- **Format**: `exp(x)` for e^x
- **Examples**: `exp(x)`, `exp(-x)`, `exp(x^2)`, `2exp(-x^2)`
- **Note**: Use `exp(x)` format - `e^x` notation is not supported

### 📊 Logarithmic Functions

- **Natural Log**: `log(x)` for ln(x)
- **Base-10 Log**: `log(x, 10)`
- **Examples**: `log(x)`, `log(x^2)`, `log(x, 10)`
- **Note**: Use `log(x)` for natural log - `ln(x)` notation is not supported

### 🔢 Other Functions

- **Square Root**: `sqrt(x)` or `x^0.5`
- **Absolute Value**: `Abs(x)`
- **Complex Compositions**: `sin(x^2)`, `exp(-x^2)`, `x*sin(x)`, `log(x^2+1)`

### 🌟 Advanced Features

- **Implicit Multiplication**: `2x`, `3x^2`, `sin(2x)` work naturally
- **Power Notation**: Use `^` for exponents (`x^2`, `2x^3`)
- **Function Chaining**: `sin(cos(x))`, `exp(log(x))`
- **Mixed Operations**: `2x*sin(x) + exp(-x^2)`

---

## 🧪 Testing

The project includes comprehensive test suites for both backend and frontend components.

### Backend Tests

```bash
# Run all backend tests
cd area-py
python -m pytest tests/backend/ -v

# Run specific test file
python -m pytest tests/backend/test_main.py -v

# Run tests with coverage
python -m pytest tests/backend/ --cov=backend --cov-report=html
```

**Test Coverage Includes:**

- API endpoint functionality
- Mathematical expression parsing
- Implicit multiplication support
- Error handling scenarios
- Integration calculation accuracy
- Response data structure validation

### Frontend Tests

```bash
# Navigate to frontend directory
cd integral-calculator

# Run unit tests
ng test

# Run end-to-end tests
ng e2e

# Run tests with code coverage
ng test --code-coverage
```

---

## 🔧 API Documentation

The backend provides a RESTful API with automatic documentation:

- **Interactive API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)
- **Alternative Docs**: [http://localhost:8000/redoc](http://localhost:8000/redoc) (ReDoc)

### Main Endpoints

#### `POST /calculate-integral`

Calculate the definite integral of a mathematical function.

**Request Body:**

```json
{
  "function_string": "2x+1",
  "start_x": 0,
  "end_x": 2
}
```

**Response:**

```json
{
  "latex_expression": "2 x + 1",
  "area": 6.0,
  "function_points": [
    {"x": 0.0, "y": 1.0},
    {"x": 0.1, "y": 1.2},
    ...
  ]
}
```

#### `GET /test`

Health check endpoint to verify backend connectivity.

---

## 🚀 Deployment

### Local Development

Both servers run locally:

- **Frontend**: [http://localhost:4200](http://localhost:4200)
- **Backend**: [http://localhost:8000](http://localhost:8000)
- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Production Deployment

The application can be deployed on platforms like:

- **Render** (recommended for full-stack apps)
- **Vercel** (for frontend) + **Heroku** (for backend)
- **AWS**, **Google Cloud**, or **Azure**

---

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Run the test suite**: `pytest tests/` and `ng test`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙋‍♂️ Support

If you encounter any issues or have questions:

1. **Check the [API Documentation](http://localhost:8000/docs)** for backend-related issues
2. **Run the test suite** to verify your setup: `pytest tests/backend/ -v`
3. **Check the browser console** for frontend errors
4. **Verify all dependencies** are installed correctly

---

## ⭐ Acknowledgments

- **SymPy** for powerful symbolic mathematics
- **SciPy** for numerical integration
- **Angular** for the modern frontend framework
- **FastAPI** for the high-performance backend
- **Tailwind CSS** for beautiful styling
