#!/bin/bash
set -e

echo "Compiling confession_submit circuit..."
cd circuits/confession_submit
nargo compile
nargo execute witness
# Note: Exporting VK requires Barretenberg
# nargo export-verifier-key
cd ../..

echo "Compiling authorship_reveal circuit..."
cd circuits/authorship_reveal
nargo compile
nargo execute witness
cd ../..

echo "Circuits compiled successfully."
