from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sympy import sympify, Symbol, latex
from scipy import integrate
import numpy as np
from typing import Optional

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

@app.get("/test")
async def test_endpoint():
    return {"message": "Backend is working!"}

@app.post("/calculate-integral", response_model=IntegralResponse)
async def calculate_integral(request: IntegralRequest):
    try:        # Parse the function string
        x = Symbol('x')
        expr = sympify(request.function_string)
        
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
                          for x_val, y_val in zip(x_values, y_values) if y_val is not None]
        
        # Generate LaTeX string with proper formatting for better display
        latex_expr = latex(expr, mode='inline')
        
        # Improve display of common expressions
        if '^' in request.function_string:
            # Ensure proper LaTeX for exponents
            latex_expr = latex_expr.replace(r'^', r'^{') + '}'
        
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
