FROM python:latest

RUN apt-get update && apt-get install -y jq
RUN pip install requests

COPY ./run_tests.py /python/run_tests.py
COPY ./update_submission.py /python/update_submission.py

COPY entry-point.sh ~/entry-point.sh


ENV CALLBACK_URL=http://192.168.1.100:3000
ENV SUBMISSION_ID=e441e7bc-0d38-445a-9100-3fb51806af0c

CMD [ "~/entry-point.sh" ]