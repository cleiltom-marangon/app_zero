# ===========================
#       BUILDER
# ===========================
FROM node:18 AS builder

WORKDIR /app

# Copia apenas os arquivos necessários primeiro (cache melhor)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do projeto
COPY . .

# Gera o build do Next.js
RUN npm run build

# ===========================
#       RUNNER
# ===========================
FROM node:18

WORKDIR /app

# Copia somente o build gerado e dependências
COPY --from=builder /app .

# Expõe a porta do Next.js
EXPOSE 3000

# Comando final
CMD ["npm", "start"]
