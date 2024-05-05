FROM python:latest

COPY ./python/run_tests.py /python/run_tests.py

COPY ./entry-point.sh ~/entry-point.sh

ENV API_URL=http://192.168.1.100:3000
ENV SUBMISSION_ID=f6f9c3bb-0f2c-4b37-8d0f-82f3d167475c

CMD [ "~/entry-point.sh" ]