FROM python:3.7-slim-buster

LABEL "name"="download required eb cli packages"
LABEL "maintainer"="Kyle Gorak"
LABEL "version"="1.0"

RUN echo "******* Installing EB CLI"
RUN python -m pip install --upgrade pip
RUN pip install awsebcli --upgrade --user
ENV PATH "/root/.local/bin:$PATH"

CMD ["/bin/bash"]