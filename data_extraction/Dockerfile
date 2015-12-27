FROM node
MAINTAINER "David Jay <davidgljay@gmail.com>"
LABEL updated_at = "2015-12-27" version = .01
LABEL description = "A crawler for scanning city mayor's offices websites for press releases."
RUN apt-get update
#COPY ./ /home/citybuzz
WORKDIR /home/citybuzz
ENV PAPERTRAIL_HOST='logs3.papertrailapp.com'
ENV PAPERTRAIL_PORT='53932'
RUN apt-get install pdftk
RUN apt-get install poppler-utils
RUN apt-get install ghostscript
RUN npm install
CMD node index

