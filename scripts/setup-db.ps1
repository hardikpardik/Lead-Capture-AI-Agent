$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $root "backend\.env"
$schemaPath = Join-Path $root "database\schema.sql"

if (-not (Test-Path $envPath)) {
  throw "Missing backend\.env. Create it before running database setup."
}

if (-not (Test-Path $schemaPath)) {
  throw "Missing database\schema.sql."
}

function Read-EnvFile($path) {
  $values = @{}

  Get-Content $path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#") -or -not $line.Contains("=")) {
      return
    }

    $parts = $line.Split("=", 2)
    $values[$parts[0].Trim()] = $parts[1].Trim()
  }

  return $values
}

function Find-PostgresTool($toolName) {
  $command = Get-Command $toolName -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  $postgresRoot = "C:\Program Files\PostgreSQL"
  if (Test-Path $postgresRoot) {
    $candidate = Get-ChildItem $postgresRoot -Directory |
      Sort-Object { [int]($_.Name -replace "\D", "") } -Descending |
      ForEach-Object { Join-Path $_.FullName "bin\$toolName.exe" } |
      Where-Object { Test-Path $_ } |
      Select-Object -First 1

    if ($candidate) {
      return $candidate
    }
  }

  throw "$toolName was not found. Install PostgreSQL or add PostgreSQL\bin to PATH."
}

$config = Read-EnvFile $envPath
$dbName = $config["PGDATABASE"]
$dbUser = $config["PGUSER"]
$dbHost = $config["PGHOST"]
$dbPort = $config["PGPORT"]
$dbPassword = $config["PGPASSWORD"]

if (-not $dbName) { throw "PGDATABASE is missing in backend\.env." }
if (-not $dbUser) { throw "PGUSER is missing in backend\.env." }
if (-not $dbHost) { $dbHost = "localhost" }
if (-not $dbPort) { $dbPort = "5432" }

$env:PGPASSWORD = $dbPassword

$createdb = Find-PostgresTool "createdb"
$psql = Find-PostgresTool "psql"

$existsQuery = "SELECT 1 FROM pg_database WHERE datname = '$dbName';"
$exists = & $psql -h $dbHost -p $dbPort -U $dbUser -d postgres -tAc $existsQuery
if ($LASTEXITCODE -ne 0) {
  throw "Could not connect to PostgreSQL using backend\.env. Check that the PostgreSQL service is running and PGPASSWORD is correct."
}

if (($exists | Out-String).Trim() -ne "1") {
  & $createdb -h $dbHost -p $dbPort -U $dbUser $dbName
  if ($LASTEXITCODE -ne 0) {
    throw "Could not create database $dbName."
  }
  Write-Host "Created database $dbName."
} else {
  Write-Host "Database $dbName already exists."
}

& $psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $schemaPath
if ($LASTEXITCODE -ne 0) {
  throw "Could not apply schema to $dbName."
}
Write-Host "Applied schema to $dbName."
