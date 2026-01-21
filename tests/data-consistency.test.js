/**
 * 数据一致性测试
 * 对比 PDF、data.js 和网页显示的数据
 */

// 从 PDF 中提取的关键数据
const pdfData = {
    // 航班信息
    flights: {
        departure: {
            flightNo: '9C8521',
            date: '2026年1月23日',
            depart: '上海浦东T2航站楼 09:55',
            arrive: '胡志明市新山一国际机场 13:20'
        },
        return: {
            flightNo: '9C8522',
            date: '2026年1月26日',
            depart: '胡志明市新山一国际机场 14:20',
            arrive: '上海浦东T2航站楼 19:45'
        }
    },

    // 景点列表（按天）
    attractions: {
        day1: ['中央邮局', '红教堂', '歌剧院'],
        day2: ['古芝地道', '玉山寺', '战争遗迹博物馆', '滨城市场'],
        day3: ['天后圣母庙', '统一堂', '孙德胜纪念堂'],
        day4: []
    },

    // 酒店信息
    hotel: {
        name: '尼西亚大酒店'
    },

    // 团号和日期
    tourInfo: {
        tourNo: 'VN4D-250123',
        dates: '2026年1月23日-26日',
        destination: '越南胡志明市'
    },

    // 注意事项
    tips: [
        '电子签需要提前申请',
        '货币：越南盾（VND）',
        '电压220V，德标转换器',
        '时差：比中国慢1小时',
        '气温：24-33°C',
        '电话卡：Viettel/Vinaphone'
    ]
};

// 测试函数
function runConsistencyTests() {
    console.log('========== 数据一致性测试 ==========\n');

    const results = {
        passed: 0,
        failed: 0,
        warnings: 0
    };

    // 测试1：航班信息对比
    console.log('【测试1】航班信息对比');
    console.log('-----------------------------------');
    const day1 = tourData.itinerary[0];
    const day4 = tourData.itinerary[3];

    // 去程航班
    const departureActivity = day1.activities.find(a => a.activity.includes('9C8521'));
    if (departureActivity) {
        console.log('✓ 去程航班号:', departureActivity.activity.includes('9C8521') ? '9C8521 ✓' : '不匹配');
        console.log('✓ 出发时间:', departureActivity.time, '(预期: 09:55)');
        results.passed++;
    } else {
        console.log('✗ 未找到去程航班信息');
        results.failed++;
    }

    // 返程航班
    const returnActivity = day4.activities.find(a => a.activity.includes('9C8522'));
    if (returnActivity) {
        console.log('✓ 返程航班号:', returnActivity.activity.includes('9C8522') ? '9C8522 ✓' : '不匹配');
        console.log('✓ 返程时间:', returnActivity.time, '(预期: 14:20)');
        results.passed++;
    } else {
        console.log('✗ 未找到返程航班信息');
        results.failed++;
    }
    console.log();

    // 测试2：景点数量对比
    console.log('【测试2】景点数量对比');
    console.log('-----------------------------------');
    const expectedAttractions = {
        day1: 3,
        day2: 4,
        day3: 3,
        day4: 0
    };

    for (let i = 1; i <= 4; i++) {
        const dayData = tourData.itinerary[i-1];
        const actualCount = dayData.attractionIds.length;
        const expectedCount = expectedAttractions[`day${i}`];

        if (actualCount === expectedCount) {
            console.log(`✓ 第${i}天景点数量: ${actualCount}/${expectedCount}`);
            results.passed++;
        } else {
            console.log(`✗ 第${i}天景点数量不匹配: ${actualCount}/${expectedCount}`);
            results.failed++;
        }
    }
    console.log();

    // 测试3：景点名称匹配
    console.log('【测试3】景点名称匹配检查');
    console.log('-----------------------------------');

    const pdfAttractionNames = {
        'attr-1': '中央邮局',
        'attr-2': '红教堂',
        'attr-3': '歌剧院',
        'attr-4': '古芝地道',
        'attr-5': '玉山寺',
        'attr-6': '战争遗迹博物馆',
        'attr-7': '滨城市场',
        'attr-8': '天后圣母庙',
        'attr-9': '统一堂',
        'attr-10': '孙德胜纪念堂'
    };

    tourData.attractions.forEach(attr => {
        const expectedName = pdfAttractionNames[attr.id];
        if (attr.name.includes(expectedName) || attr.nameEn.includes(expectedName)) {
            console.log(`✓ ${attr.id}: ${attr.name}`);
            results.passed++;
        } else {
            console.log(`⚠ ${attr.id}: ${attr.name} (PDF中: ${expectedName})`);
            results.warnings++;
        }
    });
    console.log();

    // 测试4：时间顺序检查
    console.log('【测试4】行程时间顺序检查');
    console.log('-----------------------------------');

    tourData.itinerary.forEach(day => {
        let lastTime = '00:00';
        let timeOrderCorrect = true;

        day.activities.forEach(activity => {
            if (activity.time < lastTime) {
                console.log(`✗ 第${day.day}天时间顺序错误: ${lastTime} -> ${activity.time}`);
                timeOrderCorrect = false;
                results.failed++;
            }
            lastTime = activity.time;
        });

        if (timeOrderCorrect) {
            console.log(`✓ 第${day.day}天时间顺序正确`);
            results.passed++;
        }
    });
    console.log();

    // 测试5：酒店信息检查
    console.log('【测试5】酒店信息检查');
    console.log('-----------------------------------');
    const pdfHotelName = '尼西亚';
    const hasMatchingHotel = tourData.hotels.some(h => h.name.includes(pdfHotelName));

    if (hasMatchingHotel) {
        const matchingHotel = tourData.hotels.find(h => h.name.includes(pdfHotelName));
        console.log(`✓ 找到PDF中提到的酒店: ${matchingHotel.name}`);
        results.passed++;
    } else {
        console.log(`⚠ 未在数据中找到PDF中的酒店名称包含"尼西亚"`);
        console.log('  当前酒店列表:');
        tourData.hotels.forEach(h => console.log(`    - ${h.name}`));
        results.warnings++;
    }
    console.log();

    // 测试6：提示信息关键词检查
    console.log('【测试6】提示信息关键词检查');
    console.log('-----------------------------------');

    const requiredTipKeywords = ['电子签', '越南盾', '转换器', '时差', 'Viettel'];
    const allTipsText = tourData.tips.map(t => t.text).join(' ');

    requiredTipKeywords.forEach(keyword => {
        if (allTipsText.includes(keyword)) {
            console.log(`✓ 包含关键词: "${keyword}"`);
            results.passed++;
        } else {
            console.log(`⚠ 缺少关键词: "${keyword}"`);
            results.warnings++;
        }
    });
    console.log();

    // 测试7：日期验证
    console.log('【测试7】日期验证');
    console.log('-----------------------------------');
    const expectedDates = {
        day1: '2026年1月23日',
        day2: '2026年1月24日',
        day3: '2026年1月25日',
        day4: '2026年1月26日'
    };

    let allDatesCorrect = true;
    tourData.itinerary.forEach(day => {
        const expected = expectedDates[`day${day.day}`];
        if (day.date === expected) {
            console.log(`✓ 第${day.day}天日期: ${day.date}`);
            results.passed++;
        } else {
            console.log(`✗ 第${day.day}天日期不匹配: ${day.date} (预期: ${expected})`);
            allDatesCorrect = false;
            results.failed++;
        }
    });
    console.log();

    // 测试8：景点坐标合理性检查
    console.log('【测试8】景点坐标合理性检查');
    console.log('-----------------------------------');

    tourData.attractions.forEach(attr => {
        const lat = attr.lat;
        const lng = attr.lng;

        // 胡志明市的大致坐标范围：纬度 10-11，经度 106-107
        if (lat >= 10 && lat <= 11 && lng >= 106 && lng <= 107) {
            console.log(`✓ ${attr.name}: 坐标合理 (${lat}, ${lng})`);
            results.passed++;
        } else {
            console.log(`⚠ ${attr.name}: 坐标可能异常 (${lat}, ${lng})`);
            results.warnings++;
        }
    });
    console.log();

    // 测试总结
    console.log('========== 测试总结 ==========');
    console.log(`✓ 通过: ${results.passed}`);
    console.log(`✗ 失败: ${results.failed}`);
    console.log(`⚠ 警告: ${results.warnings}`);
    console.log(`总计: ${results.passed + results.failed + results.warnings} 项测试`);
    console.log('================================');

    return results;
}

// 如果在浏览器环境中
if (typeof window !== 'undefined') {
    window.runDataConsistencyTests = runConsistencyTests;
    console.log('数据一致性测试已加载。运行 runDataConsistencyTests() 开始测试。');
}

// 如果在 Node.js 环境中
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runConsistencyTests, pdfData };
}
