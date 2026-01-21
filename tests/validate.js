/**
 * 数据验证脚本 - 对比 PDF 和 data.js
 * 运行: node tests/validate.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// 读取 data.js
const dataPath = path.join(__dirname, '../data/data.js');
const dataContent = fs.readFileSync(dataPath, 'utf-8');

// 使用 vm 来执行代码并获取 tourData
const context = {};
const script = new vm.Script(`
    ${dataContent}
    tourData;
`);
const tourData = script.runInNewContext(context);

// PDF 中的关键数据（从图像中提取）
const pdfData = {
    // 基本信息
    tourNo: 'VN4D-250123',
    dates: '2026年1月23日-26日',
    destination: '越南胡志明市',

    // 航班信息
    flights: {
        departure: {
            flightNo: '9C8521',
            date: '2026年1月23日',
            departTime: '09:55',
            arriveTime: '13:20',
            from: '上海浦东国际机场T2航站楼',
            to: '胡志明市新山一国际机场'
        },
        return: {
            flightNo: '9C8522',
            date: '2026年1月26日',
            departTime: '14:20',
            arriveTime: '19:45',
            from: '胡志明市新山一国际机场',
            to: '上海浦东国际机场T2航站楼'
        }
    },

    // 景点（按天）
    attractions: {
        day1: ['中央邮局', '红教堂', '歌剧院'],
        day2: ['古芝地道', '玉山寺', '战争遗迹博物馆', '滨城市场'],
        day3: ['天后圣母庙', '统一堂', '孙德胜纪念堂'],
        day4: []
    },

    // 酒店名称关键词
    hotelKeyword: '尼西亚',

    // 第1天行程时间
    day1Schedule: {
        assembly: '06:30',
        departure: '09:55',
        arrival: '13:20',
        checkIn: '15:00',
        centralPostOffice: '16:00',
        notredame: '17:00',
        operaHouse: '18:00'
    },

    // 第4天返程时间
    day4Schedule: {
        returnFlight: '14:20'
    }
};

// 验证结果
const results = {
    passed: [],
    failed: [],
    warnings: []
};

console.log('='.repeat(60));
console.log('数据一致性验证 - PDF vs data.js');
console.log('='.repeat(60));
console.log();

// ========== 验证1：航班信息 ==========
console.log('【验证1】航班信息');
console.log('-'.repeat(60));

const day1Activities = tourData.itinerary[0].activities;
const departureFlight = day1Activities.find(a => a.activity.includes('9C8521'));

if (departureFlight) {
    console.log(`✓ 去程航班: ${departureFlight.activity}`);
    console.log(`  时间: ${departureFlight.time}`);

    if (departureFlight.time === pdfData.flights.departure.departTime) {
        results.passed.push('去程航班时间正确');
        console.log(`  ✓ 时间匹配 PDF (${pdfData.flights.departure.departTime})`);
    } else {
        results.failed.push(`去程航班时间不匹配: ${departureFlight.time} vs ${pdfData.flights.departure.departTime}`);
        console.log(`  ✗ 时间不匹配 PDF (${pdfData.flights.departure.departTime})`);
    }
} else {
    results.failed.push('未找到去程航班信息');
    console.log('✗ 未找到去程航班信息');
}

const day4Activities = tourData.itinerary[3].activities;
const returnFlight = day4Activities.find(a => a.activity.includes('9C8522'));

if (returnFlight) {
    console.log(`✓ 返程航班: ${returnFlight.activity}`);
    console.log(`  时间: ${returnFlight.time}`);

    if (returnFlight.time === pdfData.flights.return.departTime) {
        results.passed.push('返程航班时间正确');
        console.log(`  ✓ 时间匹配 PDF (${pdfData.flights.return.departTime})`);
    } else {
        results.failed.push(`返程航班时间不匹配: ${returnFlight.time} vs ${pdfData.flights.return.departTime}`);
        console.log(`  ✗ 时间不匹配 PDF (${pdfData.flights.return.departTime})`);
    }
} else {
    results.failed.push('未找到返程航班信息');
    console.log('✗ 未找到返程航班信息');
}

console.log();

// ========== 验证2：景点数量和名称 ==========
console.log('【验证2】景点数量和名称');
console.log('-'.repeat(60));

const expectedAttractions = {
    1: ['中央邮局', '红教堂', '歌剧院'],
    2: ['古芝地道', '玉山寺', '战争遗迹博物馆', '滨城市场'],
    3: ['天后圣母庙', '统一堂', '孙德胜纪念堂'],
    4: []
};

for (let day = 1; day <= 4; day++) {
    const itinerary = tourData.itinerary.find(d => d.day === day);
    const expected = expectedAttractions[day];

    console.log(`第${day}天:`);

    if (itinerary.attractionIds.length === expected.length) {
        console.log(`  ✓ 景点数量: ${itinerary.attractionIds.length}/${expected.length}`);

        // 检查每个景点
        itinerary.attractionIds.forEach((id, index) => {
            const attraction = tourData.attractions.find(a => a.id === id);
            if (attraction) {
                const expectedName = expected[index];
                if (attraction.name.includes(expectedName)) {
                    console.log(`    ✓ ${index + 1}. ${attraction.name}`);
                    results.passed.push(`第${day}天第${index + 1}个景点正确`);
                } else {
                    results.warnings.push(`第${day}天第${index + 1}个景点名称可能不匹配: ${attraction.name} vs ${expectedName}`);
                    console.log(`    ⚠ ${index + 1}. ${attraction.name} (PDF: ${expectedName})`);
                }
            }
        });
    } else {
        results.failed.push(`第${day}天景点数量不匹配`);
        console.log(`  ✗ 景点数量: ${itinerary.attractionIds.length}/${expected.length}`);
    }
}

console.log();

// ========== 验证3：日期 ==========
console.log('【验证3】日期验证');
console.log('-'.repeat(60));

const expectedDates = {
    1: '2026年1月23日',
    2: '2026年1月24日',
    3: '2026年1月25日',
    4: '2026年1月26日'
};

for (let day = 1; day <= 4; day++) {
    const itinerary = tourData.itinerary.find(d => d.day === day);
    const expected = expectedDates[day];

    if (itinerary.date === expected) {
        console.log(`✓ 第${day}天日期: ${itinerary.date}`);
        results.passed.push(`第${day}天日期正确`);
    } else {
        results.failed.push(`第${day}天日期不匹配: ${itinerary.date} vs ${expected}`);
        console.log(`✗ 第${day}天日期: ${itinerary.date} (PDF: ${expected})`);
    }
}

console.log();

// ========== 验证4：酒店信息 ==========
console.log('【验证4】酒店信息');
console.log('-'.repeat(60));

const hasMatchingHotel = tourData.hotels.some(h => h.name.includes(pdfData.hotelKeyword));

if (hasMatchingHotel) {
    const matchingHotel = tourData.hotels.find(h => h.name.includes(pdfData.hotelKeyword));
    console.log(`✓ 找到PDF中提到的酒店:`);
    console.log(`  ${matchingHotel.name}`);
    results.passed.push('酒店信息匹配');
} else {
    results.warnings.push('未找到PDF中的酒店名称');
    console.log('⚠ 未在数据中找到PDF中的酒店名称包含"尼西亚"');
    console.log('  当前酒店列表:');
    tourData.hotels.forEach(h => console.log(`    - ${h.name}`));
}

console.log();

// ========== 验证5：第1天行程时间 ==========
console.log('【验证5】第1天行程时间顺序');
console.log('-'.repeat(60));

const day1Schedule = tourData.itinerary[0].activities;
let timeOrderCorrect = true;
let lastTime = '00:00';

day1Schedule.forEach((activity, index) => {
    if (activity.time < lastTime) {
        timeOrderCorrect = false;
        results.failed.push(`第1天行程时间顺序错误: ${lastTime} -> ${activity.time}`);
        console.log(`✗ 时间顺序错误: ${lastTime} -> ${activity.time}`);
    }
    lastTime = activity.time;
});

if (timeOrderCorrect) {
    console.log('✓ 第1天行程时间顺序正确');
    results.passed.push('第1天行程时间顺序正确');
}

// 检查关键时间点
const checkTime = (expectedTime, actualActivity) => {
    const activity = day1Schedule.find(a => a.activity.includes(actualActivity));
    if (activity && activity.time === expectedTime) {
        console.log(`✓ ${actualActivity}: ${activity.time}`);
        return true;
    } else if (activity) {
        console.log(`⚠ ${actualActivity}: ${activity.time} (PDF: ${expectedTime})`);
        return false;
    }
    return false;
};

checkTime('09:55', '9C8521');
checkTime('13:20', '抵达');

console.log();

// ========== 验证6：提示信息关键词 ==========
console.log('【验证6】提示信息关键词检查');
console.log('-'.repeat(60));

const requiredTipKeywords = ['电子签', '越南盾', '转换器', '时差'];
const allTipsText = tourData.tips.map(t => t.text).join(' ');

requiredTipKeywords.forEach(keyword => {
    if (allTipsText.includes(keyword)) {
        console.log(`✓ 包含关键词: "${keyword}"`);
        results.passed.push(`包含关键词: ${keyword}`);
    } else {
        results.warnings.push(`缺少关键词: ${keyword}`);
        console.log(`⚠ 缺少关键词: "${keyword}"`);
    }
});

console.log();

// ========== 验证7：景点坐标合理性 ==========
console.log('【验证7】景点坐标合理性');
console.log('-'.repeat(60));

tourData.attractions.forEach(attr => {
    const lat = attr.lat;
    const lng = attr.lng;

    // 胡志明市的大致坐标范围
    if (lat >= 10 && lat <= 11.5 && lng >= 106 && lng <= 107.5) {
        console.log(`✓ ${attr.name}: 坐标合理 (${lat}, ${lng})`);
        results.passed.push(`${attr.name} 坐标合理`);
    } else {
        results.warnings.push(`${attr.name} 坐标可能异常`);
        console.log(`⚠ ${attr.name}: 坐标可能异常 (${lat}, ${lng})`);
    }
});

console.log();

// ========== 总结 ==========
console.log('='.repeat(60));
console.log('验证结果汇总');
console.log('='.repeat(60));

console.log(`✓ 通过: ${results.passed.length}`);
console.log(`✗ 失败: ${results.failed.length}`);
console.log(`⚠ 警告: ${results.warnings.length}`);
console.log(`总计: ${results.passed.length + results.failed.length + results.warnings.length} 项`);
console.log();

if (results.failed.length > 0) {
    console.log('【失败项目】');
    results.failed.forEach(item => console.log(`  ✗ ${item}`));
    console.log();
}

if (results.warnings.length > 0) {
    console.log('【警告项目】');
    results.warnings.forEach(item => console.log(`  ⚠ ${item}`));
    console.log();
}

if (results.failed.length === 0 && results.warnings.length === 0) {
    console.log('🎉 所有数据验证通过，数据完全一致！');
} else if (results.failed.length === 0) {
    console.log('✅ 所有核心数据正确，但有一些需要注意的警告。');
} else {
    console.log('⚠️ 发现数据不一致，建议修正！');
}

console.log('='.repeat(60));
