@echo off
if not exist venv\Scripts\activate.bat (
  echo Run setup_windows.bat first.
  pause
  exit /b 1
)
call venv\Scripts\activate.bat
python app.py
