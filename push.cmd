@echo off
chcp 65001 >nul
title CleanSlate Git Push Helper
echo.
echo ========================================
echo   CleanSlate Git Push Helper
echo ========================================
echo.

:: Check if .gitignore exists, if not create it
if not exist ".gitignore" (
    echo Creating .gitignore...
    echo __pycache__/ > .gitignore
    echo *.pyc >> .gitignore
    echo .DS_Store >> .gitignore
    echo .vscode/ >> .gitignore
) else (
    :: Ensure __pycache__ is ignored (append if not already)
    findstr /c:"__pycache__/" .gitignore >nul || echo __pycache__/ >> .gitignore
    findstr /c:"*.pyc" .gitignore >nul || echo *.pyc >> .gitignore
    findstr /c:".DS_Store" .gitignore >nul || echo .DS_Store >> .gitignore
)

:: Check if we are in a merge state
git status --porcelain | find "MERGING" >nul
if %errorlevel%==0 (
    echo [WARNING] You are currently in a merge state.
    echo Please finish the merge by running:
    echo     git commit -m "Merge remote changes"
    echo.
    echo After that, run this script again.
    pause
    exit /b
)

:: Add all changes
echo Adding all changes...
git add .

:: Get commit message
set /p msg="Enter commit message (default: Update CleanSlate): "
if "%msg%"=="" set msg="Update CleanSlate"

:: Commit
echo Committing...
git commit -m "%msg%"
if %errorlevel% neq 0 (
    echo [ERROR] Commit failed. Please check errors.
    pause
    exit /b
)

:: Push to remote
echo Pushing to remote...
git push -u origin main

if %errorlevel%==0 (
    echo.
    echo ========================================
    echo   Push successful!
    echo ========================================
) else (
    echo.
    echo [ERROR] Push failed. Please check your network and credentials.
)

pause