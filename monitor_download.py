#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
实时监控瓦片下载进度
"""

import os
import sys
import time
import math

# 修复 Windows 控制台编码问题
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# 配置
TILES_DIR = "docs/tiles"
MIN_LAT = 10.33
MAX_LAT = 10.79
MIN_LON = 106.36
MAX_LON = 106.71

def latlon_to_tile(lat, lon, zoom):
    """将经纬度转换为瓦片坐标"""
    n = 2.0 ** zoom
    x = int((lon + 180.0) / 360.0 * n)
    lat_rad = math.radians(lat)
    y = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return (x, y)

def get_tile_count(zoom):
    """获取指定缩放级别的瓦片数量"""
    x1, y1 = latlon_to_tile(MAX_LAT, MIN_LON, zoom)
    x2, y2 = latlon_to_tile(MIN_LAT, MAX_LON, zoom)

    x_min = min(x1, x2)
    x_max = max(x1, x2)
    y_min = min(y1, y2)
    y_max = max(y1, y2)

    total_needed = (x_max - x_min + 1) * (y_max - y_min + 1)

    downloaded = 0
    for x in range(x_min, x_max + 1):
        for y in range(y_min, y_max + 1):
            tile_path = os.path.join(TILES_DIR, str(zoom), str(x), f'{y}.png')
            if os.path.exists(tile_path):
                downloaded += 1

    return downloaded, total_needed, x_min, x_max, y_min, y_max

def main():
    print("=" * 70)
    print(" " * 20 + "瓦片下载实时监控")
    print("=" * 70)
    print("\n监控中... (按 Ctrl+C 停止)\n")

    last_totals = {}
    check_count = 0

    try:
        while True:
            # 清屏（Windows）
            os.system('cls')

            print("=" * 70)
            print(" " * 22 + "瓦片下载实时监控")
            print("=" * 70)

            total_downloaded = 0
            total_needed = 0

            # 显示各层级状态
            for zoom in range(10, 16):
                downloaded, needed, x_min, x_max, y_min, y_max = get_tile_count(zoom)
                total_downloaded += downloaded
                total_needed += needed

                percent = downloaded * 100 // needed if needed > 0 else 0
                remaining = needed - downloaded

                # 进度条
                bar_width = 30
                filled = int(bar_width * downloaded / needed) if needed > 0 else 0
                bar = '=' * filled + '-' * (bar_width - filled)

                status = "OK" if downloaded >= needed else "DL"

                # 计算速度（与上次比较）
                speed = ""
                if zoom in last_totals:
                    diff = downloaded - last_totals[zoom]
                    if diff > 0:
                        speed = f" (+{diff})"

                print(f"[{status}] Z{zoom}: {downloaded:4d}/{needed} |{bar}| {percent:3d}%  剩余:{remaining:4d}{speed}")

                last_totals[zoom] = downloaded

            # 总计
            total_percent = total_downloaded * 100 // total_needed if total_needed > 0 else 0
            total_remaining = total_needed - total_downloaded

            print("=" * 70)
            print(f"总计: {total_downloaded}/{total_needed} ({total_percent}%)  剩余: {total_remaining} 个")
            print("=" * 70)

            # 检查是否全部完成
            if total_remaining == 0:
                print("\n*** 所有瓦片下载完成！ ***\n")
                break

            # 显示时间
            print(f"\n检查次数: {check_count + 1} | 刷新间隔: 2秒")
            print("提示: 在另一个窗口运行 python download_missing_tiles.py\n")

            check_count += 1
            time.sleep(2)

    except KeyboardInterrupt:
        print("\n\n监控已停止")

    print(f"\n最终统计: {total_downloaded}/{total_needed} ({total_percent}%)")

if __name__ == "__main__":
    main()
