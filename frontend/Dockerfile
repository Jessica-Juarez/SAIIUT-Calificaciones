# 1. Usamos una versión de Node compatible con Vite (22)
FROM node:22-alpine

# 2. Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiamos los archivos de dependencias primero (para optimizar caché)
COPY package.json package-lock.json* ./

# 4. Instalamos las dependencias
RUN npm install

# 5. Copiamos el resto del código de tu frontend
COPY . .

# 6. Exponemos el puerto interno que usa Vite
EXPOSE 5173

# 7. Iniciamos el servidor de desarrollo (asegurando que se exponga a la red de Docker)
CMD ["npm", "run", "dev", "--", "--host"]