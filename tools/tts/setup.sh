#!/bin/bash
# One-time setup for the free Kokoro TTS voice model (Apache-2.0, commercial use OK).
# Creates tools/tts/venv and downloads the model files (~350 MB) into tools/tts/models (not committed).
set -e
cd "$(dirname "$0")"
python3 -m venv venv
./venv/bin/pip install -q kokoro-onnx soundfile
mkdir -p models
BASE=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
[ -f models/kokoro-v1.0.onnx ] || curl -L -o models/kokoro-v1.0.onnx $BASE/kokoro-v1.0.onnx
[ -f models/voices-v1.0.bin ] || curl -L -o models/voices-v1.0.bin $BASE/voices-v1.0.bin
echo "TTS ready."
