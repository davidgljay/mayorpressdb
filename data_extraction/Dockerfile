FROM node
MAINTAINER "David Jay <davidgljay@gmail.com>"
LABEL updated_at = "2015-12-27" version = .01
LABEL description = "A crawler for scanning city mayor's offices websites for press releases."
RUN apt-get update
COPY ./ /home/mayorsdb
WORKDIR /home/mayorsdb
RUN apt-get -y install pdftk
RUN apt-get -y install poppler-utils
RUN apt-get -y install ghostscript
RUN npm install
CMD node index

