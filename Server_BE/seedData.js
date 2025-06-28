const { sequelize } = require('./config/database');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Customer = require('./models/Customer');
const Order = require('./models/Order');

const seedData = async () => {
  try {
    // Đồng bộ database (không force để giữ dữ liệu nếu đã có)
    await sequelize.sync();
    console.log('Database synchronized successfully.');

    // Thêm dữ liệu mẫu cho Category
    await Category.bulkCreate([
      { nhp_name: 'Clothing' },
      { nhp_name: 'Accessories' },
    ]);
    console.log('Categories seeded successfully.');

    // Thêm dữ liệu mẫu cho Product
    await Product.bulkCreate([
      { nhp_name: 'T-Shirt', nhp_price: 200000, nhp_stock: 50, nhp_description: 'Cotton T-Shirt', nhp_categoryId: 1 },
      { nhp_name: 'Hat', nhp_price: 150000, nhp_stock: 30, nhp_description: 'Stylish Hat', nhp_categoryId: 2 },
    ]);
    console.log('Products seeded successfully.');

    // Thêm dữ liệu mẫu cho Customer
    await Customer.bulkCreate([
      { nhp_name: 'John Doe', nhp_email: 'john@example.com', nhp_phone: '0123456789', nhp_address: '123 Street, City' },
      { nhp_name: 'Jane Smith', nhp_email: 'jane@example.com', nhp_phone: '0987654321', nhp_address: '456 Avenue, City' },
    ]);
    console.log('Customers seeded successfully.');

    // Thêm dữ liệu mẫu cho Order
    await Order.bulkCreate([
      { nhp_customerId: 1, nhp_productId: 1, nhp_quantity: 2, nhp_totalPrice: 400000, nhp_status: 'Pending' },
      { nhp_customerId: 2, nhp_productId: 2, nhp_quantity: 1, nhp_totalPrice: 150000, nhp_status: 'Shipped' },
    ]);
    console.log('Orders seeded successfully.');

    console.log('Data seeding completed.');
  } catch (error) {
    console.error('Error seeding data:', error.message);
  } finally {
    await sequelize.close();
  }
};

seedData();