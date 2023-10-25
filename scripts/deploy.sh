#!/bin/bash
mv frontend frontend_old
mkdir frontend
mv dist.zip frontend
cd frontend
unzip dist.zip
rm dist.zip
cd ..
rm -rf frontend_old