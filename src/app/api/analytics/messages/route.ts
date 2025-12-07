import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { messages, leads } from '@/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

interface AnalyticsSeries {
  date: string;
  messages: number;
  inboundMessages: number;
  outboundMessages: number;
  leads: number;
  responseRate: number;
}

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    
    // Query parameters
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const granularity = searchParams.get('granularity') ?? 'daily';

    // Validate granularity
    if (!['daily', 'weekly', 'monthly'].includes(granularity)) {
      return NextResponse.json({ 
        error: 'Invalid granularity. Must be daily, weekly, or monthly',
        code: 'INVALID_GRANULARITY'
      }, { status: 400 });
    }

    // Determine date grouping SQL based on granularity
    let dateGroupSql;
    switch (granularity) {
      case 'weekly':
        dateGroupSql = sql<string>`DATE(${messages.createdAt}, 'weekday 0', '-6 days')`;
        break;
      case 'monthly':
        dateGroupSql = sql<string>`strftime('%Y-%m', ${messages.createdAt})`;
        break;
      default: // daily
        dateGroupSql = sql<string>`DATE(${messages.createdAt})`;
    }

    // Build where conditions for messages
    const messageConditions = [eq(messages.userId, userId)];
    if (from) {
      messageConditions.push(gte(messages.createdAt, from));
    }
    if (to) {
      messageConditions.push(lte(messages.createdAt, to));
    }

    // Query messages with grouping
    const messagesQuery = db
      .select({
        date: dateGroupSql,
        totalMessages: sql<number>`COUNT(*)`,
        inboundMessages: sql<number>`SUM(CASE WHEN ${messages.direction} = 'inbound' THEN 1 ELSE 0 END)`,
        outboundMessages: sql<number>`SUM(CASE WHEN ${messages.direction} = 'outbound' THEN 1 ELSE 0 END)`,
      })
      .from(messages)
      .where(and(...messageConditions))
      .groupBy(dateGroupSql);

    const messagesData = await messagesQuery;

    // Build where conditions for leads
    const leadConditions = [eq(leads.userId, userId)];
    if (from) {
      leadConditions.push(gte(leads.createdAt, from));
    }
    if (to) {
      leadConditions.push(lte(leads.createdAt, to));
    }

    // Determine date grouping SQL for leads based on granularity
    let leadsDateGroupSql;
    switch (granularity) {
      case 'weekly':
        leadsDateGroupSql = sql<string>`DATE(${leads.createdAt}, 'weekday 0', '-6 days')`;
        break;
      case 'monthly':
        leadsDateGroupSql = sql<string>`strftime('%Y-%m', ${leads.createdAt})`;
        break;
      default: // daily
        leadsDateGroupSql = sql<string>`DATE(${leads.createdAt})`;
    }

    // Query leads with grouping
    const leadsQuery = db
      .select({
        date: leadsDateGroupSql,
        leadsCount: sql<number>`COUNT(*)`,
      })
      .from(leads)
      .where(and(...leadConditions))
      .groupBy(leadsDateGroupSql);

    const leadsData = await leadsQuery;

    // Create a map for leads by date
    const leadsMap = new Map<string, number>();
    leadsData.forEach(lead => {
      leadsMap.set(lead.date, lead.leadsCount);
    });

    // Combine data and calculate response rate
    const series: AnalyticsSeries[] = messagesData.map(msg => {
      const totalInOut = msg.inboundMessages + msg.outboundMessages;
      const responseRate = totalInOut > 0 ? msg.inboundMessages / totalInOut : 0;

      return {
        date: msg.date,
        messages: msg.totalMessages,
        inboundMessages: msg.inboundMessages,
        outboundMessages: msg.outboundMessages,
        leads: leadsMap.get(msg.date) ?? 0,
        responseRate: Math.round(responseRate * 100) / 100, // Round to 2 decimal places
      };
    });

    // Add dates that have leads but no messages
    leadsData.forEach(lead => {
      if (!messagesData.find(msg => msg.date === lead.date)) {
        series.push({
          date: lead.date,
          messages: 0,
          inboundMessages: 0,
          outboundMessages: 0,
          leads: lead.leadsCount,
          responseRate: 0,
        });
      }
    });

    // Sort by date ascending
    series.sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ series }, { status: 200 });

  } catch (error) {
    console.error('GET /api/analytics/messages error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}