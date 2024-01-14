FROM mcr.microsoft.com/devcontainers/base:bullseye

# Install for using puppeteer
RUN sudo apt-get update
RUN sudo apt-get install -y build-essential fzf jq
# RUN sudo apt-get install -y wget gnupg ca-certificates procps libxss1 libasound2 libatk-bridge2.0-0 libgtk-3-0 libgbm1
# RUN sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

# install chrome
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -P /tmp
RUN sudo apt-get install -y /tmp/google-chrome-stable_current_amd64.deb

# RUN sudo apt-get install -y fonts-liberation libnspr4 libu2f-udev libvulkan1 xdg-utils
