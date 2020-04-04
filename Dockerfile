FROM node
COPY . /root/course-api-v2/
RUN apt-get update -y
WORKDIR /root/course-api-v2
RUN npm install
CMD [ "bash", "/root/course-api-v2/start.sh" ]