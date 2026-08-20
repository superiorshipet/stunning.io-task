# Multi-stage build for Stunning Builder (.NET 10 + React Vite Client)

# Stage 1: Build React Frontend
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY src/client/package*.json ./
RUN npm install
COPY src/client ./
RUN npm run build

# Stage 2: Build .NET 10 API
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS backend-build
WORKDIR /app/backend
COPY src/StunningBuilder.Api/*.csproj ./
RUN dotnet restore
COPY src/StunningBuilder.Api ./
RUN dotnet publish -c Release -o /app/publish

# Stage 3: Runtime Container
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app
COPY --from=backend-build /app/publish ./
COPY --from=client-build /app/client/dist ./wwwroot

ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

CMD ["sh", "-c", "ASPNETCORE_URLS=http://0.0.0.0:${PORT:-8080} dotnet StunningBuilder.Api.dll"]
