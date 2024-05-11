FROM python:latest

RUN apt-get update && apt-get install -y jq && apt-get install -y git
RUN pip install requests

COPY ./run_tests.py /python/run_tests.py
COPY ./update_submission.py /python/update_submission.py

COPY entry-point.sh ~/entry-point.sh

CMD [ "~/entry-point.sh" ]