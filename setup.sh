#!/bin/bash

# Create project directories
mkdir -p backend
mkdir -p integral-calculator

# Copy backend files
cp requirements.txt backend/
cp main.py backend/

# Create Angular project
cd integral-calculator
ng new integral-calculator --routing --style=scss --skip-git --directory=.

# Install required dependencies
npm install @angular/material @angular/cdk
npm install katex
npm install chart.js @types/chart.js
npm install ngx-charts

# Return to root directory
cd .. 