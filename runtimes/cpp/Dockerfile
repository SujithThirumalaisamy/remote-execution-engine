FROM gcc:latest

RUN apt-get update && apt-get install -y jq && sudo apt install build-essential

COPY ./run_tests.cpp /cpp/run_tests.cpp
COPY ./update_submission.cpp /cpp/update_submission.cpp

COPY entry-point.sh ~/entry-point.sh

ENV CALLBACK_URL=deployed-api-url
ENV SUBMISSION_ID=new-submission-id

CMD [ "~/entry-point.sh" ]