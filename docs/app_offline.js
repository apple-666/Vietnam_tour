// 初始化地图 - 支持本地离线瓦片（简化版）
function initMap() {
    console.log('🗺️ 初始化地图（离线瓦片支持）...');

    // 创建地图，中心定位在胡志明市
    map = L.map('map', {
        preferCanvas: true,  // 使用 Canvas 渲染，性能更好
        zoomControl: true,
        // 移动端优化选项
        fadeAnimation: false,  // 关闭动画以加快加载
        zoomAnimation: false,
        markerZoomAnimation: false,
        updateWhenIdle: false,  // 持续更新而非空闲时更新
        // 关键：增加超时时间
        timeout: 30000  // 30秒超时（默认是10秒）
    }).setView([10.7740, 106.6900], 13);

    // ==================== 离线瓦片配置 ====================
    // 策略：优先使用本地瓦片，加载失败时自动使用在线备用服务器

    let onlineFallbackCount = 0;

    // 添加本地瓦片层
    const tileLayer = L.tileLayer('tiles/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 15,  // 本地瓦片最大缩放级别
        minZoom: 10,  // 最小缩放级别
        timeout: 5000,  // 5秒超时，快速失败
        crossOrigin: true,
        detectRetina: false,
        keepBuffer: 5
    });

    // 监听瓦片加载错误 - 自动回退到在线服务器
    tileLayer.on('tileerror', function(error) {
        const tile = error.tile;
        const url = tile.src;

        // 提取瓦片坐标
        const coords = url.match(/tiles\/(\d+)\/(\d+)\/(\d+)\.png/);
        if (coords) {
            onlineFallbackCount++;
            const z = coords[1];
            const x = coords[2];
            const y = coords[3];

            // 使用在线备用服务器
            const onlineUrl = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
            tile.src = onlineUrl;

            if (onlineFallbackCount <= 5) {
                console.log(`🌐 本地瓦片 ${z}/${x}/${y} 不存在，使用在线备用`);
            }
        }
    });

    tileLayer.on('load', function() {
        console.log('✅ 地图瓦片加载完成');
        if (onlineFallbackCount > 0) {
            console.log(`💡 ${onlineFallbackCount} 个瓦片使用在线备用服务器`);
            if (onlineFallbackCount > 50) {
                console.log('⚠️ 大量瓦片使用在线服务器，建议运行下载脚本');
            }
        } else {
            console.log('🎉 完全离线模式！所有瓦片均来自本地');
        }
    });

    tileLayer.addTo(map);

    // 显示加载提示
    showMapLoadingHint();

    // 添加标记
    addHotelMarkers();
    addAttractionMarkers();
    addAirportMarkers();

    // 渲染所有数据
    renderItinerary();
    renderTips();
    renderFlightInfo();
    renderHotelList();
    renderDetailSchedule();
    renderEmergencyContacts();
    renderExchangeRate();  // 渲染汇率信息
    renderDataVersion();
    updatePageTitle();
    populateLocationSelect();
}

// 显示地图加载提示
function showMapLoadingHint() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // 创建加载提示元素
    const loadingHint = document.createElement('div');
    loadingHint.id = 'mapLoadingHint';
    loadingHint.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 500;
        z-index: 1000;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    loadingHint.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 10px;">🗺️</div>
        <div>地图加载中...</div>
        <div style="font-size: 12px; margin-top: 8px; opacity: 0.7;">
            首次加载可能较慢，请稍候
        </div>
    `;

    mapContainer.appendChild(loadingHint);

    // 3秒后自动隐藏
    setTimeout(() => {
        if (loadingHint.parentNode) {
            loadingHint.parentNode.removeChild(loadingHint);
        }
    }, 3000);
}

function showError() {
    console.error('地图加载失败');
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">地图加载失败，请检查网络连接</div>';
    }
}
