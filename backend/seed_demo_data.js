/*
 * TEST SYSTEM JPS - idempotent demo seed
 *
 * Adds demo records to the existing application's MongoDB collections without
 * deleting or replacing real business records. Run from backend/ with:
 *   MONGODB_URI='...' MONGODB_DB='test_system_jps' npm run seed:demo
 *
 * Default demo credentials (created only if missing): admin / admim.admim, test / test.
 * To explicitly reset these two demo account passwords, set SEED_RESET_DEMO_PASSWORDS=true.
 * Change default credentials before production use.
 */
const crypto = require('crypto');
const { promisify } = require('util');
const { MongoClient, ObjectId } = require('mongodb');
const config = require('./config');
const scrypt = promisify(crypto.scrypt);

const now = new Date();
const nowIso = now.toISOString();
const date = now.toISOString().slice(0, 10);
const month = date.slice(0, 7);
const RESET_PASSWORDS = process.env.SEED_RESET_DEMO_PASSWORDS === 'true';

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  return scrypt(password, salt, 64).then((hash) => `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`);
}
function daysAgo(days) {
  const d = new Date(now.getTime() - days * 86400000);
  return d.toISOString().slice(0, 10);
}
function moneySatang(baht) { return Math.round(Number(baht || 0) * 100); }
function idText(id) { return String(id); }

async function upsertDemo(db, collectionName, demoKey, doc) {
  const collection = db.collection(collectionName);
  const insertDoc = { ...doc, demo_key: demoKey, created_at: doc.created_at || nowIso };
  delete insertDoc.updated_at; // Avoid MongoDB update-path conflicts with $set.
  const result = await collection.updateOne(
    { demo_key: demoKey },
    { $setOnInsert: insertDoc, $set: { updated_at: nowIso } },
    { upsert: true },
  );
  const found = await collection.findOne({ demo_key: demoKey });
  return { doc: found, inserted: result.upsertedCount === 1 };
}

async function main() {
  if (!config.mongodb.uri) throw new Error('กรุณาตั้งค่า MONGODB_URI ก่อนรัน seed:demo');
  const client = new MongoClient(config.mongodb.uri, { serverSelectionTimeoutMS: 15000, maxPoolSize: 5 });
  await client.connect();
  try {
    const db = client.db(config.mongodb.db || 'test_system_jps');
    await db.command({ ping: 1 });
    console.log(`Connected to MongoDB database: ${db.databaseName}`);

    // Keep an existing active branch if one is already configured.
    let branch = await db.collection('branches').findOne({ is_active: { $ne: 0 } }, { sort: { is_default: -1, created_at: 1 } });
    if (!branch) {
      const result = await db.collection('branches').insertOne({ code: 'HQ', name: 'สำนักงานใหญ่ JPS (ตัวอย่าง)', address: '', phone: '', is_default: 1, is_active: 1, created_at: nowIso, updated_at: nowIso, demo_key: 'jps-demo-branch' });
      branch = await db.collection('branches').findOne({ _id: result.insertedId });
    }
    const branchId = idText(branch._id);
    const branchFields = { branch_id: branchId, branch_code: branch.code || 'HQ', branch_name: branch.name || 'สำนักงานใหญ่' };

    const accountSpecs = [
      { username: 'admin', name: 'ผู้ดูแลระบบ JPS (ตัวอย่าง)', role: 'owner', password: process.env.SEED_ADMIN_PASSWORD || 'admim.admim' },
      { username: 'test', name: 'ผู้บันทึกข้อมูล (ตัวอย่าง)', role: 'employee', password: process.env.SEED_USER_PASSWORD || 'test' },
    ];
    const accounts = {};
    for (const account of accountSpecs) {
      let user = await db.collection('users').findOne({ username: account.username });
      if (!user) {
        const password_hash = await hashPassword(account.password);
        const result = await db.collection('users').insertOne({ ...branchFields, username: account.username, name: account.name, role: account.role, phone: '', password_hash, auth_version: 1, is_active: 1, created_at: nowIso, updated_at: nowIso, demo_key: `jps-demo-user-${account.username}` });
        user = await db.collection('users').findOne({ _id: result.insertedId });
        console.log(`Created login: ${account.username} (${account.role === 'owner' ? 'Admin' : 'User'})`);
      } else if (RESET_PASSWORDS) {
        await db.collection('users').updateOne({ _id: user._id }, { $set: { password_hash: await hashPassword(account.password), auth_version: Number(user.auth_version || 0) + 1, updated_at: nowIso } });
        user = await db.collection('users').findOne({ _id: user._id });
        console.log(`Reset demo login password: ${account.username}`);
      } else {
        console.log(`Kept existing account unchanged: ${account.username}`);
      }
      accounts[account.username] = user;
    }
    const adminId = idText(accounts.admin._id);
    const userId = idText(accounts.test._id);

    // Demo fleet. Use clearly labelled demo plates to avoid overwriting real vehicles.
    const vehicleSpecs = [
      { demo_key: 'jps-demo-vehicle-1', plate_no: 'JPS-DEMO-01', vehicle_no: 'รถตัวอย่าง 01', driver_name: 'สมชาย ใจดี', fuel_efficiency_km_per_liter: 3.8, description: 'รถบรรทุกตัวอย่างสำหรับทดลองระบบ' },
      { demo_key: 'jps-demo-vehicle-2', plate_no: 'JPS-DEMO-02', vehicle_no: 'รถตัวอย่าง 02', driver_name: 'วิชัย ขยันงาน', fuel_efficiency_km_per_liter: 4.0, description: 'รถบรรทุกตัวอย่างสำหรับทดลองระบบ' },
    ];
    const vehicles = [];
    for (const spec of vehicleSpecs) {
      let vehicle = await db.collection('vehicles').findOne({ demo_key: spec.demo_key });
      if (!vehicle) {
        const byPlate = await db.collection('vehicles').findOne({ branch_id: branchId, plate_no: spec.plate_no, is_active: { $ne: 0 } });
        if (byPlate) vehicle = byPlate;
        else {
          const result = await db.collection('vehicles').insertOne({ ...branchFields, ...spec, user_id: userId, is_active: 1, created_at: nowIso, updated_at: nowIso });
          vehicle = await db.collection('vehicles').findOne({ _id: result.insertedId });
        }
      }
      vehicles.push(vehicle);
    }
    const vehicle1 = vehicles[0];
    const vehicle2 = vehicles[1];

    // Inventory records use the same item names as the current UI.
    const stockSpecs = [
      { item_type: 'ดีเซล', tank_name: 'ถังดีเซลหลัก', capacity_liters: 1000, balance_liters: 780, reorder_level_liters: 300, critical_level_liters: 100 },
      { item_type: 'น้ำมันเครื่อง', tank_name: 'คลังน้ำมันเครื่อง', capacity_liters: 200, balance_liters: 120, reorder_level_liters: 60, critical_level_liters: 20 },
      { item_type: 'แอดบลู', tank_name: 'ถังแอดบลู', capacity_liters: 500, balance_liters: 350, reorder_level_liters: 150, critical_level_liters: 50 },
    ];
    for (const spec of stockSpecs) {
      await db.collection('stocks').updateOne(
        { branch_id: branchId, item_type: spec.item_type },
        { $setOnInsert: { ...branchFields, ...spec, last_alert_status: 'ready', created_at: nowIso }, $set: { updated_at: nowIso } },
        { upsert: true },
      );
    }
    for (const name of ['หิน', 'ทราย', 'ทรายหยาบ', 'ทรายถม']) {
      await upsertDemo(db, 'transport_materials', `jps-demo-material-${name}`, { ...branchFields, name, is_active: 1, created_at: nowIso });
    }

    // Store a tiny demo SVG inside MongoDB to prove the app's database-backed file route works.
    const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600"><rect width="900" height="600" rx="28" fill="#f0f7ff"/><rect x="24" y="24" width="852" height="552" rx="22" fill="#ffffff" stroke="#2450a4" stroke-width="5"/><text x="60" y="110" font-family="Arial,sans-serif" font-size="42" font-weight="700" fill="#2450a4">JPS · TEST SYSTEM</text><text x="60" y="185" font-family="Arial,sans-serif" font-size="30" fill="#243247">DEMO ATTACHMENT — NOT A REAL RECEIPT</text><line x1="60" y1="230" x2="840" y2="230" stroke="#d5e4f8" stroke-width="4"/><text x="60" y="300" font-family="Arial,sans-serif" font-size="26" fill="#243247">ตัวอย่างไฟล์แนบบิล / ใช้ทดสอบระบบเท่านั้น</text><text x="60" y="355" font-family="Arial,sans-serif" font-size="23" fill="#61758f">Replace this demo file with a real bill photo from the app.</text><text x="60" y="510" font-family="Arial,sans-serif" font-size="24" fill="#2450a4">Blue &amp; White · Transport Management</text></svg>`);
    let attachment = await db.collection('uploaded_files').findOne({ demo_key: 'jps-demo-attachment' });
    if (!attachment) {
      const result = await db.collection('uploaded_files').insertOne({ demo_key: 'jps-demo-attachment', filename: 'jps-demo-bill.svg', stored_filename: 'jps-demo-bill.svg', content_type: 'image/svg+xml', size_bytes: svg.length, data: svg, created_at: nowIso });
      attachment = await db.collection('uploaded_files').findOne({ _id: result.insertedId });
    }
    const attachmentUrl = `/uploads/db/${idText(attachment._id)}`;

    // Four jobs per billing cycle, followed by a diesel fill-up record.
    const tripSpecs = [
      { n: 1, material: 'หิน', origin: 'โรงโม่พฤฒิพง', destination: 'หน้างาน นาสนุ่น', distance: 145, loading: 17400, unloading: 49920, income: 5440, driverFee: 700 },
      { n: 2, material: 'ทราย', origin: 'ท่าทรายพีเอ็น', destination: 'หน้างาน นาสนุ่น', distance: 170, loading: 17530, unloading: 49530, income: 5440, driverFee: 700 },
      { n: 3, material: 'ทราย', origin: 'ท่าทรายพีเอ็น', destination: 'หน้างาน นาสนุ่น', distance: 170, loading: 17450, unloading: 49900, income: 5440, driverFee: 700 },
      { n: 4, material: 'ทราย', origin: 'ท่าทรายพีเอ็น', destination: 'ร้านวัชรขจร', distance: 155, loading: 17450, unloading: 49900, income: 5100, driverFee: 650 },
    ];
    const deliveryDocs = [];
    for (const trip of tripSpecs) {
      const demoKey = `jps-demo-delivery-${date}-trip-${trip.n}`;
      const existing = await db.collection('deliveries').findOne({ demo_key: demoKey });
      if (existing) { deliveryDocs.push(existing); continue; }
      const jobId = `demo-job-${trip.n}`;
      const doc = {
        ...branchFields, demo_key: demoKey, user_id: userId, vehicle_id: idText(vehicle1._id), plate_no: vehicle1.plate_no,
        driver_name: vehicle1.driver_name, driver_name_input: vehicle1.driver_name,
        work_date: date, fill_date: date, fill_time: '17:30', report_month: month,
        operation_type: 'งานขนส่ง', item_type: 'ดีเซล', oil_type: 'ดีเซล',
        bill_no: `DEMO-${date.replace(/-/g, '')}-${String(trip.n).padStart(2, '0')}`,
        work_bill_no: `DEMO-${date.replace(/-/g, '')}-${String(trip.n).padStart(2, '0')}`,
        origin_place: trip.origin, destination_place: trip.destination, cargo_name: trip.material,
        loading_weight_kg: trip.loading, unloading_weight_kg: trip.unloading,
        distance_km: trip.distance, quantity_liters: 0, actual_filled_liters: 0, standard_fuel_liters: 0,
        expected_fuel_efficiency_km_per_liter: Number(vehicle1.fuel_efficiency_km_per_liter || 3.8),
        trip_fee_baht: trip.income, allowance_baht: 0, other_income_baht: 0,
        jobs: [{ id: jobId, load_date: date, unload_date: date, origin_place: trip.origin, destination_place: trip.destination, cargo_name: trip.material, loading_weight_kg: trip.loading, unloading_weight_kg: trip.unloading, distance_km: trip.distance, trip_fee_baht: trip.income, allowance_baht: 0, other_income_baht: 0, driver_fee_baht: trip.driverFee, reference: `DEMO-TRIP-${trip.n}` }],
        bill_photo: attachmentUrl, bill_photos: [attachmentUrl], document_photo: attachmentUrl, document_photos: [attachmentUrl],
        created_at: nowIso, updated_at: nowIso, stock_synced: true, is_demo: true,
      };
      const result = await db.collection('deliveries').insertOne(doc);
      deliveryDocs.push(await db.collection('deliveries').findOne({ _id: result.insertedId }));
    }

    // One refuelling record after the four demo runs.
    const fuelKey = `jps-demo-delivery-${date}-fuel`;
    if (!(await db.collection('deliveries').findOne({ demo_key: fuelKey }))) {
      await db.collection('deliveries').insertOne({
        ...branchFields, demo_key: fuelKey, is_demo: true, user_id: userId, vehicle_id: idText(vehicle1._id), plate_no: vehicle1.plate_no,
        driver_name: vehicle1.driver_name, work_date: date, fill_date: date, fill_time: '18:00', report_month: month,
        operation_type: 'เติมน้ำมัน', item_type: 'ดีเซล', oil_type: 'ดีเซล', bill_no: 'DEMO-FUEL-001', oil_bill_no: 'DEMO-FUEL-001',
        origin_place: 'ปั๊มน้ำมันตัวอย่าง', destination_place: 'สำนักงานใหญ่', quantity_liters: 165.74, actual_filled_liters: 165.74,
        station_liters: 165.74, price_baht_per_liter: 41.05, amount_baht: 6803.12, distance_km: 640,
        expected_fuel_efficiency_km_per_liter: Number(vehicle1.fuel_efficiency_km_per_liter || 3.8),
        bill_photo: attachmentUrl, bill_photos: [attachmentUrl], oil_photo: attachmentUrl, oil_photos: [attachmentUrl],
        jobs: [], created_at: nowIso, updated_at: nowIso, stock_synced: false,
      });
    }

    // Driver earnings, advances, and company trip-finance records; amounts are demo-only.
    for (let i = 0; i < deliveryDocs.length; i++) {
      const delivery = deliveryDocs[i];
      const trip = tripSpecs[i];
      const job = (delivery.jobs || [])[0] || {};
      await upsertDemo(db, 'driver_trips', `jps-demo-driver-trip-${date}-${trip.n}`, {
        ...branchFields, date, vehicle_id: idText(vehicle1._id), plate_no: vehicle1.plate_no, driver_name: vehicle1.driver_name,
        material: trip.material, quantity: `${(trip.unloading / 1000).toFixed(2)} ตัน`, origin_place: trip.origin, destination_place: trip.destination,
        reference: `DEMO-TRIP-${trip.n}`, note: 'ข้อมูลตัวอย่างสำหรับทดสอบเท่านั้น', income_satang: moneySatang(trip.driverFee),
        source_type: 'delivery', source_delivery_id: idText(delivery._id), source_job_id: job.id || `demo-job-${trip.n}`, created_by: adminId, created_at: nowIso,
      });
      await upsertDemo(db, 'trip_finance', `jps-demo-trip-finance-${date}-${trip.n}`, {
        ...branchFields, date, vehicle_id: idText(vehicle1._id), plate_no: vehicle1.plate_no, material: trip.material,
        quantity: `${(trip.unloading / 1000).toFixed(2)} ตัน`, origin_place: trip.origin, destination_place: trip.destination,
        reference: `DEMO-TRIP-${trip.n}`, note: 'รายรับตัวอย่าง ไม่ใช่ยอดบัญชีจริง', income_satang: moneySatang(trip.income),
        fuel_cost_satang: moneySatang(1200), driver_cost_satang: moneySatang(trip.driverFee), toll_cost_satang: 0, other_cost_satang: 0,
        expense_satang: moneySatang(1200 + trip.driverFee), profit_satang: moneySatang(trip.income - 1200 - trip.driverFee), created_by: adminId, created_at: nowIso,
      });
      await upsertDemo(db, 'transport_ledger', `jps-demo-ledger-income-${date}-${trip.n}`, {
        ...branchFields, date, vehicle_id: idText(vehicle1._id), plate_no: vehicle1.plate_no, type: 'income', category: 'ค่าขนส่ง',
        amount_satang: moneySatang(trip.income), material: trip.material, quantity: `${(trip.unloading / 1000).toFixed(2)} ตัน`, note: 'รายรับตัวอย่าง',
        excluded_from_totals: false, updated_by: adminId, created_at: nowIso,
      });
    }
    await upsertDemo(db, 'driver_advances', `jps-demo-driver-advance-${date}`, {
      ...branchFields, date, vehicle_id: idText(vehicle1._id), plate_no: vehicle1.plate_no, driver_name: vehicle1.driver_name,
      amount_satang: moneySatang(1000), note: 'เงินเบิกล่วงหน้าตัวอย่าง', updated_by: adminId, created_by: adminId, created_at: nowIso,
    });
    await upsertDemo(db, 'transport_ledger', `jps-demo-ledger-expense-${date}`, {
      ...branchFields, date, vehicle_id: idText(vehicle1._id), plate_no: vehicle1.plate_no, type: 'expense', category: 'น้ำมัน',
      amount_satang: moneySatang(6803.12), material: '', quantity: '', note: 'บิลเติมน้ำมันตัวอย่างหลังวิ่งครบ 4 เที่ยว',
      excluded_from_totals: false, updated_by: adminId, created_at: nowIso,
    });

    // Stock movement/audit examples are separated by demo_key so reruns do not duplicate them.
    await upsertDemo(db, 'stock_movements', `jps-demo-stock-movement-${date}`, {
      ...branchFields, item_type: 'ดีเซล', transaction_type: 'เติมเข้าสต๊อก', quantity_liters: 500, change_liters: 500, amount_baht: 20525, bill_no: 'DEMO-STOCK-IN-001', supplier_name: 'ผู้จำหน่ายตัวอย่าง', photo: attachmentUrl,
      note: 'รับเข้าตัวอย่างสำหรับทดสอบ', user_id: adminId, transaction_date: date, created_at: nowIso,
    });
    await upsertDemo(db, 'stock_transactions', `jps-demo-stock-transaction-${date}`, {
      ...branchFields, item_type: 'ดีเซล', transaction_type: 'เติมเข้าสต๊อก', quantity_liters: 500, change_liters: 500, amount_baht: 20525, bill_no: 'DEMO-STOCK-IN-001', supplier_name: 'ผู้จำหน่ายตัวอย่าง', photo: attachmentUrl,
      note: 'รับเข้าตัวอย่างสำหรับทดสอบ', user_id: adminId, transaction_date: date, created_at: nowIso,
    });
    await upsertDemo(db, 'stock_audits', `jps-demo-stock-audit-${date}`, {
      ...branchFields, item_type: 'ดีเซล', audit_date: date, system_balance_liters: 780, actual_balance_liters: 780, variance_liters: 0,
      note: 'ตรวจนับตัวอย่าง', user_id: adminId, created_at: nowIso,
    });
    await upsertDemo(db, 'notifications', `jps-demo-notification-${date}`, {
      ...branchFields, kind: 'info', title: 'ยินดีต้อนรับสู่ TEST SYSTEM JPS', message: 'ข้อมูลที่มีคำว่า DEMO เป็นข้อมูลตัวอย่าง กรุณาแทนที่ก่อนใช้ทำบัญชีจริง',
      is_read: 0, created_at: nowIso, updated_at: nowIso,
    });
    await upsertDemo(db, 'system_settings', 'jps-demo-system-settings', {
      key: 'jps_demo_seed_version', value: '1', label: 'Demo seed version', created_at: nowIso,
    });

    const reportCollections = ['branches','users','vehicles','stocks','transport_materials','deliveries','driver_trips','driver_advances','trip_finance','transport_ledger','stock_movements','stock_transactions','stock_audits','notifications','uploaded_files'];
    const counts = {};
    for (const name of reportCollections) counts[name] = await db.collection(name).countDocuments({});
    console.log('\nSeed complete. Collections currently contain:');
    for (const [name, count] of Object.entries(counts)) console.log(`  ${name}: ${count}`);
    console.log(`\nDemo attachment: ${attachmentUrl}`);
    console.log('Demo records are marked with demo_key or is_demo. They are sample data, not real accounting records.');
    console.log('If admin/test accounts already existed, their passwords were not changed unless SEED_RESET_DEMO_PASSWORDS=true.');
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error('Seed failed:', error.message || error);
  process.exitCode = 1;
});
