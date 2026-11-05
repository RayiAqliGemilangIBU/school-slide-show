@echo off
cd /d "%~dp0"
echo Menyinkronkan isi folder media/ dan data JSON...
powershell -ExecutionPolicy Bypass -File "%~dp0sync-data.ps1"
echo.
echo Selesai! Silakan refresh browser TV Anda.
pause
