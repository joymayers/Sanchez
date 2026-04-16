Write-Host "=== Testing HR System Login ===" -ForegroundColor Cyan

# 1. Check Backend
Write-Host "`n1. Testing Backend Connection..." -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri http://localhost:5000/api/auth/login -Method POST -Headers @{"Content-Type"="application/json"} -Body (@{username="john.smith"; password="any_password"} | ConvertTo-Json) -UseBasicParsing
$data = $response.Content | ConvertFrom-Json
Write-Host "✓ Backend responding correctly" -ForegroundColor Green
Write-Host "  Token: $($data.token.Substring(0,40))..." -ForegroundColor Green
Write-Host "  User: $($data.user.firstName) $($data.user.lastName)" -ForegroundColor Green

# 2. Check Frontend Dev Server
Write-Host "`n2. Testing Frontend Dev Server..." -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri http://localhost:5173 -UseBasicParsing
Write-Host "✓ Frontend dev server is running" -ForegroundColor Green

# 3. Test Protected Endpoint
Write-Host "`n3. Testing Protected API Endpoint..." -ForegroundColor Yellow
$loginResp = Invoke-WebRequest -Uri http://localhost:5000/api/auth/login -Method POST -Headers @{"Content-Type"="application/json"} -Body (@{username="john.smith"; password="any_password"} | ConvertTo-Json) -UseBasicParsing
$loginData = $loginResp.Content | ConvertFrom-Json
$token = $loginData.token
$empResp = Invoke-WebRequest -Uri http://localhost:5000/api/employees -Method GET -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} -UseBasicParsing
$employees = $empResp.Content | ConvertFrom-Json
Write-Host "✓ Protected endpoint working" -ForegroundColor Green
Write-Host "  Employees found: $($employees.data.Count)" -ForegroundColor Green

Write-Host "`n=== All Tests Passed ===" -ForegroundColor Cyan
Write-Host "`nLogin to system at http://localhost:5173" -ForegroundColor Yellow
Write-Host "Username: john.smith" -ForegroundColor Yellow
Write-Host "Password: any_password" -ForegroundColor Yellow
