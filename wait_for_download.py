# -*- coding: utf-8 -*-
"""
下载完成监控脚本 - 等待瓦片下载完成并播放提示音
"""

import sys
import time
import os
from pathlib import Path

# 修复 Windows 控制台编码
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def count_tiles():
    """统计已下载的瓦片数量"""
    total = 0
    tiles_dir = Path("docs/tiles")
    if tiles_dir.exists():
        for z in range(10, 16):
            z_dir = tiles_dir / str(z)
            if z_dir.exists():
                for x_dir in z_dir.iterdir():
                    if x_dir.is_dir():
                        for tile_file in x_dir.glob("*.png"):
                            total += 1
    return total

def play_sound():
    """播放完成提示音"""
    if sys.platform == 'win32':
        try:
            import winsound
            print("\n🔔 播放完成提示音...")
            # 频率: 800Hz, 时长: 1000ms
            winsound.Beep(800, 1000)
            time.sleep(0.1)
            winsound.Beep(800, 1000)
        except:
            print('\a' * 3)  # ASCII bell

def main():
    print("=" * 60)
    print("🔔 下载完成监控")
    print("=" * 60)
    print("正在监控 docs/tiles/ 目录...")
    print("下载完成后会播放提示音\n")

    expected_total = 2998  # 预期总瓦片数
    last_count = 0
    no_change_count = 0

    while True:
        current_count = count_tiles()

        # 显示进度
        if current_count != last_count:
            progress = (current_count / expected_total) * 100
            print(f"📊 进度: {current_count}/{expected_total} ({progress:.1f}%)")
            last_count = current_count
            no_change_count = 0
        else:
            no_change_count += 1

        # 检查是否完成
        if current_count >= expected_total:
            print("\n" + "=" * 60)
            print("✅ 下载完成！")
            print("=" * 60)
            play_sound()
            break

        # 如果30秒没有变化，检查进程是否结束
        if no_change_count > 10:  # 50秒无变化
            print(f"\n⚠️  当前进度: {current_count}/{expected_total}")
            print("💡 提示：下载可能已完成或遇到问题")

            # 检查是否有足够的文件
            if current_count > 2000:  # 如果已有超过2000个文件
                print("✅ 瓦片数量足够，可以开始使用")
                play_sound()
                break

        time.sleep(5)  # 每5秒检查一次

if __name__ == "__main__":
    main()
