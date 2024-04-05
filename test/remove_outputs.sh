#!/bin/bash
set -e

echo "remove build outputs ..."
rm -Rf node_modules certs dist admin/node_modules admin/dist admin/certs
