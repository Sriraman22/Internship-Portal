# ================================
# Azure Internship Portal Setup (Fixed)
# ================================

# 1. Login with Tenant ID
$tenantId = "ef9e1cf5-21e7-4935-9c84-917a5a626c7b"
Write-Host "Logging into Azure tenant $tenantId..."
az login --tenant $tenantId

# 2. Variables (change names if needed)
$rgName        = "InternPortal-RG-India"
$location      = "centralindia"
$sqlServerName = "internportal-sqlsrv123"   # must be globally unique
$sqlAdminUser  = "sqladmin"
$sqlAdminPass  = "StrongP@ssword123!"       # replace with your own secure password
$sqlDbName     = "internportaldb"
$storageName   = "internportalstore123"     # must be globally unique
$containerName = "application-docs"
$appPlan       = "internportal-plan"
$backendApp    = "internportal-backend123"  # must be globally unique
$appInsights   = "internportal-ai"

# 3. Create Resource Group
Write-Host "Creating Resource Group..."
az group create --name $rgName --location $location

# 4. Create Azure SQL Server + Database
Write-Host "Creating SQL Server & Database..."
az sql server create `
  --name $sqlServerName `
  --resource-group $rgName `
  --location $location `
  --admin-user $sqlAdminUser `
  --admin-password $sqlAdminPass

az sql db create `
  --resource-group $rgName `
  --server $sqlServerName `
  --name $sqlDbName `
  --service-objective S0

# 5. Create Storage Account + Container
Write-Host "Creating Storage Account..."
az storage account create `
  --name $storageName `
  --resource-group $rgName `
  --sku Standard_LRS `
  --kind StorageV2

Write-Host "Creating Blob Container..."
az storage container create `
  --name $containerName `
  --account-name $storageName `
  --auth-mode login

# 6. Create App Service Plan + Backend Web App
Write-Host "Creating App Service Plan..."
az appservice plan create `
  --name $appPlan `
  --resource-group $rgName `
  --sku B1 `
  --is-linux

Write-Host "Creating Backend Web App..."
az webapp create `
  --resource-group $rgName `
  --plan $appPlan `
  --name $backendApp `
  --runtime "NODE:22-lts"

# 7. Register required providers (needed for App Insights)
Write-Host "Registering required providers..."
az provider register --namespace Microsoft.Insights
az provider register --namespace Microsoft.OperationalInsights

# 8. Create Application Insights
Write-Host "Creating Application Insights..."
az monitor app-insights component create `
  --app $appInsights `
  --location $location `
  --resource-group $rgName `
  --application-type web

Write-Host "`n✅ Azure resources created successfully!"
Write-Host "Resource Group: $rgName"
Write-Host "SQL Server: $sqlServerName"
Write-Host "Database: $sqlDbName"
Write-Host "Storage: $storageName"
Write-Host "App Service (Backend): $backendApp"
Write-Host "App Insights: $appInsights"
