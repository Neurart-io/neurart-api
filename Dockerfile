# Usa uma imagem oficial do Node.js para compilar o projeto
FROM node:18 AS builder

# Define o diretório interno da imagem onde o app ficará
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências do projeto e compila o projeto
RUN npm install
COPY . .
RUN npm run build

FROM node:18
WORKDIR /app
# Transfere os arquivos compilados para a imagem final

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY .env .env

# Comando para rodar a API
CMD ["node", "dist/main"]