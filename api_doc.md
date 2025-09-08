# API Documentation

ตัวอย่าง data and Field

{
    "eventSystem": {
        "systemInfo": {
            "name": "Event Management System",
            "version": "1.0.0",
            "lastUpdated": "2025-09-07",
            "totalEvents": 42
        },
        "categories": [
            {
                "id": "workshop",
                "name": "Workshop & Training",
                "description": "เวิร์คช็อปและการฝึกอบรม",
                "color": "#FF6B6B"
            },
            {
                "id": "conference",
                "name": "Conference & Seminar",
                "description": "การประชุมและสัมมนา",
                "color": "#4ECDC4"
            },
            {
                "id": "networking",
                "name": "Networking Event",
                "description": "งานสร้างเครือข่าย",
                "color": "#45B7D1"
            },
            {
                "id": "entertainment",
                "name": "Entertainment",
                "description": "งานบันเทิง",
                "color": "#96CEB4"
            },
            {
                "id": "sports",
                "name": "Sports & Fitness",
                "description": "กีฬาและออกกำลังกาย",
                "color": "#FFEAA7"
            },
            {
                "id": "cultural",
                "name": "Cultural Event",
                "description": "งานวัฒนธรรม",
                "color": "#DDA0DD"
            }
        ],
        "events": [
            {
                "id": "evt_001",
                "title": "Digital Marketing Masterclass 2025",
                "description": "เรียนรู้กลยุทธ์ Digital Marketing ที่ทันสมัย พร้อมเทคนิคเพิ่มยอดขายออนไลน์",
                "category": "workshop",
                "type": "workshop",
                "status": "active",
                "featured": true,
                "organizer": {
                    "name": "Marketing Pro Academy",
                    "contact": "contact@marketingpro.com",
                    "phone": "+66-2-xxx-xxxx"
                },
                "schedule": {
                    "startDate": "2025-10-15",
                    "endDate": "2025-10-17",
                    "startTime": "09:00",
                    "endTime": "17:00",
                    "timezone": "Asia/Bangkok"
                },
                "location": {
                    "type": "hybrid",
                    "venue": "Queen Sirikit National Convention Center",
                    "address": "60 New Ratchadaphisek Rd, Khlong Toei, Bangkok 10110",
                    "coordinates": {
                        "lat": 13.7205,
                        "lng": 100.5592
                    },
                    "onlineLink": "https://zoom.us/j/example123"
                },
                "pricing": {
                    "currency": "THB",
                    "earlyBird": 4500,
                    "regular": 5500,
                    "student": 3500,
                    "group": 4000
                },
                "capacity": {
                    "max": 200,
                    "registered": 145,
                    "available": 55
                },
                "images": {
                    "banner": "https://example.com/images/digital-marketing-banner.jpg",
                    "thumbnail": "https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg",
                    "gallery": [
                        "https://example.com/images/digital-marketing-1.jpg",
                        "https://example.com/images/digital-marketing-2.jpg",
                        "https://example.com/images/digital-marketing-3.jpg"
                    ]
                },
                "tags": [
                    "digital marketing",
                    "online business",
                    "e-commerce",
                    "social media"
                ],
                "requirements": [
                    "โน๊ตบุ๊ค",
                    "ความรู้พื้นฐานคอมพิวเตอร์"
                ],
                "speakers": [
                    {
                        "name": "John Smith",
                        "title": "Digital Marketing Expert",
                        "company": "Google Thailand",
                        "bio": "ผู้เชี่ยวชาญด้าน Digital Marketing มากว่า 10 ปี",
                        "image": "https://example.com/speakers/john-smith.jpg"
                    }
                ]
            },
            {
                "id": "evt_002",
                "title": "Thailand Tech Conference 2025",
                "description": "การประชุมเทคโนโลยีที่ใหญ่ที่สุดในไทย รวมผู้เชี่ยวชาญจากทั่วโลก",
                "category": "conference",
                "type": "conference",
                "status": "active",
                "featured": true,
                "organizer": {
                    "name": "Tech Thailand Association",
                    "contact": "info@techthailand.org",
                    "phone": "+66-2-yyy-yyyy"
                },
                "schedule": {
                    "startDate": "2025-11-20",
                    "endDate": "2025-11-22",
                    "startTime": "08:30",
                    "endTime": "18:00",
                    "timezone": "Asia/Bangkok"
                },
                "location": {
                    "type": "onsite",
                    "venue": "BITEC Bangna",
                    "address": "88 Bangna-Trat Rd, Bang Na, Bangkok 10260",
                    "coordinates": {
                        "lat": 13.6678,
                        "lng": 100.6074
                    }
                },
                "pricing": {
                    "currency": "THB",
                    "earlyBird": 8500,
                    "regular": 12000,
                    "student": 6000,
                    "vip": 25000
                },
                "capacity": {
                    "max": 2000,
                    "registered": 1456,
                    "available": 544
                },
                "images": {
                    "banner": "https://example.com/images/tech-conference-banner.jpg",
                    "thumbnail": "https://example.com/images/tech-conference-thumb.jpg",
                    "gallery": [
                        "https://example.com/images/tech-conf-1.jpg",
                        "https://example.com/images/tech-conf-2.jpg"
                    ]
                },
                "tags": [
                    "technology",
                    "AI",
                    "blockchain",
                    "startup"
                ],
                "tracks": [
                    "Artificial Intelligence",
                    "Blockchain & Cryptocurrency",
                    "Startup Ecosystem",
                    "Cloud Computing"
                ]
            },
            {
                "id": "evt_003",
                "title": "Bangkok Business Networking Night",
                "description": "งานสร้างเครือข่ายธุรกิจในกรุงเทพฯ สำหรับผู้ประกอบการและนักธุรกิจ",
                "category": "networking",
                "type": "networking",
                "status": "active",
                "featured": false,
                "organizer": {
                    "name": "Bangkok Business Network",
                    "contact": "events@bkk-network.com",
                    "phone": "+66-2-zzz-zzzz"
                },
                "schedule": {
                    "startDate": "2025-09-25",
                    "endDate": "2025-09-25",
                    "startTime": "18:00",
                    "endTime": "21:00",
                    "timezone": "Asia/Bangkok"
                },
                "location": {
                    "type": "onsite",
                    "venue": "Lebua State Tower",
                    "address": "1055 Silom Rd, Silom, Bang Rak, Bangkok 10500",
                    "coordinates": {
                        "lat": 13.7221,
                        "lng": 100.5143
                    }
                },
                "pricing": {
                    "currency": "THB",
                    "regular": 1500,
                    "member": 1000
                },
                "capacity": {
                    "max": 150,
                    "registered": 89,
                    "available": 61
                },
                "images": {
                    "banner": "https://example.com/images/networking-banner.jpg",
                    "thumbnail": "https://example.com/images/networking-thumb.jpg",
                    "gallery": []
                },
                "tags": [
                    "networking",
                    "business",
                    "entrepreneur"
                ],
                "includes": [
                    "Welcome drink",
                    "Finger food",
                    "Business card exchange"
                ]
            },
            {
                "id": "evt_004",
                "title": "Jazz Under the Stars",
                "description": "คอนเสิร์ตแจ๊สกลางแจ้งใต้แสงดาว พร้อมศิลปินระดับโลก",
                "category": "entertainment",
                "type": "concert",
                "status": "active",
                "featured": true,
                "organizer": {
                    "name": "Bangkok Jazz Society",
                    "contact": "info@bangkokjazz.com",
                    "phone": "+66-2-aaa-aaaa"
                },
                "schedule": {
                    "startDate": "2025-12-15",
                    "endDate": "2025-12-15",
                    "startTime": "19:30",
                    "endTime": "22:30",
                    "timezone": "Asia/Bangkok"
                },
                "location": {
                    "type": "onsite",
                    "venue": "Lumpini Park Amphitheater",
                    "address": "Rama IV Rd, Pathum Wan, Bangkok 10330",
                    "coordinates": {
                        "lat": 13.7307,
                        "lng": 100.5418
                    }
                },
                "pricing": {
                    "currency": "THB",
                    "vip": 3500,
                    "premium": 2500,
                    "general": 1500,
                    "student": 800
                },
                "capacity": {
                    "max": 1500,
                    "registered": 892,
                    "available": 608
                },
                "images": {
                    "banner": "https://example.com/images/jazz-concert-banner.jpg",
                    "thumbnail": "https://example.com/images/jazz-concert-thumb.jpg",
                    "gallery": [
                        "https://example.com/images/jazz-1.jpg",
                        "https://example.com/images/jazz-2.jpg",
                        "https://example.com/images/jazz-3.jpg"
                    ]
                },
                "tags": [
                    "jazz",
                    "music",
                    "concert",
                    "outdoor"
                ],
                "artists": [
                    {
                        "name": "Marcus Miller",
                        "instrument": "Bass Guitar",
                        "country": "USA"
                    },
                    {
                        "name": "Hiromi Uehara",
                        "instrument": "Piano",
                        "country": "Japan"
                    }
                ]
            },
            {
                "id": "evt_005",
                "title": "Bangkok Marathon 2025",
                "description": "งานวิ่งมาราธอนระดับนานาชาติในกรุงเทพฯ",
                "category": "sports",
                "type": "sports",
                "status": "active",
                "featured": true,
                "organizer": {
                    "name": "Bangkok Marathon Association",
                    "contact": "register@bangkokmarathon.com",
                    "phone": "+66-2-bbb-bbbb"
                },
                "schedule": {
                    "startDate": "2025-11-10",
                    "endDate": "2025-11-10",
                    "startTime": "05:00",
                    "endTime": "12:00",
                    "timezone": "Asia/Bangkok"
                },
                "location": {
                    "type": "onsite",
                    "venue": "Sanam Luang",
                    "address": "Na Phra Lan Rd, Phra Borom Maha Ratchawang, Phra Nakhon, Bangkok 10200",
                    "coordinates": {
                        "lat": 13.7548,
                        "lng": 100.493
                    }
                },
                "pricing": {
                    "currency": "THB",
                    "fullMarathon": 2500,
                    "halfMarathon": 2000,
                    "miniMarathon": 1500,
                    "funRun": 800
                },
                "capacity": {
                    "max": 25000,
                    "registered": 18456,
                    "available": 6544
                },
                "images": {
                    "banner": "https://example.com/images/marathon-banner.jpg",
                    "thumbnail": "https://example.com/images/marathon-thumb.jpg",
                    "gallery": [
                        "https://example.com/images/marathon-1.jpg",
                        "https://example.com/images/marathon-2.jpg"
                    ]
                },
                "tags": [
                    "marathon",
                    "running",
                    "fitness",
                    "sports"
                ],
                "distances": [
                    "42.195km",
                    "21.1km",
                    "10km",
                    "5km"
                ],
                "includes": [
                    "เสื้อวิ่ง",
                    "เหรียญรางวัล",
                    "อาหารเสริม",
                    "ประกันอุบัติเหตุ"
                ]
            },
            {
                "id": "evt_006",
                "title": "Thai Cultural Heritage Festival",
                "description": "เทศกาลมรดกวัฒนธรรมไทย แสดงศิลปะและวัฒนธรรมท้องถิ่น",
                "category": "cultural",
                "type": "festival",
                "status": "active",
                "featured": false,
                "organizer": {
                    "name": "Ministry of Culture",
                    "contact": "cultural@culture.go.th",
                    "phone": "+66-2-ccc-cccc"
                },
                "schedule": {
                    "startDate": "2025-12-05",
                    "endDate": "2025-12-08",
                    "startTime": "10:00",
                    "endTime": "20:00",
                    "timezone": "Asia/Bangkok"
                },
                "location": {
                    "type": "onsite",
                    "venue": "Wat Phra Kaew",
                    "address": "Na Phra Lan Rd, Phra Borom Maha Ratchawang, Phra Nakhon, Bangkok 10200",
                    "coordinates": {
                        "lat": 13.7515,
                        "lng": 100.4925
                    }
                },
                "pricing": {
                    "currency": "THB",
                    "adult": 200,
                    "child": 100,
                    "senior": 150,
                    "free": 0
                },
                "capacity": {
                    "max": 5000,
                    "registered": 2341,
                    "available": 2659
                },
                "images": {
                    "banner": "https://example.com/images/cultural-festival-banner.jpg",
                    "thumbnail": "https://example.com/images/cultural-festival-thumb.jpg",
                    "gallery": [
                        "https://example.com/images/cultural-1.jpg",
                        "https://example.com/images/cultural-2.jpg",
                        "https://example.com/images/cultural-3.jpg",
                        "https://example.com/images/cultural-4.jpg"
                    ]
                },
                "tags": [
                    "culture",
                    "heritage",
                    "traditional",
                    "thai"
                ],
                "activities": [
                    "การแสดงรำไทย",
                    "นิทรรศการศิลปกรรม",
                    "การสาธิตงานหัตถกรรม",
                    "อาหารพื้นเมือง"
                ]
            }
        ],
        "metadata": {
            "pagination": {
                "currentPage": 1,
                "totalPages": 7,
                "itemsPerPage": 6,
                "totalItems": 42
            },
            "filters": {
                "categories": [
                    "workshop",
                    "conference",
                    "networking",
                    "entertainment",
                    "sports",
                    "cultural"
                ],
                "priceRanges": [
                    {
                        "min": 0,
                        "max": 1000
                    },
                    {
                        "min": 1001,
                        "max": 3000
                    },
                    {
                        "min": 3001,
                        "max": 6000
                    },
                    {
                        "min": 6001,
                        "max": 15000
                    },
                    {
                        "min": 15001,
                        "max": null
                    }
                ],
                "locations": [
                    "onsite",
                    "online",
                    "hybrid"
                ],
                "dateRanges": [
                    "today",
                    "week",
                    "month",
                    "quarter",
                    "year"
                ]
            },
            "searchableFields": [
                "title",
                "description",
                "tags",
                "organizer.name",
                "location.venue"
            ],
            "sortOptions": [
                {
                    "field": "schedule.startDate",
                    "order": "asc",
                    "label": "วันที่ (เร็วสุด)"
                },
                {
                    "field": "schedule.startDate",
                    "order": "desc",
                    "label": "วันที่ (ล่าสุด)"
                },
                {
                    "field": "pricing.regular",
                    "order": "asc",
                    "label": "ราคา (ต่ำสุด)"
                },
                {
                    "field": "pricing.regular",
                    "order": "desc",
                    "label": "ราคา (สูงสุด)"
                },
                {
                    "field": "capacity.registered",
                    "order": "desc",
                    "label": "ความนิยม"
                }
            ]
        }
    }
}


ip endpoint
54.169.154.143:3497

-อีเว้นท์ (Event)
GET
/events
GET
/events/{id}
POST
/events
PUT
/events/{id}
DELETE
/events/{id}

-ตั๋ว (Ticket)
GET
/event-tickets
GET
/event-tickets/{id}
POST
/event-tickets
PUT
/event-tickets/{id}
DELETE
/event-tickets/{id}

