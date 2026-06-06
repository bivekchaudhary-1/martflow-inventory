// Mock data — field names match the Supabase schema exactly.
// unit_price (not price), location_id (FK int), min_stock, sku, etc.

export const mockCategories = [
  { id: 1, name: 'Electronics',     description: 'Electronic devices and components', color: '#6366f1', icon: 'cpu' },
  { id: 2, name: 'Office Supplies', description: 'Stationery and office equipment',   color: '#10b981', icon: 'pencil' },
  { id: 3, name: 'Furniture',       description: 'Desks, chairs, and storage',        color: '#f59e0b', icon: 'armchair' },
  { id: 4, name: 'Networking',      description: 'Cables, switches, and routers',     color: '#3b82f6', icon: 'wifi' },
  { id: 5, name: 'Peripherals',     description: 'Keyboards, mice, monitors',         color: '#ec4899', icon: 'monitor' },
];

export const mockLocations = [
  { id: 1,  name: 'Warehouse A', type: 'warehouse', capacity: 5000, description: 'Main storage warehouse',  is_active: true },
  { id: 2,  name: 'Warehouse B', type: 'warehouse', capacity: 3000, description: 'Secondary warehouse',     is_active: true },
  { id: 3,  name: 'Shelf A-1',   type: 'shelf',     capacity: 200,  description: 'Small electronics',       is_active: true },
  { id: 4,  name: 'Shelf A-2',   type: 'shelf',     capacity: 200,  description: 'Computers & SBCs',        is_active: true },
  { id: 5,  name: 'Shelf A-3',   type: 'shelf',     capacity: 300,  description: 'Cables & networking',     is_active: true },
  { id: 6,  name: 'Shelf B-1',   type: 'shelf',     capacity: 400,  description: 'Paper & consumables',     is_active: true },
  { id: 7,  name: 'Shelf B-2',   type: 'shelf',     capacity: 200,  description: 'Stationery',              is_active: true },
  { id: 8,  name: 'Shelf B-3',   type: 'shelf',     capacity: 300,  description: 'Power & accessories',     is_active: true },
  { id: 9,  name: 'Shelf C-1',   type: 'shelf',     capacity: 150,  description: 'AV & cameras',            is_active: true },
  { id: 10, name: 'Shelf C-2',   type: 'shelf',     capacity: 250,  description: 'Peripherals',             is_active: true },
];

// Items match the schema: unit_price, location_id (int FK), min_stock, sku.
// Also include denormalized _name fields that v_items view adds (category_name, location_name, supplier_name).
export const mockItems = [
  { id:1,  name:'MacBook Pro 14"',      sku:'SKU-001', category_id:1, location_id:1,  supplier_id:1, stock_count:12,  min_stock:5,  unit_price:1999.99, cost_price:1600.00, velocity_status:'fast',   unit:'pcs', is_active:true, category_name:'Electronics',     location_name:'Warehouse A', supplier_name:'Apple Distribution Ltd.' },
  { id:2,  name:'Dell Monitor 27"',     sku:'SKU-002', category_id:5, location_id:2,  supplier_id:2, stock_count:8,   min_stock:5,  unit_price:349.99,  cost_price:280.00,  velocity_status:'medium', unit:'pcs', is_active:true, category_name:'Peripherals',     location_name:'Warehouse B', supplier_name:'Dell Technologies' },
  { id:3,  name:'Logitech MX Keys',     sku:'SKU-003', category_id:5, location_id:10, supplier_id:3, stock_count:25,  min_stock:10, unit_price:99.99,   cost_price:70.00,   velocity_status:'fast',   unit:'pcs', is_active:true, category_name:'Peripherals',     location_name:'Shelf C-2',   supplier_name:'Logitech B2B' },
  { id:4,  name:'Ergonomic Chair',      sku:'SKU-004', category_id:3, location_id:1,  supplier_id:4, stock_count:5,   min_stock:3,  unit_price:499.99,  cost_price:350.00,  velocity_status:'slow',   unit:'pcs', is_active:true, category_name:'Furniture',       location_name:'Warehouse A', supplier_name:'IKEA Business' },
  { id:5,  name:'Standing Desk',        sku:'SKU-005', category_id:3, location_id:1,  supplier_id:4, stock_count:3,   min_stock:2,  unit_price:799.99,  cost_price:600.00,  velocity_status:'slow',   unit:'pcs', is_active:true, category_name:'Furniture',       location_name:'Warehouse A', supplier_name:'IKEA Business' },
  { id:6,  name:'USB-C Hub 7-in-1',     sku:'SKU-006', category_id:4, location_id:3,  supplier_id:1, stock_count:40,  min_stock:15, unit_price:49.99,   cost_price:25.00,   velocity_status:'fast',   unit:'pcs', is_active:true, category_name:'Networking',      location_name:'Shelf A-1',   supplier_name:'Apple Distribution Ltd.' },
  { id:7,  name:'Ethernet Cable 10m',   sku:'SKU-007', category_id:4, location_id:5,  supplier_id:5, stock_count:60,  min_stock:20, unit_price:12.99,   cost_price:5.00,    velocity_status:'medium', unit:'pcs', is_active:true, category_name:'Networking',      location_name:'Shelf A-3',   supplier_name:'Cisco Systems' },
  { id:8,  name:'A4 Paper Ream',        sku:'SKU-008', category_id:2, location_id:6,  supplier_id:6, stock_count:200, min_stock:50, unit_price:8.99,    cost_price:5.00,    velocity_status:'fast',   unit:'ream',is_active:true, category_name:'Office Supplies', location_name:'Shelf B-1',   supplier_name:'Officeworks Trade' },
  { id:9,  name:'Whiteboard Markers',   sku:'SKU-009', category_id:2, location_id:7,  supplier_id:6, stock_count:7,   min_stock:10, unit_price:5.99,    cost_price:2.50,    velocity_status:'medium', unit:'set', is_active:true, category_name:'Office Supplies', location_name:'Shelf B-2',   supplier_name:'Officeworks Trade' },
  { id:10, name:'Cisco Switch 24-port', sku:'SKU-010', category_id:4, location_id:2,  supplier_id:5, stock_count:4,   min_stock:2,  unit_price:899.99,  cost_price:700.00,  velocity_status:'slow',   unit:'pcs', is_active:true, category_name:'Networking',      location_name:'Warehouse B', supplier_name:'Cisco Systems' },
  { id:11, name:'iPad Pro 12.9"',       sku:'SKU-011', category_id:1, location_id:1,  supplier_id:1, stock_count:9,   min_stock:5,  unit_price:1099.99, cost_price:850.00,  velocity_status:'medium', unit:'pcs', is_active:true, category_name:'Electronics',     location_name:'Warehouse A', supplier_name:'Apple Distribution Ltd.' },
  { id:12, name:'Webcam 4K',            sku:'SKU-012', category_id:5, location_id:9,  supplier_id:2, stock_count:15,  min_stock:8,  unit_price:149.99,  cost_price:95.00,   velocity_status:'fast',   unit:'pcs', is_active:true, category_name:'Peripherals',     location_name:'Shelf C-1',   supplier_name:'Dell Technologies' },
  { id:13, name:'Wireless Mouse',       sku:'SKU-013', category_id:5, location_id:10, supplier_id:3, stock_count:30,  min_stock:10, unit_price:39.99,   cost_price:18.00,   velocity_status:'fast',   unit:'pcs', is_active:true, category_name:'Peripherals',     location_name:'Shelf C-2',   supplier_name:'Logitech B2B' },
  { id:14, name:'Filing Cabinet',       sku:'SKU-014', category_id:3, location_id:2,  supplier_id:4, stock_count:6,   min_stock:3,  unit_price:249.99,  cost_price:180.00,  velocity_status:'slow',   unit:'pcs', is_active:true, category_name:'Furniture',       location_name:'Warehouse B', supplier_name:'IKEA Business' },
  { id:15, name:'Raspberry Pi 4',       sku:'SKU-015', category_id:1, location_id:4,  supplier_id:7, stock_count:2,   min_stock:5,  unit_price:75.00,   cost_price:52.00,   velocity_status:'medium', unit:'pcs', is_active:true, category_name:'Electronics',     location_name:'Shelf A-2',   supplier_name:'Raspberry Pi Foundation' },
  { id:16, name:'HDMI Cable 2m',        sku:'SKU-016', category_id:4, location_id:5,  supplier_id:2, stock_count:55,  min_stock:20, unit_price:9.99,    cost_price:3.50,    velocity_status:'fast',   unit:'pcs', is_active:true, category_name:'Networking',      location_name:'Shelf A-3',   supplier_name:'Dell Technologies' },
  { id:17, name:'Stapler Heavy Duty',   sku:'SKU-017', category_id:2, location_id:7,  supplier_id:6, stock_count:18,  min_stock:5,  unit_price:24.99,   cost_price:12.00,   velocity_status:'slow',   unit:'pcs', is_active:true, category_name:'Office Supplies', location_name:'Shelf B-2',   supplier_name:'Officeworks Trade' },
  { id:18, name:'Laptop Stand',         sku:'SKU-018', category_id:5, location_id:9,  supplier_id:3, stock_count:22,  min_stock:10, unit_price:59.99,   cost_price:32.00,   velocity_status:'medium', unit:'pcs', is_active:true, category_name:'Peripherals',     location_name:'Shelf C-1',   supplier_name:'Logitech B2B' },
  { id:19, name:'External SSD 1TB',     sku:'SKU-019', category_id:1, location_id:4,  supplier_id:8, stock_count:11,  min_stock:5,  unit_price:129.99,  cost_price:85.00,   velocity_status:'fast',   unit:'pcs', is_active:true, category_name:'Electronics',     location_name:'Shelf A-2',   supplier_name:'Samsung Electronics' },
  { id:20, name:'Power Strip 6-outlet', sku:'SKU-020', category_id:4, location_id:8,  supplier_id:2, stock_count:35,  min_stock:10, unit_price:29.99,   cost_price:14.00,   velocity_status:'medium', unit:'pcs', is_active:true, category_name:'Networking',      location_name:'Shelf B-3',   supplier_name:'Dell Technologies' },
];
