#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
只下载缺失瓦片的脚本
专门用于补充层级15的缺失瓦片
"""

import os
import sys
import math
import requests
from pathlib import Path
import time
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed

# 修复 Windows 控制台编码问题
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# ==================== 配置参数 ====================

TILES_DIR = "docs/tiles"
TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"

# 地图范围（激进优化方案）
MIN_LAT = 10.33
MAX_LAT = 10.79
MIN_LON = 106.36
MAX_LON = 106.71

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

# ==================== 工具函数 ====================

def latlon_to_tile(lat, lon, zoom):
    """将经纬度转换为瓦片坐标"""
    n = 2.0 ** zoom
    x = int((lon + 180.0) / 360.0 * n)
    lat_rad = math.radians(lat)
    y = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return (x, y)

def ensure_dir(path):
    """确保目录存在"""
    Path(path).mkdir(parents=True, exist_ok=True)

def download_tile(z, x, y):
    """下载单个瓦片"""
    tile_path = os.path.join(TILES_DIR, str(z), str(x), f"{y}.png")
    ensure_dir(os.path.dirname(tile_path))

    if os.path.exists(tile_path):
        return 'exists'

    url = TILE_URL.format(z=z, x=x, y=y)
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code == 200:
            with open(tile_path, 'wb') as f:
                f.write(response.content)
            return 'success'
        else:
            return f'failed_{response.status_code}'
    except Exception as e:
        return f'error_{str(e)}'

# ==================== 主程序 ====================

def main():
    parser = argparse.ArgumentParser(description='下载缺失的地图瓦片')
    parser.add_argument('--zoom', '-z', type=int, default=15, help='缩放级别（默认15）')
    parser.add_argument('--threads', '-t', type=int, default=10, help='并发线程数')
    args = parser.parse_args()

    print("=" * 60)
    print("缺失瓦片下载器")
    print("=" * 60)

    # 计算瓦片范围
    zoom = args.zoom
    x1, y1 = latlon_to_tile(MAX_LAT, MIN_LON, zoom)
    x2, y2 = latlon_to_tile(MIN_LAT, MAX_LON, zoom)

    x_min = min(x1, x2)
    x_max = max(x1, x2)
    y_min = min(y1, y2)
    y_max = max(y1, y2)

    total_needed = (x_max - x_min + 1) * (y_max - y_min + 1)

    print(f"\n缩放级别: {zoom}")
    print(f"范围: X({x_min}-{x_max}), Y({y_min}-{y_max})")
    print(f"总需求: {total_needed} 个瓦片\n")

    # 检查已下载的瓦片
    print("检查已下载瓦片...")
    tasks = []
    downloaded_count = 0
    missing_count = 0

    for x in range(x_min, x_max + 1):
        for y in range(y_min, y_max + 1):
            tile_path = os.path.join(TILES_DIR, str(zoom), str(x), f'{y}.png')
            if os.path.exists(tile_path):
                downloaded_count += 1
            else:
                missing_count += 1
                tasks.append((zoom, x, y))

    percent = downloaded_count * 100 // total_needed
    print(f"已下载: {downloaded_count}/{total_needed} ({percent}%)")
    print(f"缺失: {missing_count} 个瓦片")

    if missing_count == 0:
        print("\n所有瓦片已完整下载！")
        return

    print(f"\n开始下载 {missing_count} 个缺失瓦片...")
    print(f"并发线程: {args.threads}")
    print("=" * 60)

    total_success = 0
    total_failed = 0

    # 使用线程池并发下载
    with ThreadPoolExecutor(max_workers=args.threads) as executor:
        futures = {executor.submit(download_tile, *task): task for task in tasks}

        for i, future in enumerate(as_completed(futures), 1):
            result = future.result()
            if result == 'success':
                total_success += 1
            else:
                total_failed += 1

            # 显示进度
            if i % 50 == 0 or i == len(tasks):
                print(f"进度: {i}/{len(tasks)} ({i*100//len(tasks)}%) | 成功: {total_success} | 失败: {total_failed}")

    # 显示统计信息
    print("\n" + "=" * 60)
    print("下载完成！")
    print("=" * 60)
    print(f"新下载: {total_success} 个瓦片")
    print(f"下载失败: {total_failed} 个瓦片")

    # 验证最终结果
    final_count = 0
    for x in range(x_min, x_max + 1):
        for y in range(y_min, y_max + 1):
            tile_path = os.path.join(TILES_DIR, str(zoom), str(x), f'{y}.png')
            if os.path.exists(tile_path):
                final_count += 1

    final_percent = final_count * 100 // total_needed
    print(f"\n层级 {zoom} 最终状态: {final_count}/{total_needed} ({final_percent}%)")

    if final_count < total_needed:
        print(f"仍缺失: {total_needed - final_count} 个瓦片")
    else:
        print("该层级完整！")

    print("=" * 60)

    # 播放完成提示音
    if sys.platform == 'win32':
        try:
            import winsound
            print("\n提示音...")
            winsound.Beep(800, 500)
        except:
            print('\a')

if __name__ == "__main__":
    main()
