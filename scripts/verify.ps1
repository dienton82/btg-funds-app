param()

$ErrorActionPreference = 'Stop'

Write-Host '==> TypeScript check'
& npx tsc -p tsconfig.app.json --noEmit
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ''
Write-Host '==> Production build'
& npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ''
Write-Host '==> Test check'
$packageJson = Get-Content package.json -Raw | ConvertFrom-Json
$hasTestScript = $null -ne $packageJson.scripts.test -and [string]::IsNullOrWhiteSpace($packageJson.scripts.test) -eq $false

if (-not $hasTestScript) {
  Write-Host 'No test script found. Skipping tests.'
  exit 0
}

Write-Host 'Skipping npm test by default because the configured Karma runner may require a local browser environment.'
Write-Host 'Run npm test manually if your environment has the required browser launcher.'
