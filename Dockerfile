FROM node:18.20.3
WORKDIR /usr/src/app
COPY package*.json ./
ENV PORT 5000
COPY . .
RUN npm install
EXPOSE 5000
ENV MODEL_URL_1='https://storage.googleapis.com/bucket-capstone-care/Autism/model.json'
ENV MODEL_URL_2='https://storage.googleapis.com/bucket-capstone-care/Autism_emotion/model.json'
CMD [ "npm", "run", "start"]