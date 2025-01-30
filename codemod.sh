
#!/bin/bash

echo "Executing codemod..."

MODULE=sdk
OLDNAME=hydra-sdk
NEWNAME=sdk
MOD_FOLDER=./modules/$MODULE


# Change package name to add scope
for DIR in ./modules/* ; do
    echo "$DIR"
sed -i "s|$OLDNAME|@hydraprotocol/$NEWNAME|g" $DIR/package.json
done
sed -i "s|$OLDNAME|@hydraprotocol/$NEWNAME|g" ./app/package.json

#  Change import statements
echo "Attempting to change imports"
find . \( -name '*.tsx' -o -name '*.ts' \) -type f -exec sed -i "s|from \"$OLDNAME|from \"@hydraprotocol/$NEWNAME|g" {} + \

#  Change require statements
echo "Attempting to change require"
find . \( -name '*.js' \) -type f -exec sed -i "s|require(\"$OLDNAME|require(\"@hydraprotocol/$NEWNAME|g" {} + \

# Change turbo.json
echo "Attempting to change turbo.json"
sed -i "s|$OLDNAME|@hydraprotocol/$NEWNAME|g" ./turbo.json


echo "Codemod Executed"