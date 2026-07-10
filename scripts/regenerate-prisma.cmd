@echo off
cd /d "%~dp0..\backend"
call node_modules\.bin\prisma.cmd generate
echo Done.
pause
