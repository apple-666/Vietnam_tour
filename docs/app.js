// 全局变量
let map;
let hotelMarkers = [];
let attractionMarkers = [];
let airportMarkers = [];
let routeLayers = [];
let currentDayLayer = null;

// 初始化地图
function initMap() {
    // 创建地图，中心定位在胡志明市
    map = L.map('map').setView([10.7740, 106.6900], 13);

    // 添加地图图层（使用OpenStreetMap）
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

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
    renderDataVersion();
    updatePageTitle();
    populateLocationSelect();
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

// 初始化应用（由 HTML 中的 window.load 事件调用）
function initializeApp() {
    console.log('App Initializing');
    console.log('tourData:', tourData);

    if (typeof tourData === 'undefined') {
        console.error('tourData is undefined! Check data.js loading.');
        const mapEl = document.getElementById('map');
        if (mapEl) {
            mapEl.innerHTML = '<div style="padding: 20px; text-align: center; color: red;">数据加载失败，请刷新页面！</div>';
        }
        return;
    }

    try {
        initMap();

        // 移动端：延迟重新计算地图尺寸，确保正确显示
        setTimeout(function() {
            if (map) {
                map.invalidateSize();
                console.log('Map size recalculated');
            }
        }, 500);

        updateTimes();
        setInterval(updateTimes, 1000); // 每秒更新时间
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Initialization error:', error);
        const mapEl = document.getElementById('map');
        if (mapEl) {
            mapEl.innerHTML = '<div style="padding: 20px; text-align: center; color: red;">初始化失败: ' + error.message + '</div>';
        }
    }
}

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
