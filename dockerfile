# Use uma imagem base do Node.js
FROM node:21-alpine3.18

# Crie e defina o diretório de trabalho dentro do contêiner
WORKDIR /usr/src

# Copie os arquivos necessários para o diretório de trabalho
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install
# Copie o restante dos arquivos do projeto para o diretório de trabalho
COPY . .

RUN npm run build

# Exponha a porta em que a aplicação estará rodando (alterada para 10000)
EXPOSE $PORT

# Comando para iniciar a aplicação
CMD ["npm", "start"]
