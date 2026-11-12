@echo off
chcp 65001 >nul
cd /d "%~dp0"
title ComfyUI Prompt Studio - 127.0.0.1:4317
node server.js --open
if errorlevel 1 pause
