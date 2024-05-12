FROM node:latest

RUN apt-get update && apt-get install -y jq && apt-get install -y git

WORKDIR /javascript

ARG TESTCASES_GIT=https://github.com/SujithThirumalaisamy/testcases-ee.git

RUN git clone $TESTCASES_GIT

RUN npm init es6 -y

COPY ./run_tests.js /javascript/run_tests.js

COPY entry-point.sh ~/entry-point.sh

CMD [ "~/entry-point.sh" ]