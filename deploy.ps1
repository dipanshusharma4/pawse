# Google Cloud Run Deployment Script for Pawse

# Set variables
$PROJECT_ID = "pawse-fa8af"
$SERVICE_NAME = "pawse-app"
$REGION = "us-central1"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

Write-Host "Starting deployment to Google Cloud Run..." -ForegroundColor Green

# Build and push the container image
Write-Host "Building container image..." -ForegroundColor Yellow
gcloud builds submit --tag $IMAGE_NAME --project $PROJECT_ID

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Deploying to Cloud Run..." -ForegroundColor Yellow

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME `
    --image $IMAGE_NAME `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --port 3000 `
    --memory 512Mi `
    --cpu 1 `
    --max-instances 10 `
    --set-env-vars "NODE_ENV=production" `
    --project $PROJECT_ID

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment successful!" -ForegroundColor Green
    Write-Host "Getting service URL..." -ForegroundColor Yellow
    gcloud run services describe $SERVICE_NAME --region $REGION --project $PROJECT_ID --format "value(status.url)"
} else {
    Write-Host "Deployment failed!" -ForegroundColor Red
    exit 1
}