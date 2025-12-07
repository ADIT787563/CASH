$source = Get-Location
$destination = "$source\..\wavegroww_clean_upload"

Write-Host "Creating clean folder at: $destination"

# Create destination if it doesn't exist
if (!(Test-Path -Path $destination)) {
    New-Item -ItemType Directory -Path $destination | Out-Null
}

# Define exclusion lists
$excludeDirs = @(
    "node_modules",
    ".next",
    ".git",
    ".vscode",
    ".vercel",
    "dist",
    "build",
    ".gemini"
)

$excludeFiles = @(
    ".env",
    ".env.local",
    ".env.development.local",
    ".env.test.local",
    ".env.production.local",
    "package-lock.json",
    "yarn.lock",
    "bun.lockb",
    "bun.lock"
)

# Build Robocopy command
$cmdArgs = @(
    "robocopy",
    "`"$source`"",
    "`"$destination`"",
    "/E",
    "/XD"
) + $excludeDirs + @("/XF") + $excludeFiles

# Execute Robocopy
Write-Host "Copying files..."
& $cmdArgs[0] $cmdArgs[1..($cmdArgs.Count - 1)]

Write-Host "`n[SUCCESS] Clean folder created successfully!"
Write-Host "[INFO] Location: $destination"
Write-Host "[IMPORTANT] Upload the CONTENTS of this folder to GitHub. Do NOT upload a ZIP file."
