FROM alpine:latest

RUN apk add git
COPY ./entry-point.sh ~/entry-point.sh

ENTRYPOINT [ "~/entry-point.sh" ]