#!/bin/bash
# Time Capsule - Mac/Linux Setup Script

echo "🎉 Time Capsule - Quick Setup Script"
echo "===================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✓ Python found: $PYTHON_VERSION"
else
    echo "✗ Python not found. Please install Python 3.11+"
    exit 1
fi

# Check Node
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js found: $NODE_VERSION"
else
    echo "✗ Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo ""
echo "Setting up backend..."

# Setup backend
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "Installing Python packages..."
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  Backend .env file not found!"
    echo "Please copy .env.example to .env and fill in your Supabase credentials"
    echo ""
    echo "Run: cp .env.example .env"
    echo ""
else
    echo "✓ Backend .env file found"
fi

# Deactivate venv
deactivate

cd ..

echo ""
echo "Setting up frontend..."

# Setup frontend
cd frontend

# Install npm packages
echo "Installing npm packages (this may take a minute)..."
npm install

# Check if .env exists
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  Frontend .env file not found!"
    echo "Please copy .env.example to .env and configure it"
    echo ""
    echo "Run: cp .env.example .env"
    echo ""
else
    echo "✓ Frontend .env file found"
fi

cd ..

echo ""
echo "===================================="
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Create a Supabase project at https://supabase.com"
echo "2. Run the SQL from supabase_schema.sql in Supabase SQL Editor"
echo "3. Create storage bucket 'capsule-media' in Supabase Storage"
echo "4. Configure backend/.env with your Supabase credentials"
echo "5. Configure frontend/.env with your API and Supabase URLs"
echo ""
echo "Then start the servers:"
echo "Backend:  cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "Frontend: cd frontend && npm run dev"
echo ""
echo "📚 For detailed instructions, see QUICKSTART.md"
echo ""
