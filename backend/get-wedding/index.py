import json
import os
import psycopg2


ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'wedding2026')
CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
}


def _db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def _ok(body, status: int = 200) -> dict:
    return {'statusCode': status, 'headers': CORS_HEADERS, 'body': json.dumps(body, ensure_ascii=False)}


def _err(msg: str, status: int = 400) -> dict:
    return {'statusCode': status, 'headers': CORS_HEADERS, 'body': json.dumps({'error': msg})}


def handle_guests(headers: dict) -> dict:
    """Возвращает список гостей (только для администратора)."""
    token = headers.get('X-Admin-Token') or headers.get('x-admin-token', '')
    if token != ADMIN_PASSWORD:
        return _err('forbidden', 403)

    conn = None
    try:
        conn = _db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, name, email, phone, guests_count, menu, wishes, attending,
                   registered_at AT TIME ZONE 'UTC' AS registered_at
            FROM wedding_guests
            ORDER BY registered_at DESC
            """
        )
        rows = cur.fetchall()
        cur.close()
    except Exception as e:
        return _err(f'db_error: {str(e)[:200]}', 500)
    finally:
        if conn:
            try:
                conn.close()
            except Exception:
                pass

    guests = [
        {
            'id': r[0],
            'name': r[1],
            'email': r[2],
            'phone': r[3],
            'guests': r[4],
            'menu': r[5],
            'wishes': r[6],
            'attending': r[7],
            'registeredAt': r[8].isoformat() if r[8] else None,
        }
        for r in rows
    ]

    yes_count = sum(1 for g in guests if g['attending'] == 'yes')
    total_guests = sum(int(g['guests'] or 1) for g in guests if g['attending'] == 'yes')

    return _ok({
        'guests': guests,
        'stats': {
            'total': len(guests),
            'attending_yes': yes_count,
            'attending_no': len(guests) - yes_count,
            'total_guests': total_guests,
        },
    })


def handler(event: dict, context) -> dict:
    """Возвращает данные свадьбы или список гостей из БД."""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
        }

    params = event.get('queryStringParameters') or {}
    mode = params.get('mode', '')

    # Маршрут для получения списка гостей (только admin)
    if mode == 'guests':
        return handle_guests(event.get('headers') or {})

    # Основной маршрут: данные свадьбы (публичный)
    conn = None
    data = {}
    try:
        conn = _db()
        cur = conn.cursor()
        cur.execute("SELECT data FROM wedding_data WHERE site_id = 'main' LIMIT 1")
        row = cur.fetchone()
        cur.close()
        data = row[0] if row else {}
    except Exception as e:
        return _err(f'db_error: {str(e)[:200]}', 500)
    finally:
        if conn:
            try:
                conn.close()
            except Exception:
                pass

    return _ok(data)
