import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, products, leads } from '@/db/schema';
import { eq, like, and, or, desc, gte, lte } from 'drizzle-orm';

// Helper to get userId from headers (for testing/demo)
function getUserId(request: NextRequest): string {
  return request.headers.get('x-user-id') || 'demo-user-1';
}

async function getCurrentUser(request: NextRequest) {
  const userId = getUserId(request);
  return { id: userId };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({
          error: "Valid ID is required",
          code: "INVALID_ID"
        }, { status: 400 });
      }

      const order = await db.select()
        .from(orders)
        .where(and(
          eq(orders.id, parseInt(id)),
          eq(orders.userId, user.id)
        ))
        .limit(1);

      if (order.length === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      return NextResponse.json(order[0]);
    }

    // List with filters and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const leadId = searchParams.get('leadId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let conditions = [eq(orders.userId, user.id)];

    // Search filter (removed productName since it's in orderItems now)
    if (search) {
      conditions.push(
        or(
          like(orders.customerName, `%${search}%`),
          like(orders.customerPhone, `%${search}%`),
          like(orders.invoiceNumber, `%${search}%`)
        )!
      );
    }

    // Status filter
    if (status) {
      conditions.push(eq(orders.status, status));
    }

    // LeadId filter
    if (leadId) {
      conditions.push(eq(orders.leadId, parseInt(leadId)));
    }

    // Date range filters
    if (startDate) {
      conditions.push(gte(orders.orderDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(orders.orderDate, endDate));
    }

    const results = await db.select()
      .from(orders)
      .where(and(...conditions))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);

  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED"
      }, { status: 400 });
    }

    const {
      items, // Array of { productId, quantity }
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      leadId,
      paymentMethod,
      orderDate,
      status: orderStatus
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        error: "At least one order item is required",
        code: "MISSING_ITEMS"
      }, { status: 400 });
    }

    if (!customerName || customerName.trim() === '') {
      return NextResponse.json({
        error: "Customer name is required",
        code: "MISSING_CUSTOMER_NAME"
      }, { status: 400 });
    }

    if (!customerPhone || customerPhone.trim() === '') {
      return NextResponse.json({
        error: "Customer phone is required",
        code: "MISSING_CUSTOMER_PHONE"
      }, { status: 400 });
    }

    // Validate and fetch all products
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.productId || !item.quantity) {
        return NextResponse.json({
          error: "Each item must have productId and quantity",
          code: "INVALID_ITEM"
        }, { status: 400 });
      }

      const product = await db.select()
        .from(products)
        .where(and(
          eq(products.id, parseInt(item.productId)),
          eq(products.userId, user.id)
        ))
        .limit(1);

      if (product.length === 0) {
        return NextResponse.json({
          error: `Product ${item.productId} not found`,
          code: "PRODUCT_NOT_FOUND"
        }, { status: 404 });
      }

      const itemTotal = product[0].price * parseInt(item.quantity);
      subtotal += itemTotal;

      validatedItems.push({
        productId: parseInt(item.productId),
        productName: product[0].name,
        quantity: parseInt(item.quantity),
        unitPrice: product[0].price,
        totalPrice: itemTotal
      });
    }

    // If leadId provided, validate it
    if (leadId) {
      const lead = await db.select()
        .from(leads)
        .where(and(
          eq(leads.id, parseInt(leadId)),
          eq(leads.userId, user.id)
        ))
        .limit(1);

      if (lead.length === 0) {
        return NextResponse.json({
          error: "Lead not found",
          code: "LEAD_NOT_FOUND"
        }, { status: 404 });
      }
    }

    // Calculate tax (simple 18% GST for demo)
    const taxAmount = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + taxAmount;

    const now = new Date().toISOString();
    const invoiceNumber = `INV-${Date.now()}`;

    // Create order header
    const newOrder = await db.insert(orders)
      .values({
        userId: user.id,
        leadId: leadId ? parseInt(leadId) : null,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail || null,
        shippingAddress: shippingAddress || null,
        subtotal,
        taxAmount,
        totalAmount,
        status: orderStatus || 'pending',
        paymentStatus: 'unpaid',
        paymentMethod: paymentMethod || null,
        invoiceNumber,
        orderDate: orderDate || now,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    const orderId = newOrder[0].id;

    // Create order line items
    for (const item of validatedItems) {
      await db.insert(orderItems).values({
        orderId,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        createdAt: now
      });
    }

    return NextResponse.json({ ...newOrder[0], items: validatedItems }, { status: 201 });

  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error.message
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED"
      }, { status: 400 });
    }

    // Check order exists and belongs to user
    const existingOrder = await db.select()
      .from(orders)
      .where(and(
        eq(orders.id, parseInt(id)),
        eq(orders.userId, user.id)
      ))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json({
        error: 'Order not found'
      }, { status: 404 });
    }

    const {
      status: orderStatus,
      paymentMethod,
      paymentStatus,
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      orderDate
    } = body;

    // Validate status if provided
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (orderStatus && !validStatuses.includes(orderStatus)) {
      return NextResponse.json({
        error: "Status must be one of: pending, confirmed, shipped, delivered, cancelled",
        code: "INVALID_STATUS"
      }, { status: 400 });
    }

    // Validate payment status if provided
    const validPaymentStatuses = ['unpaid', 'paid', 'refunded'];
    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json({
        error: "Payment status must be one of: unpaid, paid, refunded",
        code: "INVALID_PAYMENT_STATUS"
      }, { status: 400 });
    }

    // Validate customerName if provided
    if (customerName !== undefined && customerName.trim() === '') {
      return NextResponse.json({
        error: "Customer name cannot be empty",
        code: "INVALID_CUSTOMER_NAME"
      }, { status: 400 });
    }

    // Validate customerPhone if provided
    if (customerPhone !== undefined && customerPhone.trim() === '') {
      return NextResponse.json({
        error: "Customer phone cannot be empty",
        code: "INVALID_CUSTOMER_PHONE"
      }, { status: 400 });
    }

    // Build update object
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (orderStatus !== undefined) updates.status = orderStatus;
    if (paymentStatus !== undefined) updates.paymentStatus = paymentStatus;
    if (paymentMethod !== undefined) updates.paymentMethod = paymentMethod;
    if (customerName !== undefined) updates.customerName = customerName.trim();
    if (customerPhone !== undefined) updates.customerPhone = customerPhone.trim();
    if (customerEmail !== undefined) updates.customerEmail = customerEmail;
    if (shippingAddress !== undefined) updates.shippingAddress = shippingAddress;
    if (orderDate !== undefined) updates.orderDate = orderDate;

    const updated = await db.update(orders)
      .set(updates)
      .where(and(
        eq(orders.id, parseInt(id)),
        eq(orders.userId, user.id)
      ))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({
        error: 'Order not found'
      }, { status: 404 });
    }

    return NextResponse.json(updated[0]);

  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error.message
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    // Check order exists and belongs to user
    const existingOrder = await db.select()
      .from(orders)
      .where(and(
        eq(orders.id, parseInt(id)),
        eq(orders.userId, user.id)
      ))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json({
        error: 'Order not found'
      }, { status: 404 });
    }

    const deleted = await db.delete(orders)
      .where(and(
        eq(orders.id, parseInt(id)),
        eq(orders.userId, user.id)
      ))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({
        error: 'Order not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Order deleted successfully',
      order: deleted[0]
    });

  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error.message
    }, { status: 500 });
  }
}