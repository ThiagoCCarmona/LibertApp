# 🌿 LibertApp — Carmelita

> **Aplicativo de Bem-Estar Digital, Foco Consciente e Comunidade Acadêmica Carmelita.**  
> Disponível em **Português (pt-BR)**, **Inglês (en-US)** e **Espanhol (es-ES)**.

---

## 📱 Visão Geral da Arquitetura

O **LibertApp** é composto por três camadas integradas:

```
┌────────────────────────────────────────────────────────┐
│                   LibertApp (Frontend)                │
│  React 18 + TypeScript + Vite + TailwindCSS + i18n     │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌──────────────────────────────┐ ┌──────────────────────────────────┐
│     LibertApp.Mobile         │ │         LibertApp.Api            │
│  .NET 10 MAUI (Android)      │ │  .NET 10 Web API + SQLite Core   │
│  - HybridWebView Bridge      │ │  - Autenticação JWT & BCrypt     │
│  - Background AlarmManager   │ │  - Posts, Curtidas & Comentários │
│  - Notificações em 2º plano  │ │  - Conquistas, Seguir & Notifs   │
│  - Permissões Nativas        │ │  - Painel de Gestão Admin        │
└──────────────────────────────┘ └──────────────────────────────────┘
```

---

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos
- **Node.js** (v18 ou superior) & `npm`
- **.NET 10 SDK** (com workload `maui-android` para a versão mobile)
- **Java JDK 17+** e **Android SDK** (Android API 34/35 instalada via Android Studio ou CLI)

---

### 1. Backend (`LibertApp.Api`)

1. Navegue até a pasta da API:
   ```bash
   cd LibertApp.Api
   ```
2. Restaure os pacotes e execute o servidor:
   ```bash
   dotnet restore
   dotnet run
   ```
   * O servidor iniciará em `http://localhost:5000` (ou na porta configurada no `appsettings.json`).
   * O banco SQLite `libertapp.db` é criado automaticamente com migrações e seed inicial de conquistas e usuário administrador.

---

### 2. Frontend Web / Híbrido (`src`)

1. Na raiz do projeto, instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento Vite:
   ```bash
   npm run dev
   ```
   * Abra seu navegador em `http://localhost:5173`.
   * Para alternar o idioma, acesse a aba **Perfil** e selecione 🇧🇷 Português, 🇺🇸 English ou 🇪🇸 Español.

---

### 3. Aplicativo Mobile Android (`LibertApp.Mobile`)

1. **Compilar os arquivos web para o bundle do app**:
   ```bash
   npm run build
   ```
2. **Copiar o bundle para os assets nativos do MAUI**:
   - No PowerShell:
     ```powershell
     Remove-Item -Recurse -Force 'LibertApp.Mobile/Resources/Raw/wwwroot/*'
     Copy-Item -Recurse -Force 'dist/*' 'LibertApp.Mobile/Resources/Raw/wwwroot'
     ```
3. **Executar no emulador ou celular conectado via USB**:
   ```bash
   dotnet build LibertApp.Mobile/LibertApp.Mobile.csproj -t:Run -f net10.0-android
   ```

---

## 📦 Como Gerar o APK Assinado (Android)

Para gerar e atualizar o APK final pronto para instalação em smartphones Android:

```powershell
# 1. Compilar o frontend React
npm run build

# 2. Sincronizar com os assets nativos do MAUI
Remove-Item -Recurse -Force 'LibertApp.Mobile/Resources/Raw/wwwroot/*'
Copy-Item -Recurse -Force 'dist/*' 'LibertApp.Mobile/Resources/Raw/wwwroot'

# 3. Compilar o projeto MAUI para a plataforma Android
dotnet build LibertApp.Mobile/LibertApp.Mobile.csproj -f net10.0-android
```

O arquivo gerado/atualizado é:
📁 **`com.libertapp.carmelita-Signed.apk`** (na raiz do projeto).

Basta transferi-lo via USB ou baixar diretamente no celular Android para instalar.

---

## 🔔 Notificações e Alarmes em 2º Plano / App Fechado

O aplicativo possui uma camada nativa em C# para Android (`LibertApp.Mobile/Platforms/Android`):

- **`BackgroundAlarmReceiver.cs`**: Disparado pelo `AlarmManager` mesmo quando o aparelho está em repouso (*Doze Mode*) ou com o app completamente fechado.
  - Verifica o **Modo Noturno** para respeitar as horas de sono do usuário.
  - Realiza requisição leve à API em background para buscar notificações de seguidores, incentivos e comentários.
  - Exibe notificações com prioridade alta no canal `libertapp_background_channel`.
  - Reagenda automaticamente o próximo alarme.
- **`BootReceiver.cs`**: Escuta o evento `ACTION_BOOT_COMPLETED` e restabelece os alarmes de respiro e monitoramento sempre que o telefone é reiniciado.
- **`BackgroundNotificationManager.cs`**: Gerencia intervalos customizáveis (ex: 30 min, 1h, 2h ou minutos livres) e persiste preferências no `SharedPreferences`.

---

## 🌐 Internacionalização (i18n)

O sistema de tradução dinâmica suporta:
- 🇧🇷 **Português (`pt`)**
- 🇺🇸 **Inglês (`en`)**
- 🇪🇸 **Espanhol (`es`)**

Os arquivos estão centralizados em:
- `src/i18n/translations.ts` — Dicionários completos de tradução de telas, diálogos e permissões.
- `src/i18n/LanguageContext.tsx` — Contexto React e hook `useTranslation()` com persistência em `localStorage` e disparo de eventos reativos.

---

## 🚀 Como Fazer Deploy em Produção (VPS Linux / Docker)

### 1. Deploy da API com `systemd` e `Nginx` (Ubuntu/Debian)

1. Publique a API para Linux x64:
   ```bash
   cd LibertApp.Api
   dotnet publish -c Release -r linux-x64 --self-contained false -o /var/www/libertapp-api
   ```
2. Crie o serviço systemd `/etc/systemd/system/libertapp-api.service`:
   ```ini
   [Unit]
   Description=LibertApp .NET Web API
   After=network.target

   [Service]
   WorkingDirectory=/var/www/libertapp-api
   ExecStart=/usr/bin/dotnet /var/www/libertapp-api/LibertApp.Api.dll
   Restart=always
   RestartSec=10
   KillSignal=SIGINT
   SyslogIdentifier=libertapp-api
   User=www-data
   Environment=ASPNETCORE_ENVIRONMENT=Production
   Environment=ASPNETCORE_URLS=http://localhost:5000

   [Install]
   WantedBy=multi-user.target
   ```
3. Ative e inicie o serviço:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now libertapp-api
   ```
4. Configure o proxy reverso no Nginx com certificado SSL gratuito (Certbot/Let's Encrypt):
   ```nginx
   server {
       server_name api.libertapp.com;

       location / {
           proxy_pass         http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header   Upgrade $http_upgrade;
           proxy_set_header   Connection keep-alive;
           proxy_set_header   Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header   X-Forwarded-Proto $scheme;
       }
   }
   ```

### 2. Deploy com Docker & Docker Compose

```yaml
version: '3.8'

services:
  api:
    build:
      context: ./LibertApp.Api
      dockerfile: Dockerfile
    restart: always
    ports:
      - "5000:5000"
    volumes:
      - libertapp-data:/app/data
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Data Source=/app/data/libertapp.db

volumes:
  libertapp-data:
```

---

## 🛡️ Permissões Nativas do Dispositivo

O app interage diretamente com o hardware e sistema operacional Android:
- **Acesso de Uso (`PACKAGE_USAGE_STATS`)**: Leitura do tempo de tela diário real.
- **Notificações (`POST_NOTIFICATIONS` & `AlarmManager`)**: Avisos de respiro, incentivos e lembretes mesmo com o app fechado.
- **Câmera & Galeria (`CAMERA` / `READ_MEDIA_IMAGES`)**: Captura e upload de fotos de perfil e publicações.
- **Localização GPS (`ACCESS_FINE_LOCATION`)**: Registro de cidade no perfil comunitário.

---

## 📄 Licença e Direitos

Projeto desenvolvido com exclusividade para a **Comunidade Acadêmica Carmelita**. Todos os direitos reservados.