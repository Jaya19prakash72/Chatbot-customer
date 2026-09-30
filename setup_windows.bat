@echo off
setlocal
py --version
if errorlevel 1 (
 echo Python was not found. Install Python 3.13.5 and the Python Launcher.
 pause
 exit /b 1
)
if not exist venv py -3.13 -m venv venv
call venv\Scripts\activate.bat
python -m pip install --upgrade "pip<26" "setuptools<81" "wheel<1"
python -m pip install --only-binary=:all: -r requirements.txt
if not exist .env copy .env.example .env >nul
python -c "import flask, flask_cors, dotenv, openai; print('Environment OK')"
echo.
echo Setup complete. Run start_windows.bat
pause
