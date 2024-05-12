FROM python:latest

RUN apt-get update && apt-get install -y jq && apt-get install -y git
RUN pip install requests

WORKDIR /python

ARG TESTCASES_GIT=https://github.com/SujithThirumalaisamy/testcases-ee.git

RUN git clone $TESTCASES_GIT

COPY ./run_tests.py /python/run_tests.py

COPY entry-point.sh ~/entry-point.sh

CMD [ "~/entry-point.sh" ]