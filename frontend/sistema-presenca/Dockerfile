FROM node:lts AS dev
WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./
RUN npm install

# Copia o resto do código
COPY . ./

# Expõe a porta padrão do Vite
EXPOSE 5173

# Roda o Vite expondo para a rede do Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]