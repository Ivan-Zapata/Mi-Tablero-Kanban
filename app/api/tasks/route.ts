import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { Task } from '../../../types';

export async function GET() {
  try {
    const result = await query(
      `SELECT id, title, description, status, position 
       FROM tasks 
       ORDER BY position ASC`
    );
    return NextResponse.json(result.rows || []);
  } catch (error: any) {
    console.error('API Error detailed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, status, position } = body;

    const result = await query(
      `INSERT INTO tasks (title, description, status, position)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [title, description || '', status, position]
    );

    const newId = result.rows[0].id;
    return NextResponse.json({ success: true, id: newId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, description, status, position } = body;

    // Dynamic SQL construction
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (position !== undefined) {
      updates.push(`position = $${paramIndex++}`);
      values.push(position);
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: true });
    }

    values.push(id);
    const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramIndex}`;

    await query(sql, values);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('PUT Error:', error);
    return NextResponse.json(
      { error: 'Failed to update task', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await query(`DELETE FROM tasks WHERE id = $1`, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
