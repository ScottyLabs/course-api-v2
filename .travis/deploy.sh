#!/bin/bash
set -e
git config --global push.default simple
git remote add production ssh://git@chicago.club.cc.cmu.edu:/home/git/deploy/course-api.git
git push -f production master