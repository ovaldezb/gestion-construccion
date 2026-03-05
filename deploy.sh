#!/bin/bash

# 1. Check for AWS Credentials
aws sts get-caller-identity > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Error: AWS Credentials not found."
    echo "Please run 'aws configure' or set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY."
    exit 1
fi

# 2. Check for .env file
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found."
    echo "Please create a .env file with MONGODB_URI."
    exit 1
fi

# 3. Check MONGODB_URI
grep "localhost" .env > /dev/null
if [ $? -eq 0 ]; then
    echo "⚠️  WARNING: Your MONGODB_URI in .env points to 'localhost'."
    echo "This will likely fail when running on AWS Lambda unless you are using a tunnel."
    read -p "Are you sure you want to deploy with localhost URI? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 1
    fi
fi

# 4. Deploy
echo "🚀 Deploying to AWS..."
./node_modules/.bin/serverless deploy
