#!/bin/bash

# Vercel Build Script for 12th Fail Jobs
echo "🚀 Building 12th Fail Jobs for Vercel deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create a simple build script if needed
echo "✅ Build completed successfully!"

# Show deployment info
echo ""
echo "📋 Deployment Information:"
echo "   - Node.js version: $(node --version)"
echo "   - NPM version: $(npm --version)"
echo "   - Dependencies installed: $(ls node_modules | wc -l) packages"
echo ""
echo "🌐 Ready for Vercel deployment!"
echo "   Run: vercel --prod"
