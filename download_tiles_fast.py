#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
快速地图瓦片下载脚本 - 无延迟版本
警告：快速下载可能触发服务器限流，请谨慎使用
"""

import os
import sys
import math
import requests
from pathlib import Path
import time
import argparse

# 修复 Windows 控制台编码问题
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# ==================== 配置参数 ====================

# 瓦片保存目录
TILES_DIR = "docs/tiles"

# 地图坐标范围（胡志明市及周边）
# 激进优化范围 - 景点范围 + 1-2km 缓冲
MIN_LAT = 10.33   # 泰山岛（10.34）以南缓冲
MAX_LAT = 10.79   # 粉红教堂（10.7815）以北缓冲
MIN_LON = 106.36  # 美拖市（106.37）以西缓冲
MAX_LON = 106.71  # 歌剧院（106.7018）以东缓冲

# 缩放级别范围
MIN_ZOOM = 10
MAX_ZOOM = 15

# OpenStreetMap 瓦片服务器
TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"

# 请求头设置
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

# 下载延迟（秒）- 快速版本设为0
DOWNLOAD_DELAY = 0.0

# 并发下载线程数
THREAD_COUNT = 5

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

def count_tiles():
    """计算需要下载的瓦片数量"""
    total_tiles = 0
    tiles_per_zoom = {}

    print("\n📊 计算瓦片数量...")
    print(f"地图范围:")
    print(f"  纬度: {MIN_LAT}° ~ {MAX_LAT}°")
    print(f"  经度: {MIN_LON}° ~ {MAX_LON}°")
    print(f"  缩放: {MIN_ZOOM} ~ {MAX_ZOOM}\n")

    for zoom in range(MIN_ZOOM, MAX_ZOOM + 1):
        x1, y1 = latlon_to_tile(MAX_LAT, MIN_LON, zoom)
        x2, y2 = latlon_to_tile(MIN_LAT, MAX_LON, zoom)

        x_min = min(x1, x2)
        x_max = max(x1, x2)
        y_min = min(y1, y2)
        y_max = max(y1, y2)

        count = (x_max - x_min + 1) * (y_max - y_min + 1)
        tiles_per_zoom[zoom] = (x_min, x_max, y_min, y_max, count)
        total_tiles += count

        print(f"  缩放级别 {zoom}: {count} 个瓦片")

    print(f"\n📈 总计: {total_tiles} 个瓦片")
    return tiles_per_zoom

# ==================== 主程序 ====================

def main():
    """主程序"""
    parser = argparse.ArgumentParser(description='快速 OpenStreetMap 瓦片下载器')
    parser.add_argument('--yes', '-y', action='store_true', help='跳过确认直接开始下载')
    parser.add_argument('--threads', '-t', type=int, default=THREAD_COUNT, help='并发线程数')
    args = parser.parse_args()

    print("=" * 60)
    print("🗺️  OpenStreetMap 瓦片下载器（快速版）")
    print("=" * 60)

    tiles_per_zoom = count_tiles()

    if not args.yes:
        confirm = input("⚠️  是否开始下载？(y/n): ")
        if confirm.lower() != 'y':
            print("❌ 已取消下载")
            return

    print("\n" + "=" * 60)
    print("🚀 开始下载瓦片...")
    print(f"⚙️  并发线程数: {args.threads}")
    print("=" * 60 + "\n")

    total_success = 0
    total_exists = 0
    total_failed = 0

    from concurrent.futures import ThreadPoolExecutor, as_completed

    for zoom in range(MIN_ZOOM, MAX_ZOOM + 1):
        print(f"\n📦 正在下载缩放级别 {zoom}...")
        x_min, x_max, y_min, y_max, count = tiles_per_zoom[zoom]

        # 生成所有瓦片任务
        tasks = []
        for x in range(x_min, x_max + 1):
            for y in range(y_min, y_max + 1):
                tasks.append((zoom, x, y))

        # 使用线程池并发下载
        with ThreadPoolExecutor(max_workers=args.threads) as executor:
            futures = {executor.submit(download_tile, *task): task for task in tasks}

            for i, future in enumerate(as_completed(futures), 1):
                result = future.result()
                if result == 'success':
                    total_success += 1
                elif result == 'exists':
                    total_exists += 1
                else:
                    total_failed += 1

                # 显示进度
                if i % 50 == 0 or i == len(tasks):
                    print(f"  进度: {i}/{len(tasks)} ({i*100//len(tasks)}%)")

    # 显示统计信息
    print("\n" + "=" * 60)
    print("📊 下载完成！")
    print("=" * 60)
    print(f"✓ 新下载: {total_success} 个瓦片")
    print(f"⊙ 已存在: {total_exists} 个瓦片")
    print(f"✗ 下载失败: {total_failed} 个瓦片")
    print(f"💾 保存位置: {TILES_DIR}/")
    print("=" * 60)

    # 播放完成提示音
    if sys.platform == 'win32':
        try:
            import winsound
            print("\n🔔 播放完成提示音...")
            winsound.Beep(800, 1000)
        except:
            print('\a')
    else:
        print('\a')

if __name__ == "__main__":
    main()
