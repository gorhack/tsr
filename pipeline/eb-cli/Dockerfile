FROM ubuntu:18.04

LABEL "name"="download required eb cli packages"
LABEL "maintainer"="Kyle Gorak"
LABEL "version"="1.0"

RUN echo "******* Installing EB CLI"
    # https://github.com/aws/aws-elastic-beanstalk-cli-setup
RUN apt-get -y update \
        && apt-get -y install \
        git build-essential zlib1g-dev libssl-dev libncurses-dev \
        libffi-dev libsqlite3-dev libreadline-dev libbz2-dev curl
RUN git clone https://github.com/aws/aws-elastic-beanstalk-cli-setup.git
RUN ./aws-elastic-beanstalk-cli-setup/scripts/bundled_installer
RUN echo 'export PATH="/github/home/.ebcli-virtual-env/executables:$PATH"' >> /home/.bash_profile
RUN echo 'export PATH=/github/home/.pyenv/versions/3.7.2/bin:$PATH' >> /home/.bash_profile && . /home/.bash_profile

CMD ["/bin/bash"]