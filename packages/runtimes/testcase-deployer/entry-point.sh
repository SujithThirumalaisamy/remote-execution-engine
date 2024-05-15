cd /github

git config --global http.sslVerify false

git clone https://$TOKEN@github.com/$TESTCASES_GIT

cd testcases-ee/testcases

cp /etc/$PROBLEM_ID.json ./$PROBLEM_ID.json

cd ..

git config --global user.email $GLOBAL_EMAIL
git config --global user.name $GLOBAL_NAME

git add .

git commit -m "Auto Commit: Added $PROBLEM_ID.json"

git push origin main

exit 0