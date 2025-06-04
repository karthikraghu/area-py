# Install Angular CLI if not already installed
npm install -g @angular/cli

# Create new Angular project
ng new integral-calculator --routing --style=scss --skip-git

# Navigate to project directory
cd integral-calculator

# Install required dependencies
npm install @angular/material @angular/cdk
npm install katex
npm install chart.js @types/chart.js
npm install ngx-charts 