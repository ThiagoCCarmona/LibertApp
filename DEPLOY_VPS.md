# Guia de Implantação na VPS com Docker (LibertApp)

Este guia contém as instruções passo a passo para subir o **LibertApp** (Backend .NET 10 API com SQLite + Frontend Web SPA Nginx) na sua máquina VPS usando Docker e Docker Compose.

---

## 1. Pré-requisitos na VPS

Na sua VPS Linux (Ubuntu, Debian ou similar), certifique-se de ter instalado o **Git**, **Docker** e o **Docker Compose**.

Se ainda não tiver o Docker instalado, execute no terminal da VPS:
```bash
# Atualizar repositórios do sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Habilitar e iniciar o Docker
sudo systemctl enable docker
sudo systemctl start docker

# Permitir que seu usuário execute Docker sem sudo (opcional, requer relogar)
sudo usermod -aG docker $USER
```

Verifique as versões instaladas:
```bash
docker --version
docker compose version
```

---

## 2. Clonar o Repositório

No terminal da sua VPS:
```bash
git clone https://github.com/ThiagoCCarmona/LibertApp.git
cd LibertApp
```

---

## 3. Subir a Aplicação

Com o Docker instalado e o repositório clonado, basta executar:

```bash
docker compose up -d --build
```

### O que o Docker Compose faz automaticamente:
1. **`libertapp-api`**: Compila e executa o backend em .NET 10 na porta `8080`.
2. **`libertapp-web`**: Compila a interface React/Vite com Node.js e serve via Nginx na porta `80`.
3. **Proxy Reverso Integrado**: Todas as requisições para `/api/...` na porta 80 são repassadas internamente pelo Nginx para a API .NET, eliminando problemas de CORS no navegador.
4. **Volume Persistente (`libertapp_data`)**: Os dados dos cadastros, posts da comunidade, comentários, histórico do Pomodoro e ranking ficam salvos de forma permanente em `/app/data/libertapp_central.db`.

---

## 4. Verificar se Tudo Está Rodando

1. Verifique os containers ativos:
```bash
docker compose ps
```
Você verá:
- `libertapp_backend` (porta `8080`)
- `libertapp_frontend` (porta `80`)

2. Teste o healthcheck da API:
```bash
curl http://localhost:8080/
```
Resposta esperada:
```json
{"app":"LibertApp Academic API","status":"running","version":"1.0.0","time":"..."}
```

3. Verifique os logs se necessário:
```bash
docker compose logs -f
```

---

## 5. Como Acessar a Aplicação

- **Acesso Web (Navegador dos avaliadores/usuários)**:
  - Abra no navegador: `http://IP_DA_SUA_VPS/` ou `http://seu-dominio.com/`
- **Acesso da API diretamente**:
  - `http://IP_DA_SUA_VPS:8080/`

---

## 6. Configurar o App Mobile (.NET MAUI) para Apontar para a VPS

Para que os celulares ou emuladores usem a VPS central na feira acadêmica:
1. No arquivo `src/services/apiService.ts`, configure:
   ```ts
   return "http://IP_DA_SUA_VPS:8080";
   ```
2. Ou dinamicamente no console do DevTools / interface web:
   ```js
   localStorage.setItem("libertapp_api_url", "http://IP_DA_SUA_VPS:8080");
   ```

---

## 7. Atualizar a Aplicação quando fizer novo commit

Sempre que subir novas alterações para o GitHub:
```bash
cd LibertApp
git pull origin main
docker compose up -d --build
```
> O banco de dados e os cadastros não são apagados, pois o volume `libertapp_data` é mantido.

---

## 8. Backup do Banco de Dados

Para fazer backup do SQLite para seu computador ou pasta local:
```bash
# Copiar o banco de dados do container para a pasta atual
docker cp libertapp_backend:/app/data/libertapp_central.db ./backup_$(date +%Y%m%d).db
```
