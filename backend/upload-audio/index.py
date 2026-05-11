import json
import os
import base64
import uuid
import hashlib
import hmac
import datetime
import urllib.request
import urllib.error


def handler(event: dict, context) -> dict:
    """Загрузка аудиофайла в S3 для фоновой музыки свадебного сайта"""
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
    audio_data = body.get("audio", "")
    content_type = body.get("contentType", "audio/mpeg")
    filename = body.get("filename", "track.mp3")

    if not audio_data:
        return {
            "statusCode": 400,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "No audio data"}),
        }

    if "," in audio_data:
        audio_data = audio_data.split(",", 1)[1]

    audio_bytes = base64.b64decode(audio_data)

    ext = filename.rsplit(".", 1)[-1] if "." in filename else "mp3"
    safe_name = filename.rsplit(".", 1)[0][:40].replace(" ", "_")
    key = f"wedding-audio/{uuid.uuid4()}_{safe_name}.{ext}"

    access_key = os.environ["AWS_ACCESS_KEY_ID"]
    secret_key = os.environ["AWS_SECRET_ACCESS_KEY"]
    host = "bucket.poehali.dev"
    bucket = "files"
    region = "us-east-1"

    t = datetime.datetime.utcnow()
    amzdate = t.strftime("%Y%m%dT%H%M%SZ")
    datestamp = t.strftime("%Y%m%d")

    payload_hash = hashlib.sha256(audio_bytes).hexdigest()
    canonical_uri = f"/{bucket}/{key}"
    canonical_headers = (
        f"content-type:{content_type}\n"
        f"host:{host}\n"
        f"x-amz-content-sha256:{payload_hash}\n"
        f"x-amz-date:{amzdate}\n"
    )
    signed_headers = "content-type;host;x-amz-content-sha256;x-amz-date"
    canonical_request = "\n".join([
        "PUT", canonical_uri, "",
        canonical_headers, signed_headers, payload_hash,
    ])

    credential_scope = f"{datestamp}/{region}/s3/aws4_request"
    string_to_sign = "\n".join([
        "AWS4-HMAC-SHA256", amzdate, credential_scope,
        hashlib.sha256(canonical_request.encode()).hexdigest(),
    ])

    def sign(key_bytes, msg):
        return hmac.new(key_bytes, msg.encode(), hashlib.sha256).digest()

    k_date = sign(("AWS4" + secret_key).encode(), datestamp)
    k_region = sign(k_date, region)
    k_service = sign(k_region, "s3")
    k_signing = sign(k_service, "aws4_request")
    signature = hmac.new(k_signing, string_to_sign.encode(), hashlib.sha256).hexdigest()

    authorization = (
        f"AWS4-HMAC-SHA256 Credential={access_key}/{credential_scope}, "
        f"SignedHeaders={signed_headers}, Signature={signature}"
    )

    url = f"https://{host}/{bucket}/{key}"
    req = urllib.request.Request(url, data=audio_bytes, method="PUT")
    req.add_header("Content-Type", content_type)
    req.add_header("Host", host)
    req.add_header("X-Amz-Content-Sha256", payload_hash)
    req.add_header("X-Amz-Date", amzdate)
    req.add_header("Authorization", authorization)
    req.add_header("Content-Length", str(len(audio_bytes)))

    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            resp.read()
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": f"S3 error {e.code}: {err_body}"}),
        }

    cdn_url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{key}"

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"url": cdn_url, "filename": filename}),
    }
