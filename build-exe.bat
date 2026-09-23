@echo off
title CareerReady AI - Build Standalone .exe Installer
echo ========================================================
echo  Building CareerReady AI Standalone .exe Packages...
echo  (Generates both NSIS Installer and Portable .exe)
echo ========================================================
npm run dist:win
echo.
echo ========================================================
echo  Build Complete!
echo  Check the 'release' folder for your installable .exe files!
echo ========================================================
pause
