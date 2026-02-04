#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG="${IMAGE_TAG:-staging}"
# Change this line below to the correct image name for the frontend with the correct tag and the correct repository name from the dockerhub   
FRONT_IMAGE="${FRONT_IMAGE:-mydietchef/mdc-mars26-front}"
# Change this line below to the correct image name for the backend with the correct tag and the correct repository name from the dockerhub
BACK_IMAGE="${BACK_IMAGE:-mydietchef/mdc-mars26-back}"
FRONT_DOCKERFILE="${FRONT_DOCKERFILE:-./frontend/Dockerfile.prod}"
BACK_DOCKERFILE="${BACK_DOCKERFILE:-./backend/Dockerfile.prod}"
FRONT_CONTEXT="${FRONT_CONTEXT:-./frontend}"
BACK_CONTEXT="${BACK_CONTEXT:-./backend}"

build() {
    local image="$1" dockerfile="$2" context="$3"
    docker buildx build \
        --platform linux/amd64,linux/arm64 \
        -t "${image}:${IMAGE_TAG}" \
        --file "${dockerfile}" \
        "${context}" \
        --push
}

# Start both builds in parallel
build "${FRONT_IMAGE}" "${FRONT_DOCKERFILE}" "${FRONT_CONTEXT}" & pid_front=$!
build "${BACK_IMAGE}" "${BACK_DOCKERFILE}" "${BACK_CONTEXT}" & pid_back=$!

# Wait and propagate failure if any
wait $pid_front; st1=$?
wait $pid_back; st2=$?
if [ $st1 -ne 0 ] || [ $st2 -ne 0 ]; then
    echo "One or more builds failed" >&2
    exit 1
fi