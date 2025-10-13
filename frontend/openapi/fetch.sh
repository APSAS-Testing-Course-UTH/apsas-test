#!/bin/bash

# Fetch the latest OpenAPI specification from the backend services
SERVICES=(
  "identity-service"
  "content-service"
  "submission-service"
  "evaluation-service"
  "support-service"
)
for SERVICE in "${SERVICES[@]}"; do
  echo "Fetching OpenAPI spec for $SERVICE..."
  curl -o "openapi/$SERVICE.json" "http://localhost:8080/api-docs/$SERVICE"
done
echo "All OpenAPI specs fetched successfully."
