# Time Capsule - Windows Setup Script
# Run this in PowerShell to set up the project quickly

Write-Host "🎉 Time Capsule - Quick Setup Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python 3.11+" -ForegroundColor Red
    exit 1
}

# Check Node
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Setting up backend..." -ForegroundColor Yellow

# Setup backend
Set-Location backend

# Create virtual environment
if (!(Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Cyan
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& .\venv\Scripts\Activate.ps1

# Install requirements
Write-Host "Installing Python packages..." -ForegroundColor Cyan
pip install -r requirements.txt

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host ""
    Write-Host "⚠️  Backend .env file not found!" -ForegroundColor Yellow
    Write-Host "Please copy .env.example to .env and fill in your Supabase credentials" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run: copy .env.example .env" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✓ Backend .env file found" -ForegroundColor Green
}

# Deactivate venv
deactivate

Set-Location ..

Write-Host ""
Write-Host "Setting up frontend..." -ForegroundColor Yellow

# Setup frontend
Set-Location frontend

# Install npm packages
Write-Host "Installing npm packages (this may take a minute)..." -ForegroundColor Cyan
npm install

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host ""
    Write-Host "⚠️  Frontend .env file not found!" -ForegroundColor Yellow
    Write-Host "Please copy .env.example to .env and configure it" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run: copy .env.example .env" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✓ Frontend .env file found" -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Create a Supabase project at https://supabase.com" -ForegroundColor White
Write-Host "2. Run the SQL from supabase_schema.sql in Supabase SQL Editor" -ForegroundColor White
Write-Host "3. Create storage bucket 'capsule-media' in Supabase Storage" -ForegroundColor White
Write-Host "4. Configure backend/.env with your Supabase credentials" -ForegroundColor White
Write-Host "5. Configure frontend/.env with your API and Supabase URLs" -ForegroundColor White
Write-Host ""
Write-Host "Then start the servers:" -ForegroundColor Yellow
Write-Host "Backend:  cd backend && .\venv\Scripts\activate && uvicorn app.main:app --reload" -ForegroundColor Cyan
Write-Host "Frontend: cd frontend && npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 For detailed instructions, see QUICKSTART.md" -ForegroundColor Yellow
Write-Host ""
