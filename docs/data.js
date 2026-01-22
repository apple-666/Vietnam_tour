// 旅游数据
// 数据版本号 - 每次更新数据时请修改此版本号
const DATA_VERSION = '2.1.1';
// 数据最后更新时间
const DATA_LAST_UPDATED = '2026-01-22 23:58:37';

const tourData = {
    // 基本信息
    info: {
        tourNo: 'VN4D-250123',
        destination: '越南胡志明市',
        departure: '上海',
        dates: '2026年1月23日-26日',
        duration: '4天3晚'
    },

    // 航班信息
    flights: {
        departure: {
            flightNo: 'CZ6077',
            airline: '南方航空',
            date: '2026年1月23日',
            departTime: '08:35',
            departLocation: '上海浦东国际机场',
            arriveTime: '12:10',
            arriveLocation: '胡志明市新山一国际机场'
        },
        return: {
            flightNo: 'CZ6078',
            airline: '南方航空',
            date: '2026年1月26日',
            departTime: '13:10',
            departLocation: '胡志明市新山一国际机场',
            arriveTime: '18:20',
            arriveLocation: '上海浦东国际机场'
        }
    },

    // 酒店信息
    hotels: [
        {
            id: 'hotel-1',
            name: '胡志明新山一酒店',
            address: '胡志明市中心，交通便利',
            phone: '',
            rating: 4,
            lat: 10.7729,
            lng: 106.6935,
            note: '连续住3晚'
        }
    ],

    // 机场信息
    airports: [
        {
            id: 'airport-sgn',
            name: '胡志明市新山一国际机场',
            nameEn: 'Tan Son Nhat International Airport',
            code: 'SGN',
            address: 'Truong Son Street, District 2, Ho Chi Minh City',
            lat: 10.8188,
            lng: 106.6519,
            note: '胡志明市主要国际机场'
        },
        {
            id: 'airport-pvg',
            name: '上海浦东国际机场',
            nameEn: 'Shanghai Pudong International Airport',
            code: 'PVG',
            address: '上海市浦东新区启航路',
            lat: 31.1443,
            lng: 121.8083,
            note: '出发机场'
        }
    ],

    // 景点信息
    attractions: [
        // D1 景点
        {
            id: 'attr-1',
            name: '槟城传统市场',
            nameEn: 'Ben Thanh Market',
            address: '胡志明市中心',
            description: '胡志明市最大的传统市场，可以购买各种纪念品和手信。',
            highlights: ['购买手信', '传统市场', '自由活动'],
            lat: 10.7718,
            lng: 106.6855,
            day: 1,
            order: 1,
            openingHours: '06:00-22:00',
            duration: '约1小时'
        },
        {
            id: 'attr-2',
            name: '范五老街',
            nameEn: 'Pham Ngu Lao Street',
            address: '胡志明市中心',
            description: '胡志明市著名的背包客区，体验热闹的夜生活和当地文化。',
            highlights: ['夜生活', '热闹街道', '当地文化'],
            lat: 10.7750,
            lng: 106.6900,
            day: 1,
            order: 2,
            openingHours: '全天开放'
        },
        // D2 景点
        {
            id: 'attr-3',
            name: '粉红教堂',
            nameEn: 'Tan Dinh Church',
            address: 'Hai Ba Trung Street, District 1, Ho Chi Minh City',
            description: '胡志明市独特的粉色天主教堂，是网红打卡点。',
            highlights: ['粉色建筑', '网红打卡', '外观参观'],
            lat: 10.7815,
            lng: 106.6850,
            day: 2,
            order: 1,
            openingHours: '05:00-19:00',
            duration: '15分钟'
        },
        {
            id: 'attr-4',
            name: '百年古邮局',
            nameEn: 'Saigon Central Post Office',
            address: '2 Công Xã Paris, Bến Nghé, District 1, Ho Chi Minh City',
            description: '胡志明市著名地标，建于19世纪的法式建筑，内部装饰华丽。',
            highlights: ['法式殖民建筑', '华丽内部装饰', '购买明信片'],
            lat: 10.7795,
            lng: 106.6980,
            day: 2,
            order: 2,
            openingHours: '07:30-18:00',
            duration: '15分钟'
        },
        {
            id: 'attr-5',
            name: '歌剧院',
            nameEn: 'Saigon Opera House',
            address: '7 Công Trường Lam Sơn, Bến Nghé, District 1, Ho Chi Minh City',
            description: '法国殖民时期建造的歌剧院，欣赏法式建筑之美。',
            highlights: ['法式建筑', '外观游览', '拍照打卡'],
            lat: 10.7718,
            lng: 106.7018,
            day: 2,
            order: 3,
            openingHours: '09:00-18:00',
            duration: '15分钟'
        },
        {
            id: 'attr-6',
            name: '市政广场',
            nameEn: 'City Hall Square',
            address: 'District 1, Ho Chi Minh City',
            description: '胡志明市中心的市政广场，欣赏法式建筑。',
            highlights: ['市政建筑', '广场拍照'],
            lat: 10.7765,
            lng: 106.6950,
            day: 2,
            order: 4,
            openingHours: '全天开放'
        },
        {
            id: 'attr-7',
            name: '总统府（统一宫）',
            nameEn: 'Reunification Palace',
            address: '135 Nam Ky Khoi Nghia, District 1, Ho Chi Minh City',
            description: '越南战争时期的南越总统府，现为博物馆，展示历史文物。',
            highlights: ['历史建筑', '战争历史', '地下掩体'],
            lat: 10.7770,
            lng: 106.6955,
            day: 2,
            order: 5,
            openingHours: '07:30-11:30, 13:00-16:00',
            duration: '60分钟'
        },
        {
            id: 'attr-8',
            name: '网红咖啡公寓',
            nameEn: 'Coffee Apartment',
            address: 'Nguyen Hue Walking Street, District 1, Ho Chi Minh City',
            description: '一栋聚集了众多特色咖啡厅的公寓楼，体验胡志明市的咖啡文化。',
            highlights: ['咖啡文化', '网红打卡', '特色小店'],
            lat: 10.7745,
            lng: 106.6985,
            day: 2,
            order: 6,
            openingHours: '09:00-22:00',
            duration: '60分钟'
        },
        {
            id: 'attr-9',
            name: '越南美术博物馆',
            nameEn: 'Fine Arts Museum',
            address: '97A Pho Duc Chinh, District 1, Ho Chi Minh City',
            description: '展示越南传统和现代艺术作品的博物馆，了解越南审美艺术。',
            highlights: ['艺术展览', '传统艺术', '现代艺术'],
            lat: 10.7740,
            lng: 106.6930,
            day: 2,
            order: 7,
            openingHours: '09:00-17:30',
            duration: '30分钟'
        },
        {
            id: 'attr-10',
            name: '阮文平书街',
            nameEn: 'Nguyen Van Book Street',
            address: 'District 1, Ho Chi Minh City',
            description: '胡志明市的文化街区，众多书店和咖啡馆聚集地。',
            highlights: ['书店', '文化街区', '自由活动'],
            lat: 10.7760,
            lng: 106.6920,
            day: 2,
            order: 8,
            openingHours: '全天开放'
        },
        // D3 景点
        {
            id: 'attr-11',
            name: '美拖市',
            nameEn: 'My Tho City',
            address: '湄公河三角洲，距胡志明市约2小时车程',
            description: '湄公河三角洲的重要城市，体验越南乡村生活。',
            highlights: ['湄公河游览', '乡村体验'],
            lat: 10.3600,
            lng: 106.3700,
            day: 3,
            order: 1,
            openingHours: '全天开放',
            note: '车程约2小时'
        },
        {
            id: 'attr-12',
            name: '湄公河',
            nameEn: 'Mekong River',
            address: '美拖市',
            description: '乘船游览湄公河，品尝热带水果，参观养蜂场和椰子糖加工。',
            highlights: ['乘船游览', '热带水果', '养蜂场', '椰子糖'],
            lat: 10.3500,
            lng: 106.3800,
            day: 3,
            order: 2,
            openingHours: '全天开放'
        },
        {
            id: 'attr-13',
            name: '泰山岛',
            nameEn: 'Thoi Son Island',
            address: '湄公河上',
            description: '品尝热带水果餐，欣赏乐曲表演，体验水上活动。',
            highlights: ['水果餐', '乐曲表演', '水上活动'],
            lat: 10.3400,
            lng: 106.3900,
            day: 3,
            order: 3,
            openingHours: '全天开放'
        },
        {
            id: 'attr-14',
            name: '永长寺',
            nameEn: 'Vinh Trang Pagoda',
            address: 'My Tho, Tien Giang Province',
            description: '美拖市著名的佛教寺庙，建筑风格融合中越文化。',
            highlights: ['佛教寺庙', '独特建筑', '文化融合'],
            lat: 10.3650,
            lng: 106.3750,
            day: 3,
            order: 4,
            openingHours: '06:00-18:00',
            duration: '30分钟'
        },
        {
            id: 'attr-15',
            name: '胡志明923公园',
            nameEn: 'Ho Chi Minh Park 923',
            address: '胡志明市中心',
            description: '市中心的休闲公园，自由活动区域。',
            highlights: ['休闲公园', '自由活动'],
            lat: 10.7700,
            lng: 106.6920,
            day: 3,
            order: 5,
            openingHours: '全天开放'
        }
    ],

    // 行程安排
    itinerary: [
        {
            day: 1,
            date: '2026年1月23日',
            title: '第1天：上海 → 胡志明市',
            meals: { breakfast: '自理', lunch: '自理', dinner: '含' },
            activities: [
                { time: '05:35', activity: '上海浦东机场集合，带齐护照及出境所需资料', location: '上海浦东机场' },
                { time: '08:35', activity: '乘坐CZ6077航班前往胡志明市', location: '航班' },
                { time: '12:10', activity: '抵达胡志明市，入住酒店休息', location: '胡志明市' },
                { time: '15:00', activity: '槟城传统市场自由活动，挑选心仪小手信（约1小时）', location: '槟城传统市场' },
                { time: '16:00', activity: '游览范五老街，体验热闹夜生活', location: '范五老街' },
                { time: '18:00', activity: '晚餐', location: '餐厅' }
            ],
            attractionIds: ['attr-1', 'attr-2']
        },
        {
            day: 2,
            date: '2026年1月24日',
            title: '第2天：胡志明市城市观光',
            meals: { breakfast: '酒店早餐', lunch: '含', dinner: '游船自助餐' },
            activities: [
                { time: '08:00', activity: '酒店早餐', location: '酒店' },
                { time: '09:30', activity: '粉红教堂外观参观（15分钟）', location: '粉红教堂' },
                { time: '09:45', activity: '百年古邮局参观（15分钟）', location: '百年古邮局' },
                { time: '10:00', activity: '歌剧院外观游览（15分钟）', location: '歌剧院' },
                { time: '10:15', activity: '市政广场参观', location: '市政广场' },
                { time: '10:30', activity: '总统府（统一宫）参观（60分钟）', location: '总统府' },
                { time: '12:00', activity: '午餐', location: '餐厅' },
                { time: '14:00', activity: '参观网红咖啡公寓（60分钟）', location: '网红咖啡公寓' },
                { time: '15:00', activity: '越南美术博物馆了解越南审美艺术（30分钟）', location: '越南美术博物馆' },
                { time: '15:30', activity: '阮文平书街自由活动', location: '阮文平书街' },
                { time: '18:00', activity: '游船自助餐', location: '游船' }
            ],
            attractionIds: ['attr-3', 'attr-4', 'attr-5', 'attr-6', 'attr-7', 'attr-8', 'attr-9', 'attr-10']
        },
        {
            day: 3,
            date: '2026年1月25日',
            title: '第3天：美拖市湄公河一日游',
            meals: { breakfast: '酒店早餐', lunch: '含（湄公河油泡象鱼风味餐）', dinner: '含' },
            activities: [
                { time: '08:00', activity: '酒店早餐', location: '酒店' },
                { time: '09:00', activity: '出发前往美拖市（车程约2小时）', location: '美拖市方向' },
                { time: '11:00', activity: '湄公河乘船游览', location: '湄公河' },
                { time: '11:30', activity: '泰山岛品尝热带水果餐，参观养蜂场和椰子糖加工，欣赏乐曲表演', location: '泰山岛' },
                { time: '13:00', activity: '午餐：湄公河油泡象鱼风味餐', location: '美拖市' },
                { time: '14:00', activity: '独木舟体验丛林风光', location: '湄公河' },
                { time: '15:00', activity: '返回胡志明市（车程约2小时）', location: '胡志明市方向' },
                { time: '17:00', activity: '永长寺参观（30分钟）', location: '永长寺' },
                { time: '17:30', activity: '胡志明923公园自由活动', location: '923公园' },
                { time: '19:00', activity: '晚餐', location: '餐厅' }
            ],
            attractionIds: ['attr-11', 'attr-12', 'attr-13', 'attr-14', 'attr-15']
        },
        {
            day: 4,
            date: '2026年1月26日',
            title: '第4天：胡志明市 → 上海',
            meals: { breakfast: '酒店早餐', lunch: '自理', dinner: '自理' },
            activities: [
                { time: '08:00', activity: '自由活动，睡到自然醒，在酒店享用早餐', location: '酒店' },
                { time: '10:00', activity: '集合乘车前往机场', location: '前往机场' },
                { time: '13:10', activity: '乘坐CZ6078航班返回上海', location: '航班' },
                { time: '18:20', activity: '抵达上海，结束愉快旅程', location: '上海浦东机场' }
            ],
            attractionIds: []
        }
    ],

    // 重要提示
    tips: [
        {
            category: 'important',
            icon: '🛂',
            text: '越南电子签需要提前申请，建议出发前至少3个工作日完成'
        },
        {
            category: 'important',
            icon: '🛫',
            text: '航班：CZ6077/CZ6078（南方航空），请提前2.5小时到达机场'
        },
        {
            category: 'important',
            icon: '💰',
            text: '货币：越南盾（VND），建议携带少量人民币兑换'
        },
        {
            category: 'normal',
            icon: '🔌',
            text: '电压220V，使用两孔圆插（德标），需携带转换器'
        },
        {
            category: 'normal',
            icon: '⏰',
            text: '时差：越南比中国慢1小时'
        },
        {
            category: 'normal',
            icon: '🌡️',
            text: '1月气温：24-33°C，建议穿夏装，带防晒用品'
        },
        {
            category: 'normal',
            icon: '📱',
            text: '电话卡：可在机场购买Viettel或Vinaphone卡'
        },
        {
            category: 'normal',
            icon: '🚕',
            text: '交通：市区推荐使用Grab打车软件，安全可靠'
        },
        {
            category: 'normal',
            icon: '💧',
            text: '饮水：建议购买瓶装水，不要直接饮用自来水'
        },
        {
            category: 'normal',
            icon: '☕',
            text: '推荐体验：越南滴漏咖啡、鸡蛋咖啡'
        },
        {
            category: 'normal',
            icon: '🍽️',
            text: '餐饮：D1晚餐含，D2全含（游船自助餐），D3全含，D4仅早餐'
        }
    ],

    // 紧急联系方式
    emergencyContacts: [
        { name: '紧急报警', phone: '113' },
        { name: '急救', phone: '115' },
        { name: '中国驻胡志明市总领事馆', phone: '+84-28-38292457' },
        { name: '胡志明市旅游热线（24小时）', phone: '1087' },
        { name: '外交部全球领保热线', phone: '+86-10-12308' }
    ]
};
