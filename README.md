# ScottyLabs Web CourseAPI

Web API based on [ScottyLabs Python CourseAPI](https://github.com/ScottyLabs/course-api)

For development purposes,
Pull Course Data through the Python CourseAPI.
Pull FCE data from the FCE website.

Check the [wiki](https://github.com/ScottyLabs/course-api-v2/wiki/API-Documentation) for details on API usage.

## Docker

Note: using docker containers requires [docker](https://www.docker.com/), which can be installed [here for mac](https://docs.docker.com/docker-for-mac/), [here for windows](https://docs.docker.com/docker-for-mac/) and [here for linux](https://docs.docker.com/install/). Check out [this](https://docker-curriculum.com/) for a good intro tutorial.

### Scripts
* `npm run reset-mongo` starts a local MongoDB instance in a docker container, deleting all of the data present in any existing instance named `course-api-mongo`. 
* `npm build-docker` builds the course api into a docker container (not including mongo)
* `npm run docker` runs a the course api as a docker container. Must build first (`npm run build-docker`) to get changes to code.