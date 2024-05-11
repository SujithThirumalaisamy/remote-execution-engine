FROM node:latest

RUN apt-get update && apt-get install -y jq && apt-get install -y git

WORKDIR /javascript
RUN npm init es6 -y

COPY ./run_tests.js /javascript/run_tests.js
COPY ./update_submission.js /javascript/update_submission.js

COPY entry-point.sh ~/entry-point.sh

CMD [ "~/entry-point.sh" ]