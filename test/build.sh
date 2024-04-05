#!/bin/bash
set -e

echo "STARTING TESTS FOR BUILDING HUBS-CLIENT!"

echo "remove build outputs ..."
rm -Rf node_modules certs dist admin/node_modules admin/dist admin/certs

echo "installing hubs dependencies ..."
npm ci
echo "hubs dependencies installed successfully ..."
echo "building hubs ..."
npm run build 1> /dev/null
echo "hubs built successfully ..."

cd admin
echo "installing hubs-admin dependencies ..."
npm ci --legacy-peer-deps
echo "hubs-admin dependencies installed successfully ..."
echo "building hubs-admin ..."
npm run build 1> /dev/null
echo "hubs-admin built successfully ..."

echo "ALL TESTS PASSED! HUBS-CLIENT WAS SUCCESSFULLY BUILT!"
