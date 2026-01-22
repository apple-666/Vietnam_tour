@echo off
chcp 65001 >nul
echo ========================================
echo   推送到 GitHub
echo ========================================
echo.
cd /d "%~dp0"
echo 当前目录: %CD%
echo.
echo 正在推送...
git push origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo   推送成功！
    echo ========================================
) else (
    echo ========================================
    echo   推送失败，错误代码: %ERRORLEVEL%
    echo   请检查网络连接后重试
    echo ========================================
)
echo.
echo 按任意键退出...
pause >nul
