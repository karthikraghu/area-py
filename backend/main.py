from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sympy import Symbol, latex, diff, solve, limit, oo, solveset, S
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application, convert_xor
from scipy import integrate
import numpy as np
from typing import Optional, List

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200",
                   "https://area-py-frontend.onrender.com",
    ],  # Angular dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class IntegralRequest(BaseModel):
    function_string: str
    start_x: float
    end_x: float

class IntegralResponse(BaseModel):
    latex_expression: str
    area: float
    function_points: list = []
    error: Optional[str] = None

class DerivativeRequest(BaseModel):
    function_string: str
    eval_point: Optional[float] = None
    start_x: Optional[float] = None
    end_x: Optional[float] = None

class DerivativeResponse(BaseModel):
    latex_expression: str
    derivative_latex: str
    derivative_value: Optional[float] = None
    function_points: list = []
    derivative_points: list = []
    error: Optional[str] = None

class CriticalPointsRequest(BaseModel):
    function_string: str
    start_x: float
    end_x: float

class CriticalPointsResponse(BaseModel):
    latex_expression: str
    critical_points: list = []
    function_points: list = []
    error: Optional[str] = None

class LimitRequest(BaseModel):
    function_string: str
    approach_value: float
    direction: Optional[str] = None  # '+', '-', or None for both sides

class LimitResponse(BaseModel):
    latex_expression: str
    limit_value: Optional[float] = None
    limit_latex: str
    error: Optional[str] = None

@app.get("/test")
async def test_endpoint():
    return {"message": "Backend is working!"}

@app.post("/calculate-integral", response_model=IntegralResponse)
async def calculate_integral(request: IntegralRequest):
    try:        
        # Parse the function string with enhanced transformations for implicit multiplication
        x = Symbol('x')
          # Use transformations that support implicit multiplication (e.g., "2x", "sin x") and convert ^ to **
        transformations = standard_transformations + (convert_xor, implicit_multiplication_application,)
        expr = parse_expr(request.function_string, transformations=transformations)
        
        # Convert to a callable function
        f = lambda x_val: float(expr.subs(x, x_val))
        
        # Calculate the definite integral
        area, error = integrate.quad(f, request.start_x, request.end_x)
          # Generate function points for plotting
        num_points = 200
        x_values = np.linspace(request.start_x, request.end_x, num_points)
        y_values = []
        for x_val in x_values:
            try:
                y_values.append(float(expr.subs(x, x_val)))
            except:
                y_values.append(None)  # Handle undefined points
          # Create list of [x, y] pairs
        function_points = [{"x": float(x_val), "y": float(y_val) if y_val is not None else None} 
                          for x_val, y_val in zip(x_values, y_values) if y_val is not None]        # Generate LaTeX string without dollar signs for KaTeX display mode
        latex_expr = latex(expr)
        # Remove dollar signs if present since KaTeX displayMode handles them
        if latex_expr.startswith('$') and latex_expr.endswith('$'):
            latex_expr = latex_expr[1:-1]
        
        return IntegralResponse(
            latex_expression=latex_expr,
            area=area,
            function_points=function_points,
            error=None if error < 1e-10 else f"Numerical error: {error}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@app.post("/calculate-derivative", response_model=DerivativeResponse)
async def calculate_derivative(request: DerivativeRequest):
    try:
        x = Symbol('x')
        transformations = standard_transformations + (convert_xor, implicit_multiplication_application,)
        expr = parse_expr(request.function_string, transformations=transformations)
        
        # Calculate the derivative
        derivative_expr = diff(expr, x)
        
        # Generate LaTeX strings
        latex_expr = latex(expr)
        derivative_latex = latex(derivative_expr)
        
        # Calculate derivative value at evaluation point if provided
        derivative_value = None
        if request.eval_point is not None:
            try:
                derivative_value = float(derivative_expr.subs(x, request.eval_point))
            except:
                derivative_value = None
        
        # Generate function and derivative points for plotting
        function_points = []
        derivative_points = []
        
        if request.start_x is not None and request.end_x is not None:
            num_points = 200
            x_values = np.linspace(request.start_x, request.end_x, num_points)
            
            for x_val in x_values:
                try:
                    y_val = float(expr.subs(x, x_val))
                    function_points.append({"x": float(x_val), "y": y_val})
                except:
                    pass
                try:
                    dy_val = float(derivative_expr.subs(x, x_val))
                    derivative_points.append({"x": float(x_val), "y": dy_val})
                except:
                    pass
        
        return DerivativeResponse(
            latex_expression=latex_expr,
            derivative_latex=derivative_latex,
            derivative_value=derivative_value,
            function_points=function_points,
            derivative_points=derivative_points,
            error=None
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@app.post("/find-critical-points", response_model=CriticalPointsResponse)
async def find_critical_points(request: CriticalPointsRequest):
    try:
        x = Symbol('x')
        transformations = standard_transformations + (convert_xor, implicit_multiplication_application,)
        expr = parse_expr(request.function_string, transformations=transformations)
        
        # Calculate the first derivative
        first_derivative = diff(expr, x)
        
        # Calculate the second derivative for classification
        second_derivative = diff(first_derivative, x)
        
        # Solve for critical points where first derivative equals zero
        critical_solutions = solve(first_derivative, x)
        
        # Filter and classify critical points within the given range
        critical_points = []
        for sol in critical_solutions:
            try:
                sol_float = float(sol)
                if request.start_x <= sol_float <= request.end_x:
                    # Classify the critical point using second derivative test
                    second_deriv_val = float(second_derivative.subs(x, sol_float))
                    func_val = float(expr.subs(x, sol_float))
                    
                    if second_deriv_val > 0:
                        point_type = "minimum"
                    elif second_deriv_val < 0:
                        point_type = "maximum"
                    else:
                        point_type = "inflection"
                    
                    critical_points.append({
                        "x": sol_float,
                        "y": func_val,
                        "type": point_type
                    })
            except (TypeError, ValueError):
                # Skip complex or non-numeric solutions
                pass
        
        # Generate function points for plotting
        num_points = 200
        x_values = np.linspace(request.start_x, request.end_x, num_points)
        function_points = []
        
        for x_val in x_values:
            try:
                y_val = float(expr.subs(x, x_val))
                function_points.append({"x": float(x_val), "y": y_val})
            except:
                pass
        
        latex_expr = latex(expr)
        
        return CriticalPointsResponse(
            latex_expression=latex_expr,
            critical_points=critical_points,
            function_points=function_points,
            error=None
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@app.post("/calculate-limit", response_model=LimitResponse)
async def calculate_limit(request: LimitRequest):
    try:
        x = Symbol('x')
        transformations = standard_transformations + (convert_xor, implicit_multiplication_application,)
        expr = parse_expr(request.function_string, transformations=transformations)
        
        # Calculate limit based on direction
        if request.direction == '+':
            limit_result = limit(expr, x, request.approach_value, '+')
        elif request.direction == '-':
            limit_result = limit(expr, x, request.approach_value, '-')
        else:
            limit_result = limit(expr, x, request.approach_value)
        
        # Try to convert to float
        limit_value = None
        try:
            if limit_result == oo:
                limit_latex = r"\infty"
            elif limit_result == -oo:
                limit_latex = r"-\infty"
            else:
                limit_value = float(limit_result)
                limit_latex = latex(limit_result)
        except (TypeError, ValueError):
            limit_latex = latex(limit_result)
        
        latex_expr = latex(expr)
        
        return LimitResponse(
            latex_expression=latex_expr,
            limit_value=limit_value,
            limit_latex=limit_latex,
            error=None
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
