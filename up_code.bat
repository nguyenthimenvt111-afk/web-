@echo off
echo =========================================
echo DANG GOM CODE VA DAY LEN GITHUB...
echo =========================================

git add .

:: Tao commit voi thoi gian hien tai de dam bao khong bi trung
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set ngay=%%c-%%b-%%a
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set gio=%%a%%b

git commit -m "Cap nhat code moi - %ngay% %gio%"

git pull --rebase origin main
git push origin main

echo.
echo =========================================
echo XONG! HOAN TAT UP CODE! (Vercel dang build)
echo =========================================
pause
