
#!/usr/bin/env bash
docker ps | grep 'course-api-mongo' && docker stop course-api-mongo
docker container ls -a | grep 'course-api-mongo' && docker rm course-api-mongo
docker run -d -p 27017:27017 --name course-api-mongo mongo