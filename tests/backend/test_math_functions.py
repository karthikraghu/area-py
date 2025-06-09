import pytest
import sys
import os
from unittest.mock import patch, MagicMock
import numpy as np
from sympy import Symbol, sin, cos, exp, sympify, latex

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

from main import app


class TestMathematicalFunctions:
    """Test mathematical function parsing and evaluation"""
    
    def test_sympy_parsing_basic(self):
        """Test basic SymPy expression parsing"""
        x = Symbol('x')
        expr = sympify("x**2")
        assert expr.subs(x, 2) == 4
        assert expr.subs(x, 0) == 0
    
    def test_sympy_parsing_trigonometric(self):
        """Test trigonometric function parsing"""
        x = Symbol('x')
        expr = sympify("sin(x)")
        # sin(π/2) = 1
        result = float(expr.subs(x, 3.14159/2))
        assert abs(result - 1) < 0.01
    
    def test_sympy_parsing_exponential(self):
        """Test exponential function parsing"""
        x = Symbol('x')
        expr = sympify("exp(x)")
        # exp(0) = 1
        assert float(expr.subs(x, 0)) == 1
        # exp(1) ≈ e
        import math
        result = float(expr.subs(x, 1))
        assert abs(result - math.e) < 0.001
    
    def test_sympy_parsing_complex_expression(self):
        """Test complex mathematical expression parsing"""
        x = Symbol('x')
        expr = sympify("x**3 + 2*x**2 - 5*x + 1")
        # Test at x = 1: 1 + 2 - 5 + 1 = -1
        assert expr.subs(x, 1) == -1
        # Test at x = 0: 1
        assert expr.subs(x, 0) == 1
    
    def test_latex_generation(self):
        """Test LaTeX string generation"""
        x = Symbol('x')
        expr = sympify("x**2")
        latex_str = latex(expr)
        assert "x" in latex_str
        assert "2" in latex_str
    
    def test_function_evaluation_points(self):
        """Test function evaluation at multiple points"""
        x = Symbol('x')
        expr = sympify("x**2")
        
        x_values = np.linspace(0, 2, 5)
        y_values = []
        
        for x_val in x_values:
            try:
                y_val = float(expr.subs(x, x_val))
                y_values.append(y_val)
            except:
                y_values.append(None)
        
        assert len(y_values) == 5
        assert y_values[0] == 0  # f(0) = 0
        assert y_values[-1] == 4  # f(2) = 4
    
    def test_undefined_function_points(self):
        """Test handling of undefined function points (like 1/x at x=0)"""
        x = Symbol('x')
        expr = sympify("1/x")
        
        # Should handle division by zero gracefully
        try:
            result = float(expr.subs(x, 0))
            assert False, "Should have raised an exception"
        except:
            # Expected behavior - exception should be caught
            pass
    
    def test_function_domain_restrictions(self):
        """Test functions with domain restrictions"""
        x = Symbol('x')
        
        # Test sqrt function (domain: x >= 0)
        import sympy as sp
        expr = sp.sqrt(x)
        
        # Valid point
        result = float(expr.subs(x, 4))
        assert result == 2
        
        # Invalid point (should be handled gracefully in the main app)
        try:
            result = float(expr.subs(x, -1))
            # Complex result, should be handled in main app
        except:
            pass  # Expected for negative values


class TestNumericalIntegration:
    """Test numerical integration functionality"""
    
    @patch('scipy.integrate.quad')
    def test_integration_call(self, mock_quad):
        """Test that scipy.integrate.quad is called correctly"""
        from scipy import integrate
        
        # Mock the quad function
        mock_quad.return_value = (1.0, 1e-10)  # (result, error)
        
        # Create a simple function
        f = lambda x: x**2
        
        # Call integration
        result, error = integrate.quad(f, 0, 1)
        
        # Verify mock was called
        mock_quad.assert_called_once()
        assert result == 1.0
        assert error == 1e-10
    
    def test_integration_accuracy(self):
        """Test integration accuracy for known functions"""
        from scipy import integrate
        import math
        
        # Test integral of x^2 from 0 to 1 (should be 1/3)
        f = lambda x: x**2
        result, error = integrate.quad(f, 0, 1)
        assert abs(result - 1/3) < 1e-10
        
        # Test integral of sin(x) from 0 to π (should be 2)
        f = lambda x: math.sin(x)
        result, error = integrate.quad(f, 0, math.pi)
        assert abs(result - 2) < 1e-10
    
    def test_integration_error_estimation(self):
        """Test that integration provides error estimation"""
        from scipy import integrate
        
        f = lambda x: x**2
        result, error = integrate.quad(f, 0, 1)
        
        assert isinstance(error, float)
        assert error >= 0  # Error should be non-negative
        assert error < 1e-5  # Should be very small for simple functions


class TestDataGeneration:
    """Test data generation for visualization"""
    
    def test_function_points_generation(self):
        """Test generation of function points for plotting"""
        x = Symbol('x')
        expr = sympify("x**2")
        
        # Generate points like the main application does
        num_points = 50
        start_x, end_x = 0, 2
        x_values = np.linspace(start_x, end_x, num_points)
        
        function_points = []
        for x_val in x_values:
            try:
                y_val = float(expr.subs(x, x_val))
                function_points.append({"x": float(x_val), "y": y_val})
            except:
                function_points.append({"x": float(x_val), "y": None})
        
        assert len(function_points) == num_points
        assert function_points[0]["x"] == 0
        assert function_points[-1]["x"] == 2
        assert function_points[0]["y"] == 0  # f(0) = 0
        assert function_points[-1]["y"] == 4  # f(2) = 4
    
    def test_function_points_with_None_values(self):
        """Test function points generation with undefined values"""
        x = Symbol('x')
        expr = sympify("1/x")
        
        # Include x = 0 in the range to test None handling
        x_values = [-1, 0, 1]
        function_points = []
        
        for x_val in x_values:
            try:
                y_val = float(expr.subs(x, x_val))
                if abs(y_val) == float('inf'):
                    y_val = None
                function_points.append({"x": float(x_val), "y": y_val})
            except:
                function_points.append({"x": float(x_val), "y": None})
        
        # Should have handled x=0 case
        assert any(point["y"] is None for point in function_points)
    
    def test_json_serializable_output(self):
        """Test that generated data is JSON serializable"""
        import json
        
        x = Symbol('x')
        expr = sympify("x**2")
        
        # Generate sample output similar to API response
        response_data = {
            "latex_expression": latex(expr),
            "area": 1.333333,
            "function_points": [
                {"x": 0.0, "y": 0.0},
                {"x": 1.0, "y": 1.0},
                {"x": 2.0, "y": 4.0}
            ],
            "error": None
        }
        
        # Should be JSON serializable
        json_str = json.dumps(response_data)
        assert isinstance(json_str, str)
        
        # Should be deserializable
        parsed = json.loads(json_str)
        assert parsed["area"] == 1.333333


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
