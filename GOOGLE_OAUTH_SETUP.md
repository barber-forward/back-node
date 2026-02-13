# Configuração Google OAuth

## 1. Criar Credenciais no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services** > **Credentials**
4. Clique em **Create Credentials** > **OAuth client ID**
5. Configure a tela de consentimento OAuth se ainda não fez
6. Selecione **Web application** como tipo
7. Configure:
   - **Name**: Barber Forward Backend
   - **Authorized redirect URIs**: 
     - `http://localhost:3333/auth/google/callback` (desenvolvimento)
     - `https://seu-dominio.com/auth/google/callback` (produção)
8. Copie o **Client ID** e **Client Secret**

## 2. Configurar variáveis de ambiente

Adicione no arquivo `.env`:

```env
GOOGLE_CLIENT_ID="seu_client_id_aqui"
GOOGLE_CLIENT_SECRET="seu_client_secret_aqui"
GOOGLE_CALLBACK_URL="http://localhost:3333/auth/google/callback"
```

## 3. Instalar dependências

```bash
npm install passport-google-oauth20 @types/passport-google-oauth20
```

## 4. Executar migração do banco de dados

```bash
npx prisma migrate dev --name add_google_auth
```

## 5. Como funciona

### Endpoints disponíveis:

- **GET /auth/google** - Inicia o fluxo de autenticação com Google
- **GET /auth/google/callback** - Recebe o callback do Google e retorna o token JWT

### Fluxo de autenticação:

1. Frontend redireciona usuário para `GET /auth/google`
2. Usuário faz login no Google
3. Google redireciona para `GET /auth/google/callback`
4. Backend:
   - Verifica se usuário já existe no banco
   - Se não existir, cria novo usuário
   - Gera token JWT
   - Retorna token para o frontend

### Exemplo de uso no frontend:

```javascript
// Redirecionar para login do Google
window.location.href = 'http://localhost:3333/auth/google';

// Ou usar popup
const googleLoginWindow = window.open(
  'http://localhost:3333/auth/google',
  'Google Login',
  'width=500,height=600'
);
```

## 6. Estrutura do usuário no banco

Usuários do Google terão:
- `googleId`: ID único do Google
- `provider`: 'google'
- `password`: null (não precisa de senha)
- `email`, `name`, `avatar`: vêm do perfil do Google

## 7. Segurança

- Usuários com login do Google **não podem** fazer login com senha
- Se tentar fazer login com senha em conta Google, receberá erro
- Cada conta pode ter apenas um método de autenticação (local ou Google)

## 8. Testando

```bash
# 1. Inicie o servidor
npm run start:dev

# 2. Acesse no navegador
http://localhost:3333/auth/google

# 3. Faça login com sua conta Google

# 4. Você receberá um JSON com o token
{
  "statusCode": 200,
  "data": {
    "user": {
      "id": "uuid",
      "name": "Seu Nome",
      "email": "seu@email.com",
      "avatar": "url_da_foto"
    },
    "access_token": "jwt_token_aqui"
  }
}
```

## Próximos passos (opcional)

- Adicionar refresh tokens
- Implementar logout
- Adicionar mais providers (Facebook, GitHub, etc.)
- Vincular contas (permitir login com Google e senha na mesma conta)
