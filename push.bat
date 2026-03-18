@echo off
setlocal
cd /d "%~dp0"

echo.
echo  Podaj opis zmian (commit message):
echo  -----------------------------------------------
set /p MSG=

if "%MSG%"=="" set MSG=aktualizacja

:: Zwieksz wersje patch w version.json
for /f "delims=" %%V in ('node -e "const v=require('./version.json');const p=v.version.split('.');p[2]=parseInt(p[2])+1;console.log(p.join('.'))"') do set NEW_VER=%%V
node -e "const fs=require('fs');const v=require('./version.json');const p=v.version.split('.');p[2]=parseInt(p[2])+1;v.version=p.join('.');v.history.unshift({version:v.version,date:new Date().toISOString().slice(0,10),changes:['%MSG%']});fs.writeFileSync('version.json',JSON.stringify(v,null,2))"

echo  [VER] Nowa wersja: %NEW_VER%

git add .
git commit -m "v%NEW_VER% — %MSG%"
git push --set-upstream origin main

echo.
if errorlevel 1 (
  echo  [BLAD] Cos poszlo nie tak. Sprawdz komunikaty powyzej.
) else (
  echo  [OK] Wyslano na GitHub! Wersja: %NEW_VER%
)
echo.
pause
endlocal
