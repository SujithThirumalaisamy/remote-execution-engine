FROM ubuntu:latest

RUN apt-get update && apt-get install -y apt-transport-https

RUN apt-get install git -y

RUN apt-get update

COPY ./entry-point.sh ~/entry-point.sh

CMD [ "/bin/bash", "~/entry-point.sh" ]