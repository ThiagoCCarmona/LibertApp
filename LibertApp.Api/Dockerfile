# Imagem base de compilação
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiar csproj e restaurar dependências
COPY ["LibertApp.Api.csproj", "./"]
RUN dotnet restore "LibertApp.Api.csproj"

# Copiar todo o código e compilar Release
COPY . .
RUN dotnet publish "LibertApp.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Imagem de execução enxuta
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .

# Criar pasta persistente de dados
RUN mkdir -p /app/data

ENTRYPOINT ["dotnet", "LibertApp.Api.dll"]
