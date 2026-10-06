#!/usr/bin/env pwsh
# Quick local start for BeeCritic
# Requires: Docker, .NET 10, Node.js, and Tmdb__ApiKey env var

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }
if (Test-Path "$PSScriptRoot\docker-compose.yml") { $root = $PSScriptRoot }

Set-Location $root

if (-not $env:Tmdb__ApiKey -and -not $env:TMDB_API_KEY) {
  Write-Host "Set your TMDB API key first:" -ForegroundColor Yellow
  Write-Host '  $env:Tmdb__ApiKey = "YOUR_KEY"'
  exit 1
}

if (-not $env:Tmdb__ApiKey -and $env:TMDB_API_KEY) {
  $env:Tmdb__ApiKey = $env:TMDB_API_KEY
}

Write-Host "Starting PostgreSQL..."
docker compose up -d

Write-Host "API: http://localhost:5080  |  Frontend: http://localhost:5173"
Write-Host "Demo login: demo@beecritic.com / Demo1234!"

Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$root\backend\BeeCritic.Api'; `$env:Tmdb__ApiKey='$($env:Tmdb__ApiKey)'; dotnet run --urls http://localhost:5080"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"
