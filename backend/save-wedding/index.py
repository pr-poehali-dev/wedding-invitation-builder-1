import json
import os
import psycopg2


ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'wedding2026')
CORS = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}


def _ok(body):
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(body, ensure_ascii=False)}


def _err(msg, status=400):
    return {'statusCode': status, 'headers': CORS, 'body': json.dumps({'error': msg})}


def _db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def save_guest(body: dict) -> dict:
    """Сохраняет регистрацию гостя в wedding_guests."""
    name = (body.get('name') or '').strip()[:200]
    attending = body.get('attending', '')
    if not name or attending not in ('yes', 'no'):
        return _err('name and attending are required')

    email = (body.get('email') or '').strip()[:200]
    phone = (body.get('phone') or '').strip()[:50]
    guests_count = str(body.get('guests') or '1')[:5]
    menu = (body.get('menu') or '').strip()[:200]
    wishes = (body.get('wishes') or '').strip()[:1000]

    conn = None
    try:
        conn = _db()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO wedding_guests (name, email, phone, guests_count, menu, wishes, attending)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (name, email, phone, guests_count, menu, wishes, attending),
        )
        guest_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
    except Exception as e:
        return _err(f'db_error: {str(e)[:200]}', 500)
    finally:
        if conn:
            try:
                conn.close()
            except Exception:
                pass

    return _ok({'ok': True, 'id': guest_id})


def handler(event: dict, context) -> dict:
    """Сохраняет данные сайта или регистрацию гостя.
    POST ?mode=guest — публичная регистрация гостя (без токена).
    POST (default) — сохранение настроек сайта (только admin).
    """
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
        }

    try:
        body = json.loads(event.get('body') or '{}')
    except (json.JSONDecodeError, ValueError):
        return _err('invalid_json')

    params = event.get('queryStringParameters') or {}
    mode = params.get('mode', '')

    # Публичный маршрут: регистрация гостя
    if mode == 'guest':
        return save_guest(body)

    # Защищённые маршруты (только admin)
    headers = event.get('headers') or {}
    token = headers.get('X-Admin-Token') or headers.get('x-admin-token', '')
    if token != ADMIN_PASSWORD:
        return _err('forbidden', 403)

    # Очистка списка гостей
    if mode == 'clear-guests':
        conn = None
        try:
            conn = _db()
            cur = conn.cursor()
            cur.execute("DELETE FROM wedding_guests")
            deleted = cur.rowcount
            conn.commit()
            cur.close()
        except Exception as e:
            return _err(f'db_error: {str(e)[:200]}', 500)
        finally:
            if conn:
                try:
                    conn.close()
                except Exception:
                    pass
        return _ok({'ok': True, 'deleted': deleted})

    # Пинг для проверки пароля без записи
    if body.get('__ping'):
        return _ok({'ok': True})

    data_json = json.dumps(body, ensure_ascii=False)
    conn = None
    try:
        conn = _db()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO wedding_data (site_id, data, updated_at)
            VALUES ('main', %s::jsonb, NOW())
            ON CONFLICT (site_id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
            """,
            (data_json,)
        )
        conn.commit()
        cur.close()
    except Exception as e:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        return _err(f'db_error: {str(e)[:200]}', 500)
    finally:
        if conn:
            try:
                conn.close()
            except Exception:
                pass

    return _ok({'ok': True})