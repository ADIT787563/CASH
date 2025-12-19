import { db } from "@/db";
import { orders, orderTimeline, auditLogs, payments } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export type OrderStatus = 'created' | 'pending' | 'paid' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'unpaid' | 'pending_verification' | 'paid' | 'failed' | 'refunded' | 'pending_cod';

export class OrderLogic {
    /**
     * Updates an order's status and ensures it follows transition rules.
     */
    static async transitionStatus(
        orderId: number,
        userId: string,
        newStatus: OrderStatus,
        note?: string
    ) {
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId)
        });

        if (!order) throw new Error("Order not found");
        if (order.userId !== userId) throw new Error("Unauthorized");

        // Simple validation: Can't move from 'cancelled' to 'shipped', etc.
        if (order.status === 'cancelled' && newStatus !== 'cancelled') {
            throw new Error("Cannot transition a cancelled order.");
        }

        const updateData: any = {
            status: newStatus,
            updatedAt: new Date().toISOString()
        };

        // Automatic payment status mapping
        if (newStatus === 'paid' || newStatus === 'confirmed') {
            updateData.paymentStatus = 'paid';
        } else if (newStatus === 'cancelled') {
            // Keep current payment status unless we explicitly refund
        } else if (newStatus === 'refunded') {
            updateData.paymentStatus = 'refunded';
        }

        await db.update(orders)
            .set(updateData)
            .where(eq(orders.id, orderId));

        // Add to timeline
        await db.insert(orderTimeline).values({
            orderId,
            status: newStatus,
            note: note || `Order status updated to ${newStatus}`,
            createdBy: userId,
            createdAt: new Date().toISOString()
        });

        // Audit Log
        await db.insert(auditLogs).values({
            userId,
            action: `order_status_${newStatus}`,
            description: `Order #${orderId} moved to ${newStatus}`,
            itemType: 'order',
            itemId: orderId.toString(),
            category: 'user_action',
            severity: newStatus === 'cancelled' || newStatus === 'refunded' ? 'warning' : 'info',
            createdAt: new Date().toISOString()
        });
    }

    /**
     * Specifically handles payment confirmation to prevent double confirmation.
     */
    static async confirmPayment(orderId: number, userId: string, method: string, reference?: string) {
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId)
        });

        if (!order) throw new Error("Order not found");
        if (order.paymentStatus === 'paid') {
            throw new Error("Order is already marked as paid.");
        }

        // Update Order
        await db.update(orders).set({
            paymentStatus: 'paid',
            status: 'confirmed', // Move to confirmed automatically on pay
            paymentMethod: method,
            utrNumber: reference || order.utrNumber,
            updatedAt: new Date().toISOString()
        }).where(eq(orders.id, orderId));

        // Create Payment Record
        await db.insert(payments).values({
            orderId,
            sellerId: order.userId,
            method,
            amount: order.totalAmount,
            currency: 'INR',
            status: 'captured',
            upiReference: reference,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        // Log Timeline
        await db.insert(orderTimeline).values({
            orderId,
            status: 'paid',
            note: `Payment confirmed via ${method}. Reference: ${reference || 'N/A'}`,
            createdBy: userId,
            createdAt: new Date().toISOString()
        });
    }
}
