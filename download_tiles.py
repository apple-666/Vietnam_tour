#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
地图瓦片下载脚本 - 用于创建离线地图
下载胡志明市区域的 OpenStreetMap 瓦片
"""

import os
import sys
import math
import requests
from pathlib import Path
import time

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
# 覆盖范围：胡志明市中心 + 美拖市（湄公河三角洲）
MIN_LAT = 10.33   # 泰山岛（10.34）以南缓冲
MAX_LAT = 10.79   # 粉红教堂（10.7815）以北缓冲
MIN_LON = 106.36  # 美拖市（106.37）以西缓冲
MAX_LON = 106.71  # 歌剧院（106.7018）以东缓冲

# 缩放级别范围
# 10: 整个胡志明市大区域
# 11-13: 市区级别
# 14-16: 街道详细级别
MIN_ZOOM = 10
MAX_ZOOM = 15    # 限制到15级以减少文件数量

# OpenStreetMap 瓦片服务器
TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"

# 请求头设置（模拟浏览器）
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

# 下载延迟（秒）- 避免请求过快被限制
DOWNLOAD_DELAY = 0.1

# ==================== 工具函数 ====================

def latlon_to_tile(lat, lon, zoom):
    """
    将经纬度转换为瓦片坐标

    参数:
        lat: 纬度
        lon: 经度
        zoom: 缩放级别

    返回:
        (x, y): 瓦片坐标
    """
    n = 2.0 ** zoom
    x = int((lon + 180.0) / 360.0 * n)

    # 修复纬度转换公式
    lat_rad = math.radians(lat)
    y = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)

    return (x, y)

def ensure_dir(path):
    """确保目录存在"""
    Path(path).mkdir(parents=True, exist_ok=True)

def download_tile(z, x, y):
    """
    下载单个瓦片

    参数:
        z: 缩放级别
        x: 瓦片X坐标
        y: 瓦片Y坐标

    返回:
        bool: 下载是否成功
    """
    # 创建瓦片保存路径
    tile_path = os.path.join(TILES_DIR, str(z), str(x), f"{y}.png")
    ensure_dir(os.path.dirname(tile_path))

    # 检查是否已存在
    if os.path.exists(tile_path):
        return True

    # 下载瓦片
    url = TILE_URL.format(z=z, x=x, y=y)
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code == 200:
            with open(tile_path, 'wb') as f:
                f.write(response.content)
            print(f"✓ 下载成功: {z}/{x}/{y}.png")
            return True
        else:
            print(f"✗ 下载失败: {z}/{x}/{y}.png (HTTP {response.status_code})")
            return False
    except Exception as e:
        print(f"✗ 下载错误: {z}/{x}/{y}.png ({str(e)})")
        return False

def count_tiles():
    """
    计算需要下载的瓦片数量

    返回:
        dict: 各缩放级别的瓦片数量
    """
    import math

    total_tiles = 0
    tiles_per_zoom = {}

    print("\n📊 计算瓦片数量...")
    print(f"地图范围:")
    print(f"  纬度: {MIN_LAT}° ~ {MAX_LAT}°")
    print(f"  经度: {MIN_LON}° ~ {MAX_LON}°")
    print(f"  缩放: {MIN_ZOOM} ~ {MAX_ZOOM}\n")

    for zoom in range(MIN_ZOOM, MAX_ZOOM + 1):
        # 计算该缩放级别的瓦片范围
        x1, y1 = latlon_to_tile(MAX_LAT, MIN_LON, zoom)  # 西北角
        x2, y2 = latlon_to_tile(MIN_LAT, MAX_LON, zoom)  # 东南角

        # 确定正确的范围（纬度越大，y坐标越小）
        x_min = min(x1, x2)
        x_max = max(x1, x2)
        y_min = min(y1, y2)
        y_max = max(y1, y2)

        # 计算瓦片数量
        count = (x_max - x_min + 1) * (y_max - y_min + 1)
        tiles_per_zoom[zoom] = count
        total_tiles += count

        print(f"  缩放级别 {zoom}: {count} 个瓦片")

    print(f"\n📈 总计: {total_tiles} 个瓦片")
    print(f"💾 预估大小: {total_tiles * 10 / 1024 / 1024:.1f} MB (假设每个瓦片 10KB)\n")

    return tiles_per_zoom

# ==================== 主程序 ====================

def main():
    """主程序"""
    import math
    import argparse

    # 解析命令行参数
    parser = argparse.ArgumentParser(description='OpenStreetMap 瓦片下载器')
    parser.add_argument('--yes', '-y', action='store_true', help='跳过确认直接开始下载')
    args = parser.parse_args()

    print("=" * 60)
    print("🗺️  OpenStreetMap 瓦片下载器")
    print("=" * 60)

    # 计算瓦片数量
    tiles_per_zoom = count_tiles()

    # 确认是否继续
    if not args.yes:
        confirm = input("⚠️  是否开始下载？(y/n): ")
        if confirm.lower() != 'y':
            print("❌ 已取消下载")
            return

    print("\n" + "=" * 60)
    print("🚀 开始下载瓦片...")
    print("=" * 60 + "\n")

    # 统计信息
    total_downloaded = 0
    total_skipped = 0
    total_failed = 0

    # 按缩放级别下载
    for zoom in range(MIN_ZOOM, MAX_ZOOM + 1):
        print(f"\n📦 正在下载缩放级别 {zoom}...")

        # 计算瓦片范围
        x1, y1 = latlon_to_tile(MAX_LAT, MIN_LON, zoom)  # 西北角
        x2, y2 = latlon_to_tile(MIN_LAT, MAX_LON, zoom)  # 东南角

        # 确定正确的范围（纬度越大，y坐标越小）
        x_min = min(x1, x2)
        x_max = max(x1, x2)
        y_min = min(y1, y2)
        y_max = max(y1, y2)

        # 下载该级别的所有瓦片
        for x in range(x_min, x_max + 1):
            for y in range(y_min, y_max + 1):
                if download_tile(zoom, x, y):
                    if os.path.exists(os.path.join(TILES_DIR, str(zoom), str(x), f"{y}.png")):
                        total_downloaded += 1
                else:
                    total_failed += 1

                # 延迟避免过快请求
                time.sleep(DOWNLOAD_DELAY)

    # 显示统计信息
    print("\n" + "=" * 60)
    print("📊 下载完成！")
    print("=" * 60)
    print(f"✓ 成功下载: {total_downloaded} 个瓦片")
    print(f"✗ 下载失败: {total_failed} 个瓦片")
    print(f"💾 保存位置: {TILES_DIR}/")
    print("=" * 60)

    # 播放完成提示音（Windows）
    if sys.platform == 'win32':
        try:
            import winsound
            print("\n🔔 播放完成提示音...")
            # 频率: 800Hz, 时长: 1000ms
            winsound.Beep(800, 1000)
        except:
            print("\n⚠️ 无法播放系统提示音")

    # 或者使用系统默认提示音
    try:
        print('\a')  # ASCII bell 字符
    except:
        pass

if __name__ == "__main__":
    main()
