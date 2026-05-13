# 📤 Publicar no GitHub

## Pré-requisitos

- ✅ Git instalado ([Download](https://git-scm.com/download/win))
- ✅ Conta GitHub ([Criar](https://github.com/signup))
- ✅ Repositório criado no GitHub

## Passos Rápidos

### 1. Configurar Git (primeira vez)

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@example.com"
```

### 2. Inicializar Repositório Local

```bash
cd c:\Users\Juliana\Documents\AddInReformulacao
git init
```

### 3. Adicionar Todos os Arquivos

```bash
git add .
```

### 4. Primeiro Commit

```bash
git commit -m "Initial commit: Outlook add-in com integração Power Automate"
```

### 5. Adicionar Repositório Remoto

```bash
# Substitua URL_DO_SEU_REPOSITORIO pela URL do seu repositório no GitHub
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
```

**Exemplo:**
```bash
git remote add origin https://github.com/juliana/add-in-outlook.git
```

### 6. Fazer Push (enviar para GitHub)

```bash
git branch -M main
git push -u origin main
```

## ✅ Verificar o Push

1. Abra seu repositório no GitHub
2. Você deve ver todos os arquivos lá
3. Pronto! Seu projeto está publicado! 🎉

## 🔄 Futuras Atualizações

Quando fizer mudanças:

```bash
# 1. Ver status das mudanças
git status

# 2. Adicionar arquivos modificados
git add .

# 3. Fazer commit
git commit -m "Descrição das mudanças"

# 4. Fazer push
git push
```

## 📝 Modelo de Commit

Use mensagens descritivas:

```bash
git commit -m "feature: adicionar suporte a Teams"
git commit -m "fix: corrigir erro ao carregar dados"
git commit -m "docs: atualizar guia de configuração"
git commit -m "style: melhorar estilos CSS"
```

## 🔐 Autenticação (primeira vez)

Você pode precisar fazer login:

**Opção 1: Token de Acesso Pessoal (Recomendado)**
1. GitHub > Settings > Developer settings > Personal access tokens
2. Gerar novo token (marque `repo` e `workflow`)
3. Usar o token como senha quando solicitado

**Opção 2: SSH**
1. Gerar chave SSH
2. Adicionar à sua conta GitHub
3. Usar URL SSH: `git@github.com:usuario/repositorio.git`

---

**Seu projeto está pronto para GitHub! 🚀**
