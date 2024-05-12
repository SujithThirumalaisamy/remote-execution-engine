cd /github

git clone $TESTCASES_GIT

cd /testcases-ee/testcases

echo $TESTCASES > $PROBLEM_ID.json

cd ..

git add .

git commit -m "Auto Commit: Added $PROBLEM_ID.json"

git push origin main

exit 0