import json
import os
import psycopg2


ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'wedding2026')


def handler(event: dict, context) -> dict:
    """Сохраняет данные свадебного сайта в БД (только для администратора)."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = event.get('headers') or {}
    token = headers.get('X-Admin-Token') or headers.get('x-admin-token', '')
    if token != ADMIN_PASSWORD:
        return {
            'statusCode': 403,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'forbidden'})
        }

    body = json.loads(event.get('body') or '{}')
    data_json = json.dumps(body, ensure_ascii=False)

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
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
    conn.close()

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True})
    }
