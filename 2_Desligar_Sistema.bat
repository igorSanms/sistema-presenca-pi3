@echo off
color 0E
echo ===================================================
echo        DESLIGANDO O SISTEMA ACADEMICO
echo ===================================================
echo.
echo Salvando tudo e desligando os servidores de forma segura...
echo Por favor, aguarde alguns segundos...
echo.

docker-compose down

echo.
echo ===================================================
echo Sistema desligado com sucesso! Pode desligar o PC.
echo ===================================================
pause