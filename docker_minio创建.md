docker run -d \
  --name minio_lin \
  -p 9000:9000 \
  -p 9001:9001 \
  -e "MINIO_ROOT_USER=rootrootroot" \
  -e "MINIO_ROOT_PASSWORD=rootrootroot" \
  -v /Users/zengruilin/minio_data:/data \
  minio/minio server /data --console-address ":9001"