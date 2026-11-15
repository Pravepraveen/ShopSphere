-- Seed Categories
INSERT INTO categories (id, name, slug, description, parent_id) VALUES
(1, 'Electronics', 'electronics', 'Consumer electronics and modern personal gadgets', NULL),
(2, 'Audio & Sound', 'audio-sound', 'Premium high-fidelity headphones, speakers and audio equipment', 1),
(3, 'Computers & Laptops', 'computers-laptops', 'High-performance laptops, workstations and computing accessories', 1),
(4, 'Wearables', 'wearables', 'Smart watches, fitness trackers and wearable tech', 1),
(5, 'Accessories', 'accessories', 'Cables, chargers, peripherals and workspace essentials', NULL);

-- Seed Products (16 realistic products with INR pricing)
INSERT INTO products (id, sku, title, description, price, stock, image_url, category_id, active, version) VALUES
(1, 'WH-1000XM5', 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones', 'Industry-leading noise cancellation with 8 microphones and Auto NC Optimizer. Up to 30 hours battery life with quick charging.', 26990.00, 1, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', 2, TRUE, 0),
(2, 'MBP-16-M3', 'Apple MacBook Pro 16\" (M3 Max, 36GB, 1TB SSD)', 'Supercharged by M3 Max with up to 16-core CPU and 40-core GPU. Liquid Retina XDR display with ProMotion 120Hz.', 249900.00, 15, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80', 3, TRUE, 0),
(3, 'LOGI-MX3S', 'Logitech MX Master 3S Wireless Performance Mouse', 'Quiet clicks with 8000 DPI track-on-glass sensor and MagSpeed electromagnetic scrolling wheel.', 8995.00, 50, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80', 5, TRUE, 0),
(4, 'KEY-K2-PRO', 'Keychron K2 Pro QMK/VIA Wireless Mechanical Keyboard', 'Compact 75% layout, hot-swappable mechanical switches, RGB backlighting and Bluetooth 5.1 multi-device connectivity.', 9499.00, 30, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80', 5, TRUE, 0),
(5, 'DELL-U2723', 'Dell UltraSharp 27\" 4K USB-C Hub Monitor (U2723QE)', 'IPS Black technology with 2000:1 contrast ratio, 4K UHD resolution, 90W USB-C Power Delivery and built-in RJ45 Ethernet.', 48500.00, 20, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80', 3, TRUE, 0),
(6, 'APPL-AW-S9', 'Apple Watch Series 9 GPS 45mm Starlight', 'Brighter Always-On display, S9 SiP with Double Tap gesture control, precision finding for iPhone and ECG health tracking.', 41900.00, 25, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80', 4, TRUE, 0),
(7, 'BOSE-QC45', 'Bose QuietComfort 45 Bluetooth Headphones', 'Iconic quiet, comfort, and sound. TriPort acoustic architecture and volume-optimized Active EQ.', 22900.00, 12, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80', 2, TRUE, 0),
(8, 'ANK-737-PB', 'Anker 737 Power Bank (PowerCore 24K, 140W)', 'Ultra-powerful two-way charging with Smart Digital Display, 24,000mAh capacity and Power Delivery 3.1.', 11999.00, 40, 'https://images.unsplash.com/photo-1609592424361-9c1737be7045?w=800&auto=format&fit=crop&q=80', 5, TRUE, 0),
(9, 'SAM-T7-2TB', 'Samsung T7 Shield 2TB Portable Rugged SSD', 'Rugged durability with IP65 dust and water resistance, up to 1050 MB/s transfer speeds over USB 3.2 Gen 2.', 15499.00, 35, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80', 5, TRUE, 0),
(10, 'APP-AIRPOD-2', 'Apple AirPods Pro (2nd Gen) with MagSafe Case (USB-C)', 'Up to 2x more Active Noise Cancellation, Adaptive Audio, Transparency mode, and Personalized Spatial Audio.', 24900.00, 18, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80', 2, TRUE, 0),
(11, 'ASUS-ROG-32', 'ASUS ROG Swift 32\" 4K QD-OLED Gaming Monitor (PG32UCDM)', 'Third-generation QD-OLED panel, 240Hz refresh rate, 0.03ms response time, custom heatsink design with graphene film.', 119990.00, 8, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80', 3, TRUE, 0),
(12, 'ELG-STRM-MK2', 'Elgato Stream Deck MK.2 – 15 LCD Studio Keys', 'Customizable LCD keys to control apps, tools, platforms, audio, lighting and studio production workflows.', 14200.00, 22, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80', 5, TRUE, 0),
(13, 'SHURE-SM7B', 'Shure SM7B Cardioid Dynamic Vocal Studio Microphone', 'Smooth, flat, wide-range frequency response suitable for music, speech, broadcasting and professional studio recording.', 38900.00, 14, 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80', 2, TRUE, 0),
(14, 'CALD-TS4-DK', 'CalDigit TS4 Thunderbolt 4 Docking Station (18 Ports)', '18 ports of extreme connectivity with 98W Power Delivery, 2.5Gb Ethernet, UHS-II SD cards and dual 6K display support.', 34500.00, 10, 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&auto=format&fit=crop&q=80', 3, TRUE, 0),
(15, 'BENQ-HALO-L', 'BenQ ScreenBar Halo Wireless Monitor Light Bar', 'Auto-dimming, rear ambient backlight, wireless rotary controller, and zero screen glare asymmetrical optical design.', 15990.00, 45, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80', 5, TRUE, 0),
(16, 'INACT-PROD', 'Vintage Cassette Tape Player (Archived Model)', 'Discontinued retro analog stereo tape player with auto-reverse playback.', 3999.00, 5, 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80', 2, FALSE, 0);

-- Seed Coupons
INSERT INTO coupons (id, code, discount_type, discount_value, min_order_value, usage_limit, times_used, expires_at, active, version) VALUES
(1, 'WELCOME10', 'PERCENTAGE', 10.00, 500.00, 1000, 0, '2030-12-31 23:59:59', TRUE, 0),
(2, 'FLAT50', 'FIXED', 500.00, 2000.00, 500, 0, '2030-12-31 23:59:59', TRUE, 0),
(3, 'FLASH1', 'PERCENTAGE', 50.00, 1000.00, 1, 0, '2030-12-31 23:59:59', TRUE, 0),
(4, 'EXPIRED20', 'PERCENTAGE', 20.00, 500.00, 100, 100, '2022-01-01 00:00:00', TRUE, 0),
(5, 'INACTIVE15', 'PERCENTAGE', 15.00, 500.00, 50, 0, '2030-12-31 23:59:59', FALSE, 0);
