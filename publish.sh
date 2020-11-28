#!/bin/bash
publisher="synker"
ext_id="promo-art"
share_with_orgs="henifazzani"
filePath="./task/task.json"
filePath="./vss-extension.json"
enableGit=false

# npm prune --production
# cp -r node_modules ./task
rm *.vsix

tsc

command -v jq > /dev/null || sudo apt-get jq -yq
echo "Updating $filePath version"
contents="$(jq '.version.Patch = (.version.Patch | .+1)' ${filePath})" && echo "${contents}" > ${filePath}
[ "$enableGit" = true ] && git add $filePath

echo "Updating $filePath version"
version=$(jq -r '.version' ${filePath} | awk 'BEGIN{FS=OFS="."} {$3+=1} 1')
contents="$(jq --arg v $version '.version = $v' ${filePath})" && echo "${contents}" > ${filePath}
[ "$enableGit" = true ] && git add $filePath

#--rev-version
tfx extension create --manifest-globs vss-extension.json && \
tfx extension publish --manifest-globs vss-extension.json --share-with $share_with_orgs --token $AZ_DEVOPS_MARKET_PLACE

if [ "$enableGit" = true ] ; then
    echo "Commit the new version" && \
    git config --global user.email "heni.fazzani@gmail.com" && \
    git config --global user.name "Fazzani" && \
    git commit -m "Bump new version" && \
    git push origin master
fi
# tfx extension show --publisher $publisher --extension-id $ext_id --token $AZ_DEVOPS_MARKET_PLACE


tfx extension create --manifest-globs vss-extension.json && \
tfx extension publish --manifest-globs vss-extension.json --share-with "henifazzani" --token $AZ_DEVOPS_MARKET_PLACE
