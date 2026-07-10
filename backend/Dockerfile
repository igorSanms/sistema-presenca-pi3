FROM mcr.microsoft.com/dotnet/sdk:10.0 AS dev
WORKDIR /app

# Copia apenas os arquivos de dependência primeiro para aproveitar o cache do Docker
COPY *.csproj ./
RUN dotnet restore

# Copia o resto do código
COPY . ./

# Expõe a porta que a API usa
EXPOSE 5249

# Comando para rodar a aplicação com Watch (Hot Reload ativado)
CMD ["dotnet", "watch", "run", "--urls", "http://0.0.0.0:5249"]