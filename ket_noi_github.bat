@echo off
echo =========================================
echo DANG KHAI BAO TAI KHOAN VA KET NOI GITHUB...
echo =========================================

git config --global user.email "nguyenthimenvt111@gmail.com"
git config --global user.name "nguyenthimenvt111-afk"

git init
git remote remove origin
git remote add origin https://github.com/nguyenthimenvt111-afk/web-.git
git branch -M main
git add .
git commit -m "Cap nhat giao dien Mobile"
git push -u origin main --force

echo.
echo =========================================
echo XONG! DA KET NOI VA DAY CODE LEN GITHUB THANH CONG.
echo =========================================
pause
