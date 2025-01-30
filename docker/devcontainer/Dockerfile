# we need to start with the playwright image because 
# playwright is mega picky about how it is installed 
FROM mcr.microsoft.com/playwright:v1.23.1-focal

# Install needed packages and setup non-root user. Use a separate RUN statement to add your own dependencies.
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN userdel pwuser
RUN useradd --uid ${USER_UID} -m ${USERNAME}
RUN chown -R $USER_UID:$USER_GID /home/$USERNAME 
RUN apt-get update 
RUN apt-get install -y sudo 
RUN echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME 
RUN chmod 0440 /etc/sudoers.d/$USERNAM

USER $USERNAME

ARG RUST_VERSION
ENV RUST_VERSION=$RUST_VERSION

ARG ANCHOR_VERSION
ENV ANCHOR_VERSION=$ANCHOR_VERSION

ARG SOLANA_VERSION
ENV SOLANA_VERSION=$SOLANA_VERSION

# Install deps and rust
RUN sudo apt-get update \
  && sudo apt-get install -y \
  pkg-config \
  build-essential \
  libudev-dev \
  tree \
  make \
  jq \
  python3.8 \
  python3.8-dev \
  openssl \
  git-core \
  bash-completion \
  && curl https://sh.rustup.rs -sSf | sh -s -- --default-toolchain ${RUST_VERSION} -y 


# Ensure cargo is now available 
ENV PATH="/home/$USERNAME/.cargo/bin:$PATH"

# Install solana
RUN rustup install ${RUST_VERSION} \
  && rustup default ${RUST_VERSION} \
  && cargo install wasm-pack \
  && sh -c "$(curl -sSfL https://release.solana.com/v${SOLANA_VERSION}/install)"

# Ensure solana is available 
ENV PATH="/home/$USERNAME/.local/share/solana/install/active_release/bin:$PATH"

RUN sudo apt-get update \
  && sudo apt-get install -y libssl-dev

# Install anchor
RUN cargo install --git https://github.com/project-serum/anchor avm --tag v${ANCHOR_VERSION} --locked --force \
  && avm install ${ANCHOR_VERSION} \
  && avm use ${ANCHOR_VERSION} \
  && anchor --version \
  && solana --version \
  && cargo --version

RUN sudo apt-get update \
  && sudo apt-get install -y unzip

RUN mkdir -p /tmp/pwproj && cd /tmp/pwproj && yarn init -y && yarn add @playwright/test@1.23.1 && npx playwright install

RUN sudo apt-get update \
  && sudo apt-get install -y xsel

RUN sudo groupadd -g 131 docker
RUN sudo usermod -a -G docker $USERNAME

RUN sudo apt-get update \
  && sudo apt-get install -y vim \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
RUN sudo mkdir -p /etc/apt/keyrings && curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
RUN echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
RUN sudo apt-get update \
  && sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

ENV HOME="/home/$USERNAME"

RUN touch $HOME/.bash_aliases

RUN git clone https://github.com/magicmonty/bash-git-prompt.git ~/.bash-git-prompt --depth=1
RUN echo "if [ -f \"$HOME/.bash-git-prompt/gitprompt.sh\" ]; then" >> $HOME/.bashrc
RUN echo "  GIT_PROMPT_ONLY_IN_REPO=1" >> $HOME/.bashrc
RUN echo "  source $HOME/.bash-git-prompt/gitprompt.sh" >> $HOME/.bashrc
RUN echo "fi" >> $HOME/.bashrc
