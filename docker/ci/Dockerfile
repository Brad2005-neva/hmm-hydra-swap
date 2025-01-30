FROM mcr.microsoft.com/playwright:v1.23.1-focal

ARG RUST_VERSION
ENV RUST_VERSION=$RUST_VERSION

ARG ANCHOR_VERSION
ENV ANCHOR_VERSION=$ANCHOR_VERSION

ARG SOLANA_VERSION
ENV SOLANA_VERSION=$SOLANA_VERSION

# Install deps and rust
RUN apt-get update \
  && apt-get install -y pkg-config build-essential libudev-dev tree make jq python3.8 python3.8-dev libssl-dev xvfb unzip \
  && curl https://sh.rustup.rs -sSf | sh -s -- --default-toolchain 1.60.0 -y 

# Ensure cargo is now available 
ENV PATH="/root/.cargo/bin:$PATH"

# Install solana
RUN rustup install ${RUST_VERSION}\
  && rustup default ${RUST_VERSION} \
  && cargo install wasm-pack \
  && sh -c "$(curl -sSfL https://release.solana.com/v${SOLANA_VERSION}/install)"

# Ensure solana is available 
ENV PATH="/root/.local/share/solana/install/active_release/bin:$PATH"

# Install anchor
RUN cargo install --git https://github.com/project-serum/anchor avm --tag v${ANCHOR_VERSION} --locked --force \
  && avm install ${ANCHOR_VERSION} \
  && avm use ${ANCHOR_VERSION} \
  && anchor --version \
  && solana --version \
  && cargo --version

RUN /root/.local/share/solana/install/releases/${SOLANA_VERSION}/solana-release/bin/sdk/bpf/scripts/install.sh
