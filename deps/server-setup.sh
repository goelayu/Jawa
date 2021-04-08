#installs dependencies for the project

# setup profile with nvm and node prefixes

# pip install brotli

# curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

# source ~/.bashrc
# source ~/.profile

# nvm install 11.11.0

# npm install commander@2.11.0
# npm install falafel@2.1.0
# npm install properties@1.2.1
# npm install puppeteer@1.20.0

# sudo apt-get install -y libre2-dev

mkdir -p /home/goelayu/research
cd /home/goelayu/research
git clone https://github.com/goelayu/mahimahi
cd mahimahi

sudo apt-get install -y apache2-bin apache2-dev protobuf-compiler libprotobuf-dev libxcb-present-dev libpango1.0-dev libcairo2-dev google-chrome-stable

./autogen.sh
CPPFLAGS=-I//vault-home/goelayu/tools/openssl-1.1.1g/include/ LDFLAGS=-L/vault-home/goelayu/tools/openssl-1.1.1g/ ./configure
make -j
sudo make install

#just for mahimahi intsallation change the PATH prefix: /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin