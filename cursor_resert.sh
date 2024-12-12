#!/bin/bash

# 生成新的UUID和随机字符串
new_machine_id=$(uuidgen | tr '[:upper:]' '[:lower:]')
new_dev_device_id=$(uuidgen | tr '[:upper:]' '[:lower:]')
new_mac_machine_id=$(cat /dev/urandom | tr -dc '0-9a-f' | fold -w 32 | head -n 1)

# 设置Cursor配置文件路径
cursor_path="$HOME/Library/Application Support/Cursor"
storage_path="$cursor_path/User/globalStorage/storage.json"

# 写入新的machine id
echo "$new_machine_id" > "$cursor_path/machineid"

# 更新storage.json文件
if [ -f "$storage_path" ]; then
    sed -i "" "s/\"telemetry.devDeviceId\": \".*\"/\"telemetry.devDeviceId\": \"$new_dev_device_id\"/" "$storage_path"
    sed -i "" "s/\"telemetry.macMachineId\": \".*\"/\"telemetry.macMachineId\": \"$new_mac_machine_id\"/" "$storage_path"
    echo "Cursor本地数据重置完成！"
else
    echo "配置文件不存在: $storage_path"
fi