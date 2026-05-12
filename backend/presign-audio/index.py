import json
import os
import uuid
import hashlib
import hmac
import datetime


def _sign(key_bytes: bytes, msg: str) -> bytes:
    return hmac.HMAC(key_bytes, msg.encode("utf-8"), hashlib.sha256).digest()


def handler(event: dict, context) -> dict:
    """Генерирует presigned PUT URL для загрузки аудио напрямую в S3"""
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "86400",
            },
            "body": "",
        }

    body = json.loads(event.get("body") or "{}")
    filename = body.get("filename", "track.mp3")
    content_type = body.get("contentType", "audio/mpeg")

    ext = filename.rsplit(".", 1)[-1] if "." in filename else "mp3"
    safe_name = filename.rsplit(".", 1)[0][:40].replace(" ", "_")
    key = f"wedding-audio/{uuid.uuid4()}_{safe_name}.{ext}"

    access_key = os.environ["AWS_ACCESS_KEY_ID"]
    secret_key = os.environ["AWS_SECRET_ACCESS_KEY"]
    host = "bucket.poehali.dev"
    bucket = "files"
    region = "us-east-1"
    expires = 600  # 10 минут

    t = datetime.datetime.utcnow()
    amzdate = t.strftime("%Y%m%dT%H%M%SZ")
    datestamp = t.strftime("%Y%m%d")

    credential_scope = f"{datestamp}/{region}/s3/aws4_request"
    credential = f"{access_key}/{credential_scope}"

    canonical_uri = f"/{bucket}/{key}"
    canonical_querystring = "&".join([
        f"X-Amz-Algorithm=AWS4-HMAC-SHA256",
        f"X-Amz-Credential={credential.replace('/', '%2F')}",
        f"X-Amz-Date={amzdate}",
        f"X-Amz-Expires={expires}",
        f"X-Amz-SignedHeaders=content-type%3Bhost",
    ])
    canonical_headers = f"content-type:{content_type}\nhost:{host}\n"
    signed_headers = "content-type;host"

    canonical_request = "\n".join([
        "PUT", canonical_uri, canonical_querystring,
        canonical_headers, signed_headers, "UNSIGNED-PAYLOAD",
    ])

    string_to_sign = "\n".join([
        "AWS4-HMAC-SHA256", amzdate, credential_scope,
        hashlib.sha256(canonical_request.encode("utf-8")).hexdigest(),
    ])

    k_date = _sign(("AWS4" + secret_key).encode("utf-8"), datestamp)
    k_region = _sign(k_date, region)
    k_service = _sign(k_region, "s3")
    k_signing = _sign(k_service, "aws4_request")
    signature = hmac.HMAC(k_signing, string_to_sign.encode("utf-8"), hashlib.sha256).hexdigest()

    presigned_url = (
        f"https://{host}/{bucket}/{key}"
        f"?X-Amz-Algorithm=AWS4-HMAC-SHA256"
        f"&X-Amz-Credential={credential.replace('/', '%2F')}"
        f"&X-Amz-Date={amzdate}"
        f"&X-Amz-Expires={expires}"
        f"&X-Amz-SignedHeaders=content-type%3Bhost"
        f"&X-Amz-Signature={signature}"
    )

    cdn_url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{key}"

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"uploadUrl": presigned_url, "cdnUrl": cdn_url}),
    }
