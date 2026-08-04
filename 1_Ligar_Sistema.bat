@echo off
color 0B
echo ===================================================
echo        INICIANDO O SISTEMA ACADEMICO
echo ===================================================
echo.
echo Iniciando o banco de dados e os servidores...
docker-compose up -d

echo.
echo Aguardando o sistema ficar pronto (15 segundos)...
timeout /t 15 /nobreak >nul

echo.
echo Abrindo o sistema no navegador! Bom trabalho!
start http://localhost:5173

:: Fecha a telinha preta automaticamente depois de 3 segundos
timeout /t 3 /nobreak >nul
exit
