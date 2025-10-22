#!/bin/bash

# Multi-Brand Email Automation - Complete Deployment Script
# This script helps you deploy all components of the system

set -e  # Exit on error

echo "=================================================="
echo "Multi-Brand Email Automation - Deployment Script"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check prerequisites
echo "Checking prerequisites..."
echo ""

# Check if git is installed
if command -v git &> /dev/null; then
    print_success "Git is installed"
else
    print_error "Git is not installed. Please install git first."
    exit 1
fi

# Check if gh CLI is installed
if command -v gh &> /dev/null; then
    print_success "GitHub CLI is installed"
    HAS_GH=true
else
    print_warning "GitHub CLI not found. Some features will be limited."
    HAS_GH=false
fi

# Check if Python is installed
if command -v python3 &> /dev/null; then
    print_success "Python 3 is installed"
    HAS_PYTHON=true
else
    print_warning "Python 3 not found. Streamlit deployment will be skipped."
    HAS_PYTHON=false
fi

# Check if npm is installed
if command -v npm &> /dev/null; then
    print_success "npm is installed"
    HAS_NPM=true
else
    print_warning "npm not found. Vercel deployment will be limited."
    HAS_NPM=false
fi

echo ""
echo "=================================================="
echo "Deployment Options"
echo "=================================================="
echo ""
echo "1. Deploy Streamlit Dashboard"
echo "2. Create n8n Workflows (manual import required)"
echo "3. Deploy to Vercel"
echo "4. Deploy Everything"
echo "5. Just push to GitHub"
echo "0. Exit"
echo ""

read -p "Select an option (0-5): " choice

case $choice in
    1)
        echo ""
        echo "=================================================="
        echo "Deploying Streamlit Dashboard"
        echo "=================================================="
        echo ""

        if [ "$HAS_PYTHON" = false ]; then
            print_error "Python is required for Streamlit deployment"
            exit 1
        fi

        # Install dependencies
        print_info "Installing Streamlit dependencies..."
        pip3 install -q streamlit pandas requests

        print_success "Dependencies installed"

        # Test locally
        print_info "Testing Streamlit app..."
        print_warning "Press Ctrl+C to stop the test server"
        echo ""

        streamlit run streamlit_dashboard.py &
        STREAMLIT_PID=$!

        sleep 5

        echo ""
        print_info "Streamlit is running at http://localhost:8501"
        print_info "Press Ctrl+C when ready to continue..."

        wait $STREAMLIT_PID

        echo ""
        print_info "To deploy to Streamlit Cloud:"
        echo "1. Go to https://streamlit.io/cloud"
        echo "2. Sign in with GitHub"
        echo "3. Click 'New app'"
        echo "4. Select this repository: IGTA-Tech/multi-brand-email-automation"
        echo "5. Main file: streamlit_dashboard.py"
        echo "6. Click 'Deploy!'"
        echo ""
        print_success "Deployment instructions displayed"
        ;;

    2)
        echo ""
        echo "=================================================="
        echo "Creating n8n Workflow Files"
        echo "=================================================="
        echo ""

        print_info "n8n workflow files are ready in: /n8n-workflows/"
        echo ""
        print_info "To import workflows into n8n:"
        echo "1. Log into your n8n instance"
        echo "2. Go to Workflows"
        echo "3. Click 'Import from File'"
        echo "4. Select a workflow JSON from /n8n-workflows/"
        echo "5. Configure credentials"
        echo "6. Update environment variables"
        echo "7. Test the workflow"
        echo "8. Activate workflow"
        echo ""
        print_warning "You need to configure these credentials in n8n:"
        echo "  - Google OAuth2 (for Sheets/Gmail)"
        echo "  - Airtable Personal Access Token"
        echo "  - Anthropic API Key (as HTTP Header Auth)"
        echo ""
        print_success "Ready to import workflows"
        ;;

    3)
        echo ""
        echo "=================================================="
        echo "Deploying to Vercel"
        echo "=================================================="
        echo ""

        if [ "$HAS_NPM" = false ]; then
            print_error "npm is required for Vercel deployment"
            exit 1
        fi

        # Check if vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            print_info "Installing Vercel CLI..."
            npm install -g vercel
        fi

        print_success "Vercel CLI is ready"
        echo ""

        print_info "Deploying to Vercel..."
        print_warning "You'll need to log in to Vercel"
        echo ""

        # Deploy
        vercel --yes

        echo ""
        print_success "Deployment initiated!"
        print_info "Visit your Vercel dashboard to see the deployment"
        ;;

    4)
        echo ""
        echo "=================================================="
        echo "Deploying Everything"
        echo "=================================================="
        echo ""

        # Push to GitHub
        print_info "Step 1: Pushing to GitHub..."
        git add -A
        git commit -m "Complete deployment setup" || true
        git push origin master
        print_success "Code pushed to GitHub"

        echo ""

        # Streamlit instructions
        print_info "Step 2: Streamlit Dashboard"
        echo "Manual deployment required:"
        echo "1. Go to https://streamlit.io/cloud"
        echo "2. Sign in and deploy from GitHub"
        echo ""
        read -p "Press Enter when Streamlit is deployed..."

        echo ""

        # n8n instructions
        print_info "Step 3: n8n Workflows"
        echo "Manual import required:"
        echo "1. Log into your n8n instance"
        echo "2. Import workflows from /n8n-workflows/"
        echo "3. Configure credentials"
        echo ""
        read -p "Press Enter when n8n workflows are imported..."

        echo ""

        # Vercel deployment
        if [ "$HAS_NPM" = true ]; then
            print_info "Step 4: Deploying to Vercel..."
            if ! command -v vercel &> /dev/null; then
                npm install -g vercel
            fi
            vercel --yes
            print_success "Vercel deployment initiated"
        else
            print_warning "Step 4: npm not found, skipping Vercel deployment"
        fi

        echo ""
        print_success "All deployments initiated!"
        ;;

    5)
        echo ""
        echo "=================================================="
        echo "Pushing to GitHub"
        echo "=================================================="
        echo ""

        git add -A

        echo "Enter commit message (or press Enter for default):"
        read -p "> " commit_msg

        if [ -z "$commit_msg" ]; then
            commit_msg="Update multi-brand email automation system"
        fi

        git commit -m "$commit_msg" || print_warning "No changes to commit"
        git push origin master

        print_success "Pushed to GitHub!"
        echo ""
        print_info "Repository: https://github.com/IGTA-Tech/multi-brand-email-automation"
        ;;

    0)
        print_info "Exiting..."
        exit 0
        ;;

    *)
        print_error "Invalid option"
        exit 1
        ;;
esac

echo ""
echo "=================================================="
echo "Next Steps"
echo "=================================================="
echo ""
echo "1. ✓ Code is on GitHub"
echo "2. Configure n8n workflows with your credentials"
echo "3. Deploy Streamlit dashboard to Streamlit Cloud"
echo "4. Test the complete system end-to-end"
echo "5. Launch your first campaign!"
echo ""
print_success "Deployment script complete!"
echo ""
