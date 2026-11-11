@echo off
chcp 65001 >nul
cd /d "%~dp0"
set PROMPT_STUDIO_HOST=0.0.0.0
title ComfyUI Prompt Studio - LAN
node server.js --open
if errorlevel 1 pause
