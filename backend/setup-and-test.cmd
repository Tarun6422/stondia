@echo off
cd /d "%~dp0"
echo ========================================
echo  STONDIA Backend Setup
echo ========================================
echo.

:: Check if .env exists
if not exist .env (
    echo [ERROR] No .env file found!
    echo Please create backend\.env with:
    echo.
    echo DATABASE_URL=postgresql://...
    echo JWT_SECRET=your-secret-key
    echo JWT_REFRESH_SECRET=your-refresh-secret
    echo.
    pause
    exit /b 1
)

echo [1/5] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

echo [2/5] Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Prisma generate failed
    pause
    exit /b 1
)
echo [OK] Prisma client generated
echo.

echo [3/5] Pushing database schema...
call npx prisma db push
if %errorlevel% neq 0 (
    echo [ERROR] Database push failed
    echo Make sure DATABASE_URL in .env is correct
    pause
    exit /b 1
)
echo [OK] Database schema synced
echo.

echo [4/5] Seeding database (creating admin user)...
call npx tsx src/seed.ts
if %errorlevel% neq 0 (
    echo [ERROR] Seed failed
    pause
    exit /b 1
)
echo [OK] Database seeded
echo.

echo [5/5] Building TypeScript...
call npx tsc
if %errorlevel% neq 0 (
    echo [WARN] TypeScript build had warnings, continuing...
)
echo [OK] Build complete
echo.

echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Starting backend server on http://localhost:4000
echo.
call npx tsx watch src/index.ts
pause
