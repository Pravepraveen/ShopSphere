-- Alter orders table to include courier shipment and delivery tracking details
ALTER TABLE orders ADD COLUMN carrier VARCHAR(100) NULL;
ALTER TABLE orders ADD COLUMN tracking_number VARCHAR(100) NULL;
ALTER TABLE orders ADD COLUMN estimated_delivery VARCHAR(100) NULL;
ALTER TABLE orders ADD COLUMN shipping_notes TEXT NULL;

-- Insert additional premium products into catalogue
INSERT INTO products (sku, title, description, price, stock, image_url, category_id, active, version) VALUES
('DJI-MAV-3', 'DJI Mavic 3 Pro Cine Drone with Triple-Camera Hasselblad', '4/3 CMOS Hasselblad camera, dual tele cameras, 43-min flight time, omnidirectional obstacle sensing with 15km HD video transmission.', 289900.00, 6, 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80', 1, TRUE, 0),
('SONY-A7M4', 'Sony Alpha 7 IV Full-Frame Mirrorless Hybrid Camera (Body)', '33MP BSI CMOS full-frame sensor, up to 10 fps shooting, 4K 60p 10-bit video, real-time Eye AF for humans, animals and birds.', 209990.00, 10, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80', 1, TRUE, 0),
('DYSON-V15', 'Dyson V15 Detect Cordless Vacuum Cleaner with Laser', 'Laser reveals microscopic dust, piezo sensor measures dust particles, LCD screen shows real-time proof of a deep clean.', 62900.00, 15, 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80', 5, TRUE, 0),
('IPAD-PRO-M4', 'Apple iPad Pro 13\" (M4 Chip, OLED Ultra Retina XDR, 512GB)', 'Impossibly thin 5.1mm design, breakthrough Tandem OLED display, Next-gen M4 silicon with advanced Neural Engine for AI.', 149900.00, 14, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80', 3, TRUE, 0),
('SONOS-ERA300', 'Sonos Era 300 Spatial Audio Smart Speaker with Dolby Atmos', 'Six drivers positioned all around, revolutionary acoustics with Dolby Atmos Music, Trueplay tuning and Bluetooth/WiFi.', 54999.00, 20, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80', 2, TRUE, 0);

