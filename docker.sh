
#!/usr/bin/env bash
docker ps | grep 'course-api' && docker stop course-api
docker container ls -a | grep 'course-api' && docker rm course-api
docker run -d -p 3000:3000 --name course-api scottylabs-course-api:2