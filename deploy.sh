#!/bin/bash

if [ -f upload ]; then
   rm upload
fi

npm run build

tar -czvf node_modules.tar.gz ./node_modules
echo "put node_modules.tar.gz" >> upload

ssh uberspace <<EOF
     supervisorctl stop mail-to-signal-cli-rest-api-adapter
     cd apps/mail-to-signal-cli-rest-api-adapter
EOF

find ./dist/src -type f -name "*.js" | while read -r file; do
     echo "put $file" >> upload
done

sftp -b upload uberspace:/home/fuchsrot/apps/mail-to-signal-cli-rest-api-adapter

ssh uberspace <<EOF
     cd apps/mail-to-signal-cli-rest-api-adapter
     tar -xzvf node_modules.tar.gz
     rm node_modules.tar.gz
     supervisorctl start mail-to-signal-cli-rest-api-adapter
EOF

rm upload
rm node_modules.tar.gz