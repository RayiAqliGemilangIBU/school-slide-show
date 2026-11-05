@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0sync-data.ps1"
start "" "%~dp0index.html"
