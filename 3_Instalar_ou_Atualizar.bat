@echo off
color 0A
echo ===================================================
echo      INSTALANDO/ATUALIZANDO O SISTEMA
echo ===================================================
echo.
echo Isso pode demorar alguns minutos. Nao feche a janela!
echo Baixando imagens e construindo o sistema...
echo.

docker-compose up -d --build

echo.
echo ===================================================
echo Instalacao concluida com sucesso! 
echo Agora voce pode fechar esta janela e usar o arquivo
echo "1_Ligar_Sistema.bat" para comecar a trabalhar.
echo ===================================================
pause