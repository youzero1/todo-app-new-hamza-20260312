import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { Todo } from '@/lib/entities/Todo';

interface RouteParams {
  params: { id: string };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json() as {
      title?: string;
      description?: string;
      completed?: boolean;
    };

    const ds = await getDataSource();
    const todoRepo = ds.getRepository(Todo);

    const todo = await todoRepo.findOne({ where: { id } });
    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || body.title.trim() === '') {
        return NextResponse.json(
          { error: 'Title must be a non-empty string' },
          { status: 400 }
        );
      }
      todo.title = body.title.trim();
    }

    if (body.description !== undefined) {
      todo.description = body.description?.trim() || null;
    }

    if (body.completed !== undefined) {
      todo.completed = Boolean(body.completed);
    }

    const updated = await todoRepo.save(todo);
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('PUT /api/todos/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const ds = await getDataSource();
    const todoRepo = ds.getRepository(Todo);

    const todo = await todoRepo.findOne({ where: { id } });
    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    await todoRepo.remove(todo);
    return NextResponse.json({ message: 'Todo deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/todos/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}
