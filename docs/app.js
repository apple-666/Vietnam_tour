// 全局变量
let map;
let hotelMarkers = [];
let attractionMarkers = [];
let airportMarkers = [];
let routeLayers = [];
let currentDayLayer = null;

// 初始化地图 - 深度修复 Android 端加载问题
function initMap() {
    console.log('🗺️ 初始化地图（Android 优化版）...');

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

    // 多重瓦片服务器策略 - 从快到慢依次尝试
    const tileProviders = [
        {
            name: 'OpenStreetMap (CDN)',
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        },
        {
            name: 'CartoDB Positron',
            url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        },
        {
            name: 'OpenStreetMap France',
            url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }
    ];

    let currentProviderIndex = 0;
    let tileLayer;

    // 尝试加载瓦片
    function loadTileProvider() {
        if (currentProviderIndex >= tileProviders.length) {
            console.error('❌ 所有瓦片服务器都失败了');
            showError();
            return;
        }

        const provider = tileProviders[currentProviderIndex];
        console.log(`📡 尝试瓦片服务器 ${currentProviderIndex + 1}/${tileProviders.length}: ${provider.name}`);

        // 移除旧的瓦片层
        if (tileLayer) {
            map.removeLayer(tileLayer);
        }

        // 创建新的瓦片层
        tileLayer = L.tileLayer(provider.url, {
            attribution: provider.attrribution,
            maxZoom: 19,
            minZoom: 2,
            // 关键配置
            subdomains: 'abc',
            timeout: 30000,  // 30秒超时
            retry: 3,  // 重试3次
            crossOrigin: true,
            // Android 优化
            detectRetina: false,  // 关闭 Retina 支持，减少瓦片数量
            keepBuffer: 5  // 预加载5层瓦片
        });

        // 监听瓦片加载事件
        let tilesLoaded = 0;
        let tilesFailed = 0;
        const totalTilesExpected = 20;  // 预期加载20个瓦片

        tileLayer.on('load', function() {
            console.log(`✅ ${provider.name} 加载成功！`);
            tilesLoaded = totalTilesExpected;  // 标记为成功
        });

        tileLayer.on('tileerror', function(error) {
            tilesFailed++;
            console.warn(`⚠️ ${provider.name} 瓦片加载失败 (${tilesFailed})`);

            // 如果失败超过5个，尝试下一个服务器
            if (tilesFailed > 5 && currentProviderIndex < tileProviders.length - 1) {
                currentProviderIndex++;
                console.log(`🔄 切换到下一个瓦片服务器...`);
                setTimeout(loadTileProvider, 1000);  // 等待1秒后重试
            }
        });

        tileLayer.addTo(map);

        // 10秒后检查是否有任何瓦片成功加载
        setTimeout(function() {
            const tiles = document.querySelectorAll('.leaflet-tile-container img');
            const loadedTiles = Array.from(tiles).filter(img => img.complete && img.naturalHeight !== 0);

            if (loadedTiles.length === 0 && currentProviderIndex < tileProviders.length - 1) {
                console.warn(`⏰ ${provider.name} 10秒内无瓦片加载，尝试下一个...`);
                currentProviderIndex++;
                loadTileProvider();
            } else if (loadedTiles.length > 0) {
                console.log(`✅ 成功加载 ${loadedTiles.length} 个瓦片`);
            }
        }, 10000);
    }

    // 开始加载瓦片
    loadTileProvider();

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
        border-radius: 10px;
        text-align: center;
        z-index: 1000;
        font-size: 14px;
    `;
    loadingHint.innerHTML = `
        <div style="margin-bottom: 10px;">🗺️</div>
        <div>地图正在加载...</div>
        <div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">
            Android 设备可能需要更长时间
        </div>
    `;
    mapContainer.appendChild(loadingHint);

    // 15秒后自动移除
    setTimeout(function() {
        if (loadingHint.parentNode) {
            loadingHint.parentNode.removeChild(loadingHint);
        }
    }, 15000);
}

// 显示错误信息
function showError() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 0, 0, 0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        z-index: 1000;
    `;
    errorDiv.innerHTML = `
        <div style="margin-bottom: 10px;">⚠️</div>
        <div>地图加载失败</div>
        <div style="font-size: 12px; margin-top: 8px;">
            请检查网络连接
        </div>
    `;
    mapContainer.appendChild(errorDiv);
}

// 添加酒店标记
function addHotelMarkers() {
    const hotelIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background: #4CAF50; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; border: 4px solid white; box-shadow: 0 3px 12px rgba(0,0,0,0.4);">🏨</div>',
        iconSize: [45, 45],
        iconAnchor: [22.5, 22.5],
        popupAnchor: [0, -22.5]
    });

    tourData.hotels.forEach(hotel => {
        const marker = L.marker([hotel.lat, hotel.lng], { icon: hotelIcon })
            .addTo(map)
            .bindPopup(`
                <div class="popup-title">🏨 ${hotel.name}</div>
                <div class="popup-address">📍 ${hotel.address}</div>
                <div class="popup-address">📞 ${hotel.phone}</div>
                <div class="popup-desc">⭐ 评分: ${hotel.rating}/5</div>
                <span class="popup-tag">住宿</span>
            `);

        hotelMarkers.push(marker);
    });
}

// 添加景点标记
function addAttractionMarkers() {
    tourData.attractions.forEach((attraction, index) => {
        const dayColors = {
            1: '#FF6B6B',
            2: '#4ECDC4',
            3: '#95E1D3',
            4: '#DDA0DD'
        };

        const attrIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background: ${dayColors[attraction.day]}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${attraction.order}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
        });

        const marker = L.marker([attraction.lat, attraction.lng], { icon: attrIcon })
            .addTo(map)
            .bindPopup(`
                <div class="popup-title">🎯 ${attraction.name}</div>
                <div class="popup-address">📍 ${attraction.address}</div>
                <div class="popup-desc">${attraction.description}</div>
                <div class="popup-address">⏰ 开放时间: ${attraction.openingHours}</div>
                <div class="popup-address">✨ 亮点: ${attraction.highlights.join('、')}</div>
                ${attraction.note ? `<div class="popup-desc" style="color: #f57c00;">💡 ${attraction.note}</div>` : ''}
                <span class="popup-tag">第${attraction.day}天</span>
            `);

        attractionMarkers.push({
            marker,
            attraction
        });
    });
}

// 添加机场标记
function addAirportMarkers() {
    const airportIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background: #9C27B0; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">✈️</div>',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
    });

    tourData.airports.forEach(airport => {
        const marker = L.marker([airport.lat, airport.lng], { icon: airportIcon })
            .addTo(map)
            .bindPopup(`
                <div class="popup-title">✈️ ${airport.name}</div>
                <div class="popup-address">📍 ${airport.address}</div>
                <div class="popup-address">🏷️ 机场代码: ${airport.code}</div>
                <div class="popup-desc">${airport.note}</div>
                <span class="popup-tag">机场</span>
            `);

        airportMarkers.push(marker);
    });
}

// 渲染行程列表
function renderItinerary() {
    const itineraryList = document.getElementById('itineraryList');

    tourData.itinerary.forEach(day => {
        const dayItem = document.createElement('div');
        dayItem.className = 'day-item';
        dayItem.id = `day-${day.day}`;
        dayItem.onclick = () => showDayRoute(day.day);

        const attractions = day.attractionIds.map(id => {
            const attr = tourData.attractions.find(a => a.id === id);
            return attr ? attr.name : '';
        }).filter(name => name).join('、');

        dayItem.innerHTML = `
            <div class="day-header">
                <span>${day.title}</span>
                <span style="font-size: 12px; color: #999;">${day.date}</span>
            </div>
            ${day.meals ? `
                <div class="day-meals">
                    🍽️ ${day.meals.breakfast || '自理'}早餐 | ${day.meals.lunch || '自理'}午餐 | ${day.meals.dinner || '自理'}晚餐
                </div>
            ` : ''}
            <div class="day-places">
                ${attractions || '（行程结束）'}
            </div>
        `;

        itineraryList.appendChild(dayItem);
    });
}

// 渲染提示信息
function renderTips() {
    const tipsList = document.getElementById('tipsList');

    tourData.tips.forEach(tip => {
        const tipItem = document.createElement('div');
        tipItem.className = `tip-item ${tip.category}`;
        tipItem.innerHTML = `
            <span class="tip-icon">${tip.icon}</span>
            <span>${tip.text}</span>
        `;
        tipsList.appendChild(tipItem);
    });
}

// 显示指定天的路线
function showDayRoute(day) {
    // 清除之前的路线高亮
    document.querySelectorAll('.day-item').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById(`day-${day}`).classList.add('active');

    // 获取当天的景点
    const dayItinerary = tourData.itinerary.find(d => d.day === day);

    if (!dayItinerary || dayItinerary.attractionIds.length === 0) {
        return;
    }

    const dayAttractions = dayItinerary.attractionIds
        .map(id => tourData.attractions.find(a => a.id === id))
        .filter(a => a);

    if (dayAttractions.length === 0) {
        return;
    }

    // 计算边界
    const bounds = L.latLngBounds(dayAttractions.map(a => [a.lat, a.lng]));

    // 如果需要包含酒店
    const hotel = tourData.hotels[0];
    bounds.extend([hotel.lat, hotel.lng]);

    // 缩放地图以显示所有标记
    map.fitBounds(bounds, { padding: [50, 50] });
}

// 显示全部标记
function fitAllMarkers() {
    const allPoints = [
        ...tourData.hotels.map(h => [h.lat, h.lng]),
        ...tourData.attractions.map(a => [a.lat, a.lng])
    ];

    const bounds = L.latLngBounds(allPoints);
    map.fitBounds(bounds, { padding: [50, 50] });

    // 清除所有高亮
    document.querySelectorAll('.day-item').forEach(item => {
        item.classList.remove('active');
    });
}

// 切换路线显示
let showRoutes = false;
function toggleDayRoute() {
    showRoutes = !showRoutes;

    // 清除现有路线
    routeLayers.forEach(layer => map.removeLayer(layer));
    routeLayers = [];

    if (showRoutes) {
        const dayColors = {
            1: '#FF6B6B',
            2: '#4ECDC4',
            3: '#95E1D3'
        };

        tourData.itinerary.forEach(dayItinerary => {
            if (dayItinerary.attractionIds.length === 0) return;

            const dayAttractions = dayItinerary.attractionIds
                .map(id => tourData.attractions.find(a => a.id === id))
                .filter(a => a);

            if (dayAttractions.length < 2) return;

            // 创建路线点数组
            const routePoints = dayAttractions.map(a => [a.lat, a.lng]);

            // 添加路线
            const polyline = L.polyline(routePoints, {
                color: dayColors[dayItinerary.day] || '#666',
                weight: 4,
                opacity: 0.7,
                dashArray: '10, 10'
            }).addTo(map);

            routeLayers.push(polyline);
        });
    }
}

// ========== 新增的渲染函数 ==========

// 渲染航班信息
function renderFlightInfo() {
    const flightInfo = document.getElementById('flightInfo');
    if (!flightInfo) return;

    // 使用新的 flights 数据结构
    const departure = tourData.flights?.departure;
    const returnFlight = tourData.flights?.return;

    let html = '<div class="flight-info">';

    if (departure) {
        html += `
            <div class="flight-item">
                <div class="flight-direction">去程 ✈️</div>
                <div class="flight-detail">
                    <strong>${departure.flightNo}</strong> ${departure.airline}<br>
                    ${departure.date}
                </div>
                <div class="flight-time">
                    ${departure.departTime} ${departure.departLocation} →<br>
                    ${departure.arriveTime} ${departure.arriveLocation}
                </div>
            </div>
        `;
    }

    if (returnFlight) {
        html += `
            <div class="flight-item">
                <div class="flight-direction">返程 ✈️</div>
                <div class="flight-detail">
                    <strong>${returnFlight.flightNo}</strong> ${returnFlight.airline}<br>
                    ${returnFlight.date}
                </div>
                <div class="flight-time">
                    ${returnFlight.departTime} ${returnFlight.departLocation} →<br>
                    ${returnFlight.arriveTime} ${returnFlight.arriveLocation}
                </div>
            </div>
        `;
    }

    html += '</div>';
    flightInfo.innerHTML = html;
}

// 渲染酒店列表
function renderHotelList() {
    const hotelList = document.getElementById('hotelList');
    if (!hotelList) return;

    let html = '<div class="hotel-list">';

    tourData.hotels.forEach((hotel, index) => {
        html += `
            <div class="hotel-item">
                <div class="hotel-name">${hotel.name}</div>
                <div class="hotel-address">📍 ${hotel.address}</div>
                <div class="hotel-phone">📞 ${hotel.phone}</div>
                <div class="hotel-rating">⭐ ${hotel.rating}/5</div>
            </div>
        `;
    });

    html += '</div>';
    hotelList.innerHTML = html;
}

// 渲染详细时间表
function renderDetailSchedule() {
    const detailSchedule = document.getElementById('detailSchedule');
    if (!detailSchedule) return;

    let html = '<div class="detail-schedule">';

    tourData.itinerary.forEach(day => {
        html += `
            <div class="day-schedule">
                <div class="day-schedule-header" onclick="toggleDaySchedule(${day.day})">
                    <span>${day.title}</span>
                    <span class="toggle-icon">▼</span>
                </div>
                <div class="day-schedule-content" id="schedule-day-${day.day}">
        `;

        day.activities.forEach(activity => {
            html += `
                <div class="activity-item">
                    <span class="activity-time">${activity.time}</span>
                    <span class="activity-desc">${activity.activity}</span>
                    <span class="activity-location">@${activity.location}</span>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    html += '</div>';
    detailSchedule.innerHTML = html;
}

// 切换某天的详细时间表显示/隐藏
function toggleDaySchedule(day) {
    const content = document.getElementById(`schedule-day-${day}`);
    if (content) {
        content.classList.toggle('expanded');
    }
}

// 渲染紧急联系方式
function renderEmergencyContacts() {
    const emergencyContacts = document.getElementById('emergencyContacts');
    if (!emergencyContacts) return;

    let html = '<div class="emergency-contacts">';

    tourData.emergencyContacts.forEach(contact => {
        html += `
            <div class="contact-item">
                <div class="contact-name">${contact.name}</div>
                <div class="contact-phone">📞 ${contact.phone}</div>
            </div>
        `;
    });

    html += '</div>';
    emergencyContacts.innerHTML = html;
}

// 渲染数据版本信息
function renderDataVersion() {
    const dataVersion = document.getElementById('dataVersion');
    if (!dataVersion) return;

    // 使用新的 info 字段
    const info = tourData.info || {};

    dataVersion.innerHTML = `
        <div class="version-info">
            📊 数据版本: v${DATA_VERSION} | 更新时间: ${DATA_LAST_UPDATED}
        </div>
        <div class="refresh-hint">
            💡 数据更新后请刷新页面 (F5 或 Ctrl+R)
        </div>
    `;
}

// 更新页面标题
function updatePageTitle() {
    const info = tourData.info || {};
    const tripInfo = document.querySelector('.trip-info');
    if (tripInfo && info.tourNo && info.dates) {
        tripInfo.innerHTML = `
            <span class="badge">${info.tourNo || 'VN4D-250123'}</span>
            <span class="date">${info.dates || '2026年1月23日-26日'}</span>
        `;
    }
}

// ========== 快速定位功能 ==========

// 填充地点下拉框
function populateLocationSelect() {
    const select = document.getElementById('locationSelect');
    if (!select) return;

    // 清空现有选项（保留默认选项）
    select.innerHTML = '<option value="">-- 选择要查看的地点 --</option>';

    // 添加机场分组
    let airportGroup = '<optgroup label="✈️ 机场">';
    tourData.airports.forEach(airport => {
        airportGroup += `<option value="airport-${airport.id}">🛫 ${airport.name} (${airport.code})</option>`;
    });
    airportGroup += '</optgroup>';
    select.innerHTML += airportGroup;

    // 添加酒店分组
    let hotelGroup = '<optgroup label="🏨 酒店">';
    tourData.hotels.forEach(hotel => {
        hotelGroup += `<option value="hotel-${hotel.id}">🏨 ${hotel.name}</option>`;
    });
    hotelGroup += '</optgroup>';
    select.innerHTML += hotelGroup;

    // 添加重要景点分组（有duration字段的）
    let attractionGroup = '<optgroup label="🎯 主要景点">';
    tourData.attractions.filter(attr => attr.duration).forEach(attr => {
        attractionGroup += `<option value="attraction-${attr.id}">📍 ${attr.name} (${attr.duration})</option>`;
    });
    attractionGroup += '</optgroup>';
    select.innerHTML += attractionGroup;

    // 添加所有景点分组
    let allAttractionGroup = '<optgroup label="📍 所有景点">';
    tourData.attractions.forEach(attr => {
        const dayLabel = `D${attr.day}`;
        allAttractionGroup += `<option value="attraction-${attr.id}">${dayLabel} - ${attr.name}</option>`;
    });
    allAttractionGroup += '</optgroup>';
    select.innerHTML += allAttractionGroup;
}

// 快速定位到选中的地点
function focusLocation(value) {
    console.log('focusLocation called with:', value);

    if (!value) return;

    // 分割并正确组合 ID（可能包含多个 '-'）
    const parts = value.split('-');
    const type = parts[0];
    const id = parts.slice(1).join('-');

    console.log('Type:', type, 'ID:', id);

    let targetLocation = null;
    let zoom = 15;

    // 根据类型查找地点
    if (type === 'airport') {
        targetLocation = tourData.airports.find(a => a.id === id);
        zoom = 13;
    } else if (type === 'hotel') {
        targetLocation = tourData.hotels.find(h => h.id === id);
        zoom = 16;
    } else if (type === 'attraction') {
        targetLocation = tourData.attractions.find(a => a.id === id);
        zoom = 16;
    }

    console.log('Target location:', targetLocation);

    if (targetLocation) {
        // 移动地图到目标位置
        map.flyTo([targetLocation.lat, targetLocation.lng], zoom, {
            duration: 1.5
        });

        // 延迟打开popup，等待地图移动完成
        setTimeout(() => {
            if (type === 'airport') {
                const marker = airportMarkers.find(m => {
                    const latLng = m.getLatLng();
                    return Math.abs(latLng.lat - targetLocation.lat) < 0.0001 &&
                           Math.abs(latLng.lng - targetLocation.lng) < 0.0001;
                });
                if (marker) {
                    marker.openPopup();
                    console.log('Opened airport popup');
                }
            } else if (type === 'hotel') {
                const marker = hotelMarkers.find(m => {
                    const latLng = m.getLatLng();
                    return Math.abs(latLng.lat - targetLocation.lat) < 0.0001 &&
                           Math.abs(latLng.lng - targetLocation.lng) < 0.0001;
                });
                if (marker) {
                    marker.openPopup();
                    console.log('Opened hotel popup');
                }
            } else if (type === 'attraction') {
                const markerData = attractionMarkers.find(m => m.attraction.id === id);
                if (markerData) {
                    markerData.marker.openPopup();
                    console.log('Opened attraction popup');
                }
            }
        }, 1600);
    } else {
        console.log('Location not found!');
    }
}

// ========== 浏览量和点赞功能 ==========

// 安全的 localStorage 操作函数
function safeLocalStorage(action, key, value) {
    try {
        if (typeof localStorage === 'undefined') {
            console.warn('localStorage 不可用');
            return null;
        }
        const testKey = '__localStorage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        switch (action) {
            case 'get': return localStorage.getItem(key);
            case 'set': localStorage.setItem(key, value); return true;
            case 'remove': localStorage.removeItem(key); return true;
            default: return null;
        }
    } catch (error) {
        console.error('localStorage 操作失败:', error.message);
        return null;
    }
}

// 初始化统计数据
function initStats() {
    console.log('💾 初始化浏览量和点赞数据...');
    let views = safeLocalStorage('get', 'vietnam_tour_views');
    let likes = safeLocalStorage('get', 'vietnam_tour_likes');

    // 如果是第一次访问（localStorage为空），使用初始值
    if (!views || views === '0') {
        views = '756';  // 初始浏览量
        console.log('🎯 首次访问，使用初始值');
    } else {
        // 否则增加浏览量（每次页面加载都+1）
        views = (parseInt(views) + 1).toString();
        console.log('📈 浏览量+1');
    }

    if (!likes || likes === '0') {
        likes = '2658';  // 初始点赞数
        console.log('⭐ 首次访问，使用初始点赞值');
    }

    // 保存到 localStorage
    safeLocalStorage('set', 'vietnam_tour_views', views.toString());
    safeLocalStorage('set', 'vietnam_tour_likes', likes.toString());

    console.log('📊 当前数据 - 浏览量:', views, '点赞数:', likes);
    console.log('✅ 初始化完成 - 浏览量:', views, '点赞数:', likes);

    updateStatsDisplay(views, likes);

    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn) {
        console.log('❤️ 绑定点赞按钮事件');
        likeBtn.addEventListener('click', function() { handleLike(); });
    } else {
        console.error('❌ 找不到点赞按钮元素！');
    }
}

// 更新统计数据显示
function updateStatsDisplay(views, likes) {
    const viewCountEl = document.getElementById('viewCount');
    const likeCountEl = document.getElementById('likeCount');

    if (viewCountEl) {
        viewCountEl.textContent = formatNumber(views);
        console.log('✅ 浏览量已更新:', formatNumber(views));
    } else {
        console.error('❌ 找不到 viewCount 元素！');
    }

    if (likeCountEl) {
        likeCountEl.textContent = formatNumber(likes);
        console.log('❤️ 点赞数已更新:', formatNumber(likes));
    } else {
        console.error('❌ 找不到 likeCount 元素！');
    }
}

// 处理点赞
function handleLike() {
    console.log('💖 点赞按钮被点击');
    let likes = parseInt(safeLocalStorage('get', 'vietnam_tour_likes') || '0');
    likes = likes + 1;
    safeLocalStorage('set', 'vietnam_tour_likes', likes.toString());
    console.log('✅ 点赞成功！当前点赞数:', likes);

    // 更新数字显示
    const likeCountEl = document.getElementById('likeCount');
    if (likeCountEl) {
        likeCountEl.style.transform = 'scale(1.3)';
        setTimeout(() => {
            likeCountEl.textContent = formatNumber(likes);
            likeCountEl.style.transform = 'scale(1)';
        }, 150);
    }

    // 创建星星飘动动画
    createFloatingStars();

    // 按钮闪烁效果
    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn) {
        likeBtn.classList.add('liked');
        setTimeout(() => { likeBtn.classList.remove('liked'); }, 300);
    }
}

// 创建星星飘动动画效果
function createFloatingStars() {
    const likeBtn = document.getElementById('likeBtn');
    if (!likeBtn) return;

    // 创建 8-12 个星星
    const starCount = Math.floor(Math.random() * 5) + 8;  // 8-12 个星星

    for (let i = 0; i < starCount; i++) {
        setTimeout(() => {
            const star = document.createElement('div');
            star.className = 'floating-star';
            star.innerHTML = '⭐';

            // 随机起始位置（在按钮附近）
            const btnRect = likeBtn.getBoundingClientRect();
            const startX = btnRect.left + btnRect.width / 2;
            const startY = btnRect.top + btnRect.height / 2;

            // 随机飘动方向和距离
            const angle = (Math.random() * 360) * (Math.PI / 180);
            const distance = 50 + Math.random() * 80;  // 50-130px
            const endX = startX + Math.cos(angle) * distance;
            const endY = startY - Math.sin(angle) * distance - 50;  // 向上飘

            // 随机大小
            const size = 12 + Math.random() * 12;  // 12-24px

            star.style.cssText = `
                position: fixed;
                left: ${startX}px;
                top: ${startY}px;
                font-size: ${size}px;
                pointer-events: none;
                z-index: 10000;
                opacity: 1;
                transform: translate(-50%, -50%) scale(0);
                transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            `;

            document.body.appendChild(star);

            // 触发动画
            requestAnimationFrame(() => {
                star.style.transform = `translate(${endX - startX}px, ${endY - startY}px) scale(1.5) rotate(${Math.random() * 360}deg)`;
                star.style.opacity = '0';
            });

            // 动画结束后移除元素
            setTimeout(() => {
                if (star.parentNode) {
                    star.parentNode.removeChild(star);
                }
            }, 1000);
        }, i * 50);  // 每个星星间隔50ms出现
    }
}

// 格式化数字（添加千分位）
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ========== 汇率渲染功能 ==========

// 渲染汇率信息
function renderExchangeRate() {
    const exchangeRateEl = document.getElementById('exchangeRate');
    if (!exchangeRateEl) return;

    const rate = tourData.exchangeRate;
    if (!rate) return;

    let html = '<div class="exchange-rate">';

    // 显示当前汇率
    html += `
        <div class="rate-main">
            <div class="rate-formula">
                <span class="currency-cny">1 ${rate.cny}</span>
                <span class="rate-equals">=</span>
                <span class="rate-value">${rate.rate.toLocaleString()}</span>
                <span class="currency-vnd">${rate.vnd}</span>
            </div>
            <div class="rate-note">💡 ${rate.note}</div>
            <div class="rate-updated">📅 更新时间: ${rate.lastUpdated}</div>
        </div>
    `;

    // 显示常用金额参考
    if (rate.commonAmounts && rate.commonAmounts.length > 0) {
        html += '<div class="rate-quick-ref">';
        html += '<div class="quick-ref-title">💰 常用金额速查</div>';
        html += '<div class="quick-ref-list">';

        rate.commonAmounts.forEach(amount => {
            html += `
                <div class="quick-ref-item">
                    <span class="ref-cny">¥${amount.cny}</span>
                    <span class="ref-arrow">→</span>
                    <span class="ref-vnd">${amount.vnd.toLocaleString()}₫</span>
                </div>
            `;
        });

        html += '</div>';
        html += '</div>';
    }

    html += '</div>';
    exchangeRateEl.innerHTML = html;
}

// ========== 事件监听器 ==========

// DOMContentLoaded 时初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM Content Loaded');
    updateTimes();
    initStats(); // 初始化浏览量和点赞
});

// 页面完全加载后初始化地图（使用 window.onload 确保所有资源加载完成）
window.addEventListener('load', function() {
    console.log('🚀 Window fully loaded');
    console.log('tourData:', tourData);

    if (typeof tourData === 'undefined') {
        console.error('❌ tourData is undefined! Check data.js loading.');
        alert('数据加载失败，请刷新页面！');
        return;
    }

    initMap();
    updateTimes();
    setInterval(updateTimes, 1000); // 每秒更新时间
});

// 更新双时区时间
function updateTimes() {
    const now = new Date();

    // 上海时间 (UTC+8)
    const shanghaiTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }));
    const shanghaiHours = String(shanghaiTime.getHours()).padStart(2, '0');
    const shanghaiMinutes = String(shanghaiTime.getMinutes()).padStart(2, '0');
    const shanghaiSeconds = String(shanghaiTime.getSeconds()).padStart(2, '0');

    // 胡志明市时间 (UTC+7，比上海慢1小时)
    const hcmcTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const hcmcHours = String(hcmcTime.getHours()).padStart(2, '0');
    const hcmcMinutes = String(hcmcTime.getMinutes()).padStart(2, '0');
    const hcmcSeconds = String(hcmcTime.getSeconds()).padStart(2, '0');

    // 更新DOM
    const shanghaiTimeEl = document.getElementById('shanghaiTime');
    const hcmcTimeEl = document.getElementById('hcmcTime');

    if (shanghaiTimeEl) {
        shanghaiTimeEl.textContent = `${shanghaiHours}:${shanghaiMinutes}:${shanghaiSeconds}`;
    }

    if (hcmcTimeEl) {
        hcmcTimeEl.textContent = `${hcmcHours}:${hcmcMinutes}:${hcmcSeconds}`;
    }
}
