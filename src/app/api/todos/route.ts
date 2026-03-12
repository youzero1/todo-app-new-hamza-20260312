import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { Todo } from '@/lib/entities/Todo';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const ds = await getDataSource();
    const todoRepo = ds.getRepository(Todo);
    const todos = await todoRepo.find({
      order: { createdAt: 'DESC' },
    });
    return NextResponse.json(todos, { status: 200 });
  } catch (error) {
    console.error('GET /api/todos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { title?: string; description?: string };

    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const ds = await getDataSource();
    const todoRepo = ds.getRepository(Todo);

    const todo = new Todo();
    todo.id = uuidv4();
    todo.title = body.title.trim();
    todo.description = body.description?.trim() || null;
    todo.completed = false;

    const saved = await todoRepo.save(todo);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('POST /api/todos error:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}
