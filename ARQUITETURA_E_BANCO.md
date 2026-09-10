# Documentação Técnica: Arquitetura, Banco de Dados e .NET MAUI

Este documento detalha a arquitetura do **LibertApp**, a modelagem do banco de dados local **SQLite (Entity Framework Core)** e a integração com a aplicação móvel em **.NET MAUI** utilizando o controle **HybridWebView**.

---

## 1. Visão Geral da Arquitetura

O LibertApp adota uma arquitetura híbrida de alto desempenho:
- **Frontend / Camada Visual:** Construída em **React 18 + Tailwind CSS + Lucide Icons** (11 telas completas e responsivas), empacotada pelo **Vite**.
- **Container Mobile:** **.NET MAUI** hospedando o controle nativo `HybridWebView` em tela cheia (`100dvh`), com suporte a Safe Areas.
- **Camada de Negócio e Dados:** Escrita em **C#** com **Entity Framework Core** e banco de dados relacional **SQLite** (`libertapp.db`).
- **Ponte C# ⟷ JavaScript (`HybridBridge`):** Protocolo assíncrono baseado em mensagens JSON para sincronização de dados e chamadas nativas.

```
┌─────────────────────────────────────────────────────────────┐
│                    LibertApp.Mobile (.NET MAUI)             │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    HybridWebView                      │  │
│  │   React + Tailwind (Resources/Raw/wwwroot/index.html) │  │
│  │   • Feed de Comunidade        • Timer Pomodoro        │  │
│  │   • Desafios Gamificados      • Central de Benefícios │  │
│  │   • Carteirinha Digital       • Pódio & Ranking       │  │
│  └───────────────────────────▲───────────────────────────┘  │
│                              │ JSON (window.HybridWebView)  │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │               HybridBridge.cs (Roteador C#)           │  │
│  │   Ações: GET_USER, RECORD_POMODORO, TOGGLE_DESAFIO... │  │
│  └───────────────────────────▲───────────────────────────┘  │
│                              │ Injeção de Dependência (DI)  │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │                     Services (C#)                     │  │
│  │   UserService, PomodoroService, ChallengeService...   │  │
│  └───────────────────────────▲───────────────────────────┘  │
│                              │ Entity Framework Core        │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │                 AppDbContext (SQLite)                 │  │
│  │   libertapp.db (Persistência local segura e offline)   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Modelagem do Banco de Dados (SQLite / EF Core)

O banco de dados SQLite é inicializado automaticamente na primeira execução com `Database.EnsureCreated()` e pré-populado com os dados padrão do aplicativo (*Data Seeding*).

### Entidades Mapeadas:
1. **`Usuario`**:
   - `Id` (PK, int)
   - `Nome` (string): Nome completo (Silvia Mendes)
   - `Email` (string): E-mail do titular
   - `Telefone` (string): Máscara (11) 98765-4321
   - `CPF` (string): Máscara 123.456.789-00
   - `NumeroCarteira` (string): LBT-0001-2024
   - `Pontos` (int): Pontos acumulados na gamificação
   - `Nivel` (int): Nível de benefícios (1 a 5)
2. **`SessaoPomodoro`**:
   - `Id` (PK, int)
   - `UsuarioId` (FK, int)
   - `Tipo` (string): "focus", "short-break", "long-break"
   - `DuracaoMinutos` (int): Duração da sessão
   - `DataHora` (DateTime): Registro da realização
3. **`Desafio`**:
   - `Id` (PK, int)
   - `Titulo` (string): Ex: "Ficar 30 min offline", "Completar 2 Pomodoros"
   - `Categoria` (string): "daily", "weekly", "monthly"
   - `PontosRecompensa` (int): Pontos concedidos
   - `Ativo` (bool): Flag de exibição
4. **`UsuarioDesafio`**:
   - `Id` (PK, int)
   - `UsuarioId` (FK, int)
   - `DesafioId` (FK, int)
   - `Concluido` (bool): Se o usuário marcou o desafio
   - `DataConclusao` (DateTime): Data e hora da marcação
5. **`ParceiroBeneficio`**:
   - `Id` (PK, int)
   - `Nome` (string): Nome do restaurante/café parceiro
   - `Descricao` (string): Especialidade e localização
   - `Emoji` (string): Ícone temático
   - `NivelDesbloqueio` (int): Nível mínimo para desbloquear
   - `UnlockedPadrao` (bool): Desbloqueado desde o início
6. **`FeedPost`**:
   - `Id` (PK, int)
   - `Autor` (string), `AvatarUrl` (string), `TipoPost` (string)
   - `Conteudo` (string), `ImagemUrl` (string opcional), `Likes` (int)
   - `DataPublicacao` (DateTime)

### Localização do Banco SQLite
- **Caminho:** `Path.Combine(FileSystem.AppDataDirectory, "libertapp.db")`
- **Android:** `/data/user/0/com.companyname.libertapp.mobile/files/libertapp.db`
- **Windows:** `%LOCALAPPDATA%\Packages\...\LocalState\libertapp.db`

---

## 3. Ponte de Comunicação C# ⟷ JavaScript (`HybridBridge`)

### Como o React envia dados para o C#
No arquivo `src/services/nativeBridge.ts`:
```typescript
import { sendNativeMessage } from '../services/nativeBridge';

// Obter usuário do banco SQLite
const user = await sendNativeMessage('GET_CURRENT_USER');

// Gravar foco do Pomodoro e ganhar pontos
await sendNativeMessage('RECORD_POMODORO', { tipo: 'focus', minutos: 25 });

// Alternar status de um desafio
await sendNativeMessage('TOGGLE_DESAFIO', 2);
```

### Como o C# responde para o React
No `HybridBridge.cs`, a mensagem é processada pelo serviço correspondente e retornada:
```csharp
object? result = message.Action.ToUpperInvariant() switch
{
    "GET_CURRENT_USER" => await _userService.GetCurrentUserAsync(),
    "GET_DESAFIOS"     => await _challengeService.GetDesafiosAsync(),
    "TOGGLE_DESAFIO"   => await HandleToggleDesafio(message.Payload),
    "RECORD_POMODORO"  => await HandleRecordPomodoro(message.Payload),
    "GET_PARTNERS"     => await _benefitService.GetPartnersAsync(),
    "GET_FEED"         => await _feedService.GetPostsAsync(),
    "UPDATE_PROFILE"   => await HandleUpdateProfile(message.Payload),
    _                  => throw new InvalidOperationException()
};
```

---

## 4. Como Compilar e Rodar o Projeto

1. **Alterou algo no React (telas, cores, CSS)?**
   Rode na raiz do projeto:
   ```bash
   npm run sync:maui
   ```
   *(Esse comando compila o React e copia os novos arquivos para `LibertApp.Mobile/Resources/Raw/wwwroot` automaticamente).*

2. **Abrir e Rodar no Visual Studio:**
   - Abra o arquivo `LibertApp.Mobile/LibertApp.Mobile.csproj` no **Visual Studio 2022**.
   - Selecione o dispositivo de destino: **Emulador Android**, **Dispositivo Físico** ou **Windows Machine**.
   - Pressione **F5** para iniciar a depuração.

3. **Rodar via Linha de Comando (CLI):**
   ```bash
   cd LibertApp.Mobile
   dotnet build -f net11.0-windows10.0.19041.0
   ```
