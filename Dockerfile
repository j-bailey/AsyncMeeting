FROM centos:centos7

  MAINTAINER Productive Gains <support@productivegains.com>  
LABEL Version=${ASYNC_VERSION} \
      Tech="NodeJS" \
      Vendor="Productive Gains"
  
ENV NODE_ENV=production  

RUN groupadd -r async && useradd -r -g async async  
RUN mkdir /home/async; chown -R async:async /home/async

# Enable Extra Packages for Enterprise Linux (EPEL) for CentOS 
RUN yum install -y epel-release

  # Install Node.js and npm 
RUN yum install -y gcc-c++
  RUN yum install -y git make gpg curl krb5-devel
# gpg keys listed at https://github.com/nodejs/node
RUN set -ex \
  && for key in \
    9554F04D7259F04124DE6B476D5A82AC7E37093B \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    0034A06D9D9B0064CE8ADF6BF1747F4AD2306D93 \
    FD3A5288F042B6850C66B31F09FE44734EB7990E \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
  ; do \
    gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key"; \
  done

ENV NODE_VERSION 0.12.9

RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz" \
	&& curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
	&& gpg --verify SHASUMS256.txt.asc \
	&& grep " node-v$NODE_VERSION-linux-x64.tar.gz\$" SHASUMS256.txt.asc | sha256sum -c - \
	&& tar -xzf "node-v$NODE_VERSION-linux-x64.tar.gz" -C /usr/local --strip-components=1 \
	&& rm "node-v$NODE_VERSION-linux-x64.tar.gz" SHASUMS256.txt.asc

COPY build/package.json /async/
RUN chown -R async:async /async
 USER async
  COPY build /async/
RUN cd /async/; npm install

# TODO hack to get the server running
RUN mkdir /async/logs
 

  EXPOSE 3000


WORKDIR /async/
  CMD ["node", "/async/server.js"]

